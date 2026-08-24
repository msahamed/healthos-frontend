// /start-trial — what "Start free trial" on the pricing page points at.
//
// A route rather than a button, so it works for someone who is not
// signed in. Signing in IS the signup: the trial is bound to an email
// server-side, and /login creates the account if there isn't one. So
// the whole path is: click, get a code, have a trial.
//
// Doing this server-side also means the trial cannot be started by a
// stray fetch from a page someone left open. It is a navigation with a
// session behind it, and /trial/start refuses anyone who has already
// trialed or paid.
//
// Everyone lands on the subscription page afterwards, which states what
// they now have and offers the install link. That is a better answer
// than a download page for someone who has just pressed a button about
// billing.

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { accounts, getSessionFromCookies } from "@/lib/auth";
import {
  ENTITLEMENT_FIELDS,
  entitlementFor,
  trialDays,
} from "@/lib/entitlement";
import { sendTrialStarted } from "@/lib/billing-email";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Start your free trial — Ontor",
  robots: { index: false, follow: false },
};

const DAY_MS = 24 * 60 * 60 * 1000;

export default async function StartTrial() {
  const session = await getSessionFromCookies();
  if (!session) {
    // Come back here once they have signed in, so the click they made
    // is the click that happens.
    redirect("/login?next=/start-trial");
  }

  const col = await accounts();
  const before = await col.findOne(
    { email: session.email },
    { projection: ENTITLEMENT_FIELDS },
  );
  const current = entitlementFor(before);

  // Already trialed, already paying, or comped. Nothing to start.
  if (current.state !== "none") {
    redirect("/dashboard/subscription/");
  }

  const days = trialDays();
  const started = await col.updateOne(
    {
      email: session.email,
      trial_started_at: { $exists: false },
      comped: { $ne: true },
    },
    { $set: { trial_started_at: new Date(), trial_days: days } },
  );

  if (started.modifiedCount > 0) {
    await sendTrialStarted(
      session.email,
      new Date(Date.now() + days * DAY_MS),
      days,
    );
  }

  // Back to the subscription page, which now reads "Free trial, 14 days
  // left" and carries the install link. Sending them straight to a
  // download instead would answer a question they had not asked yet.
  redirect("/dashboard/subscription/?trial=started");
}
