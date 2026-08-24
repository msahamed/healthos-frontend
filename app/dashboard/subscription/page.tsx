// /dashboard/subscription — what you're on, and how to change it.
//
// Inside the dashboard shell, so it inherits the session gate in
// layout.tsx and cannot be reached signed out.
//
// The state shown here is DERIVED from the same entitlement code the
// app reads, not from a separate query. If this page and the app ever
// disagreed about whether someone is paid up, the support conversation
// that followed would be unanswerable.
//
// Card changes, invoices and cancellation all live in Stripe's portal.
// We link out rather than rebuild them — the alternative means handling
// card details, which is the one thing worth never touching.

import type { Metadata } from "next";
import { after } from "next/server";
import { accounts, getSessionFromCookies } from "@/lib/auth";
import { sendTrialStarted } from "@/lib/billing-email";
import {
  ENTITLEMENT_FIELDS,
  entitlementFor,
  trialDays,
  type Entitlement,
} from "@/lib/entitlement";
import Link from "next/link";
import Controls from "./Controls";
import Subscribe from "./Subscribe";
import ManageButton from "./ManageButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subscription — Ontor",
  robots: { index: false, follow: false },
};

function when(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Headline, supporting line, and whether checkout is the next step. */
function copyFor(e: Entitlement): {
  status: string;
  tone: "good" | "warn" | "plain";
  detail: string;
  cta: "checkout" | "manage" | "resume" | "trial" | "none";
} {
  switch (e.state) {
    case "active":
      return e.reason === "comped"
        ? {
            status: "Active",
            tone: "good",
            detail: "You have full access, with our thanks. Nothing to pay.",
            cta: "none",
          }
        : e.ends_at_expiry
        ? {
            // Cancelled, but still inside the paid period. Saying
            // "renews" here would be a lie the customer discovers on
            // the day it stops working.
            status: "Cancelled",
            tone: "warn",
            detail: `You keep access until ${when(e.expires_at)}. It won't renew after that.`,
            cta: "resume",
          }
        : {
            status: "Active",
            tone: "good",
            detail: `Renews ${when(e.expires_at)}.`,
            cta: "manage",
          };
    case "trial":
      return {
        status: "Free trial",
        tone: "good",
        detail: `${e.days_left} ${e.days_left === 1 ? "day" : "days"} left. Ends ${when(e.expires_at)}.`,
        cta: "checkout",
      };
    case "expired":
      return {
        status: e.reason === "lapsed" ? "Subscription ended" : "Trial ended",
        tone: "warn",
        detail:
          e.reason === "lapsed"
            ? "Your subscription is no longer active."
            : `Your free trial ended ${when(e.expires_at)}.`,
        cta: "checkout",
      };
    default:
      return {
        status: "No subscription",
        tone: "plain",
        detail: "Start with a 14-day free trial. No card, nothing to cancel.",
        cta: "trial",
      };
  }
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Begin the trial for anyone who has never had access.
 *
 * The server's own record is what decides this, not a query parameter
 * or which link was followed: an entitlement of "none" means no trial
 * has ever run and nothing has ever been paid, which is exactly the
 * person a trial is for. Deciding from state rather than intent means
 * there is no path that can lose the intent on the way here.
 *
 * The Mongo filter only stamps when the field is absent, so two tabs
 * opening at once cannot produce two trials, and returns whether this
 * call was the one that started it — the email goes out only then.
 *
 * The email is handed to after(), which runs it once the response has
 * been sent. Awaiting a call to Resend here held the page back by a
 * second or more, and during that wait the browser still showed the
 * PREVIOUS screen with its buttons live — long enough to press "Start
 * free trial" or "Subscribe" on a view that was already stale. Nothing
 * about access depends on the email, so nothing should wait for it.
 */
async function beginTrialIfNew(email: string, state: string): Promise<boolean> {
  if (state !== "none") return false;
  const col = await accounts();
  const days = trialDays();
  const res = await col.updateOne(
    { email, trial_started_at: { $exists: false }, comped: { $ne: true } },
    { $set: { trial_started_at: new Date(), trial_days: days } },
  );
  if (res.modifiedCount === 0) return false;
  after(sendTrialStarted(email, new Date(Date.now() + days * DAY_MS), days));
  return true;
}

export default async function SubscriptionPage() {
  const session = await getSessionFromCookies();
  // layout.tsx already redirects, so this only guards the types.
  if (!session) return null;

  const col = await accounts();
  const read = async () =>
    col.findOne(
      { email: session.email },
      // Shared with the API so the two cannot drift. stripe_customer_id is
      // this page's own extra — it decides whether a portal link is offered.
      { projection: { ...ENTITLEMENT_FIELDS, stripe_customer_id: 1 } },
    );

  let account = await read();
  let ent = entitlementFor(account);

  // Existing customers fall straight through: their state is not "none",
  // so nothing starts and they see exactly what they had.
  const justStarted = await beginTrialIfNew(session.email, ent.state);
  if (justStarted) {
    account = await read();
    ent = entitlementFor(account);
  }
  const c = copyFor(ent);
  const hasCustomer = Boolean(account?.stripe_customer_id);

  const dot =
    c.tone === "good"
      ? "var(--teal)"
      : c.tone === "warn"
        ? "var(--above)"
        : "var(--ink-mute)";

  return (
    <div style={{ maxWidth: 620 }}>
      {/* The trial begins without a second click, so say so plainly.
          Starting something on someone's behalf and staying quiet about
          it is how people end up feeling signed up rather than served. */}
      {justStarted && (
        <p
          style={{
            margin: "0 0 22px",
            padding: "12px 16px",
            borderRadius: 12,
            background: "var(--teal-surface)",
            color: "var(--teal)",
            fontWeight: 600,
          }}
        >
          Your free trial has started. Nothing to pay, nothing to cancel.
        </p>
      )}

      <h1 style={{ marginBottom: 6 }}>Subscription</h1>
      <p style={{ color: "var(--ink-soft)", marginTop: 0 }}>{session.email}</p>

      <section
        style={{
          marginTop: 26,
          padding: "22px 24px",
          border: "1px solid var(--line)",
          borderRadius: 18,
          background: "var(--paper)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            aria-hidden="true"
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: dot,
              flex: "none",
            }}
          />
          <strong style={{ fontSize: 18 }}>{c.status}</strong>
        </div>

        <p style={{ color: "var(--ink-soft)", margin: "10px 0 0", lineHeight: 1.6 }}>
          {c.detail}
        </p>

        <div style={{ marginTop: 20 }}>
          {(c.cta === "manage" || c.cta === "resume") && (
            <Controls
              cancelled={c.cta === "resume"}
              accessUntil={when(ent.expires_at)}
            />
          )}
          {c.cta === "checkout" && (
            <Subscribe label={ent.state === "trial" ? "Keep Ontor" : "Subscribe"} />
          )}
          {/* Never trialed, never paid. The trial is the point of this
              screen, so it is the one button that stands out; paying is
              offered underneath for anyone who would rather skip it. */}
          {c.cta === "trial" && (
            <>
              <Link href="/start-trial/" className="btn btn-primary">
                Start free trial
              </Link>
              <div style={{ marginTop: 22 }}>
                <p style={{ color: "var(--ink-mute)", fontSize: 14, margin: "0 0 10px" }}>
                  Or skip the trial and subscribe now.
                </p>
                <Subscribe label="Subscribe" />
              </div>
            </>
          )}
        </div>
      </section>

      {/* Quiet on purpose. Most people here are managing billing and
          already have it installed; this is for the ones who paid on the
          web and have not got round to it. */}
      <p style={{ color: "var(--ink-mute)", fontSize: 14, marginTop: 20 }}>
        Not installed yet?{" "}
        <Link href="/install/" style={{ color: "var(--teal)", fontWeight: 600 }}>
          Get Ontor for Mac, Windows, iPhone or Android
        </Link>
      </p>

      {hasCustomer && (
        <section style={{ marginTop: 22 }}>
          <ManageButton label="Payment method and invoices" />
          <p style={{ color: "var(--ink-mute)", fontSize: 14, marginTop: 10, lineHeight: 1.6 }}>
            Card details and receipts are held by Stripe, not by us. That page
            opens on their site.
          </p>
        </section>
      )}
    </div>
  );
}
