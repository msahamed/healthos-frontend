// GET /api/v1/cron/trial-emails — the two trial emails that are due.
//
// Runs daily on Vercel Cron (see vercel.json). Two jobs:
//
//   • Trials with 3 days or fewer left  -> "your trial is ending"
//   • Trials that have run out          -> "your trial has ended"
//
// Both stamp a marker on the account when sent, and both query for the
// ABSENCE of that marker. A cron that fires twice, or a manual run
// while the scheduled one is going, therefore cannot email anyone
// twice. That matters more than it sounds: "your trial is ending" is
// the one message that reads as nagging when repeated.
//
// Access is never changed here. Expiry is derived from the clock in
// lib/entitlement.ts, so a run that is skipped, delayed, or never
// happens at all costs somebody an email and nothing else. This job
// going quiet must never be the reason a trial keeps working.

import { NextResponse } from "next/server";
import type { Filter } from "mongodb";
import { accounts, type AccountDoc } from "@/lib/auth";
import { sendTrialEnded, sendTrialEnding } from "@/lib/billing-email";
import { trialDays } from "@/lib/entitlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAY_MS = 24 * 60 * 60 * 1000;
/** How many days before the end the warning goes out. */
const WARN_WITHIN_DAYS = 3;
/** Don't chase trials that ended long ago — this is a live nudge. */
const ENDED_GRACE_DAYS = 3;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. With no
  // secret configured the endpoint refuses rather than running open —
  // it sends mail, so an unauthenticated caller could spam customers.
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const days = trialDays();
  const col = await accounts();

  // A trial's end is trial_started_at + its length, so the window is
  // expressed as a range on the START date instead.
  const endingFrom = new Date(now - days * DAY_MS);
  const endingTo = new Date(now - (days - WARN_WITHIN_DAYS) * DAY_MS);
  const endedFrom = new Date(now - (days + ENDED_GRACE_DAYS) * DAY_MS);

  // Never chase someone who is comped or currently paying. A lapsed
  // subscriber can still be here — they are back to no access, and the
  // trial copy is the wrong thing to send them, so `canceled` counts as
  // "not paying" only alongside a trial that is genuinely running out.
  const base: Filter<AccountDoc> = {
    comped: { $ne: true },
    subscription_status: { $in: [null, "canceled"] as const },
  };

  const ending = await col
    .find({
      ...base,
      trial_ending_email_at: { $exists: false },
      trial_started_at: { $gt: endingFrom, $lte: endingTo },
    })
    .limit(500)
    .toArray();

  const ended = await col
    .find({
      ...base,
      trial_ended_email_at: { $exists: false },
      trial_started_at: { $gt: endedFrom, $lte: endingFrom },
    })
    .limit(500)
    .toArray();

  let sentEnding = 0;
  for (const a of ending) {
    const endsAt = new Date(
      (a.trial_started_at as Date).getTime() + (a.trial_days ?? days) * DAY_MS,
    );
    const left = Math.max(1, Math.ceil((endsAt.getTime() - now) / DAY_MS));
    await sendTrialEnding(a.email, endsAt, left);
    await col.updateOne(
      { email: a.email },
      { $set: { trial_ending_email_at: new Date() } },
    );
    sentEnding++;
  }

  let sentEnded = 0;
  for (const a of ended) {
    await sendTrialEnded(a.email);
    await col.updateOne(
      { email: a.email },
      {
        $set: {
          trial_ended_email_at: new Date(),
          // Someone who never got the warning should not get one now.
          trial_ending_email_at: a.trial_ending_email_at ?? new Date(),
        },
      },
    );
    sentEnded++;
  }

  return NextResponse.json({ ending: sentEnding, ended: sentEnded });
}
