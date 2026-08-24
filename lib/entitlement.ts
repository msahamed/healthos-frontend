// What a person is allowed to use, and why.
//
// The client never decides this and never sees a price. It asks this
// server for one word — none / trial / active / expired — renders that
// state, and gates on it. Payment happens on the website; the app is
// only ever a reader of the answer. That split is what keeps Apple and
// Google out of the loop entirely: nothing is ever sold in-app, so
// there is no in-app purchase for them to require.
//
// We store FACTS (when the trial began, what Stripe last told us) and
// derive the state on every read. Storing a status field instead would
// mean a trial that "expires" only when something remembers to run —
// a cron that silently dies leaves people on a free ride forever.
// Derivation has no such failure mode: the clock is the source of truth.

import { accounts, type AccountDoc } from "@/lib/auth";

/** Default trial length. Server-side so it changes without an app release. */
export const DEFAULT_TRIAL_DAYS = 14;

export function trialDays(): number {
  const raw = Number(process.env.TRIAL_DAYS);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : DEFAULT_TRIAL_DAYS;
}

/**
 * - `none`    — never started a trial. The client offers to start one.
 * - `trial`   — inside the trial window.
 * - `active`  — paying, or comped forever.
 * - `expired` — trial ran out, or the subscription lapsed.
 */
export type EntitlementState = "none" | "trial" | "active" | "expired";

export interface Entitlement {
  state: EntitlementState;
  /** Whole days remaining, rounded UP so the last partial day still counts. */
  days_left: number | null;
  /** When the current entitlement runs out. Null when it never does. */
  expires_at: string | null;
  /**
   * True when [expires_at] is the END, not a renewal date — a cancelled
   * subscription serving out its paid time. Callers must not say
   * "renews" without checking this.
   */
  ends_at_expiry: boolean;
  /** Why they have access — shown to nobody, useful in support and logs. */
  reason: "comped" | "subscription" | "trial" | "none" | "lapsed";
}

const DAY_MS = 24 * 60 * 60 * 1000;

function daysUntil(when: Date, now: Date): number {
  return Math.max(0, Math.ceil((when.getTime() - now.getTime()) / DAY_MS));
}

/**
 * Derive the entitlement from an account row.
 *
 * Order matters: comped beats everything (these are the pilot users who
 * carried the product — they are never to be locked out), then a live
 * subscription, then the trial clock.
 */
export function entitlementFor(
  account: Pick<
    AccountDoc,
    | "comped"
    | "trial_started_at"
    | "trial_days"
    | "subscription_status"
    | "current_period_end"
    | "cancel_at_period_end"
  > | null,
  now: Date = new Date(),
): Entitlement {
  if (!account) {
    return {
      state: "none",
      days_left: null,
      expires_at: null,
      ends_at_expiry: false,
      reason: "none",
    };
  }

  if (account.comped) {
    return {
      state: "active",
      days_left: null,
      expires_at: null,
      ends_at_expiry: false,
      reason: "comped",
    };
  }

  // A paid-for period that has not ended yet grants access, whatever
  // Stripe's status string says. Status alone is the wrong test in three
  // ordinary cases: `past_due` means a card is being retried, and locking
  // someone out mid-dunning churns a customer who meant to pay;
  // cancel-at-period-end leaves a real, already-paid period to serve out;
  // and an immediate cancellation can leave a future period end behind.
  // The date is what they bought, so the date is what we honour. It errs
  // toward giving a few extra days rather than locking out someone who
  // paid — the cheaper mistake by far.
  const periodEnd = account.current_period_end ?? null;
  const paid = account.subscription_status != null;
  if (periodEnd && periodEnd.getTime() > now.getTime()) {
    return {
      state: "active",
      days_left: daysUntil(periodEnd, now),
      expires_at: periodEnd.toISOString(),
      ends_at_expiry: Boolean(account.cancel_at_period_end),
      reason: "subscription",
    };
  }

  const started = account.trial_started_at ?? null;
  if (!started) {
    // Never subscribed, never trialed — or subscribed once and lapsed
    // without ever having had a trial. Offer the trial; the endpoint
    // that starts one refuses a second.
    return paid || periodEnd
      ? {
          state: "expired",
          days_left: 0,
          expires_at: periodEnd?.toISOString() ?? null,
          ends_at_expiry: true,
          reason: "lapsed",
        }
      : {
          state: "none",
          days_left: null,
          expires_at: null,
          ends_at_expiry: false,
          reason: "none",
        };
  }

  const days = account.trial_days ?? trialDays();
  const endsAt = new Date(started.getTime() + days * DAY_MS);
  if (endsAt.getTime() > now.getTime()) {
    return {
      state: "trial",
      days_left: daysUntil(endsAt, now),
      expires_at: endsAt.toISOString(),
      ends_at_expiry: true,
      reason: "trial",
    };
  }

  return {
    state: "expired",
    days_left: 0,
    expires_at: endsAt.toISOString(),
    ends_at_expiry: true,
    reason: periodEnd ? "lapsed" : "trial",
  };
}

/** Read one account and derive its entitlement. */
export async function entitlementForEmail(email: string): Promise<Entitlement> {
  const col = await accounts();
  const doc = await col.findOne(
    { email },
    {
      projection: {
        comped: 1,
        trial_started_at: 1,
        trial_days: 1,
        subscription_status: 1,
        current_period_end: 1,
        cancel_at_period_end: 1,
      },
    },
  );
  return entitlementFor(doc);
}

/**
 * How much of the product someone has actually used during their trial.
 *
 * The trial emails are far stronger when they can say what a person
 * built rather than that a clock ran out — and for Ontor "what you
 * built" is literal. Every reading is scored against that person's own
 * baseline, so a lapsed trial genuinely does mean starting the
 * measurement over. Naming the number makes that concrete.
 *
 * Returns zeros rather than throwing: an email that goes out slightly
 * generic beats an email that does not go out.
 */
export async function trialUsage(
  userId: string,
  since: Date,
): Promise<{ sessions: number; days: number }> {
  try {
    const { getDb } = await import("@/lib/auth");
    const db = await getDb();
    const rows = await db
      .collection("observations")
      .aggregate([
        { $match: { user_id: userId, deleted_at: null, created_at: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: { date: "$created_at", format: "%Y-%m-%d" },
            },
            n: { $sum: 1 },
          },
        },
      ])
      .toArray();
    return {
      sessions: rows.reduce((sum, r) => sum + (r.n as number), 0),
      days: rows.length,
    };
  } catch {
    return { sessions: 0, days: 0 };
  }
}
