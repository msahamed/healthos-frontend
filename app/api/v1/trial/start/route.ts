// POST /api/v1/trial/start — begin the free trial for the signed-in account.
//
// Returns the resulting entitlement, exactly as GET /entitlement would.
// 401 without a session.
//
// Idempotent, and deliberately one-way: the trial clock starts once per
// account and a second call returns the state already in force rather
// than restarting it. That is the whole reason entitlement lives on the
// server keyed by EMAIL — a device-bound trial would reset on reinstall,
// and anyone with a second machine would trial forever.
//
// It is also why the clock starts HERE and not at signup. Someone who
// downloads on a Friday and opens the app three weeks later should get
// fourteen days of the product, not fourteen days of having been busy.

import { NextResponse } from "next/server";
import { accounts, requireSession } from "@/lib/auth";
import { sendTrialStarted } from "@/lib/billing-email";
import { entitlementForEmail, trialDays } from "@/lib/entitlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await requireSession(req);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const col = await accounts();
  // Only stamps when the field is absent, so a double-tap on a slow
  // connection cannot hand out a second trial. Comped accounts are
  // excluded too — stamping one would do no harm today (comped wins in
  // the derivation) but it would misreport when their access began.
  const started = await col.updateOne(
    {
      email: session.email,
      trial_started_at: { $exists: false },
      comped: { $ne: true },
    },
    { $set: { trial_started_at: new Date(), trial_days: trialDays() } },
  );

  const ent = await entitlementForEmail(session.email);

  // Only on the transition. The filter above matches nothing on a
  // repeat call, so a double-tap cannot send a second welcome.
  if (started.modifiedCount > 0 && ent.expires_at) {
    await sendTrialStarted(session.email, new Date(ent.expires_at), trialDays());
  }

  return NextResponse.json(ent, {
    headers: { "Cache-Control": "no-store" },
  });
}
