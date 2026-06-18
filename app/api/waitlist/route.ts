// POST /api/waitlist — early-access signups.
//
// Accepts from both the marketing site (`feedback` optional) and the
// HealthOS mobile app (`source: "mobile_app"`, plus the anonymous
// user_id so we can correlate a signup with the device's later
// analytics events without ever collecting a name/account).
//
// Idempotent on email: if the same email lands twice, we update
// last_seen_at + lightly merge new fields, never insert a duplicate.

import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";

export const runtime = "nodejs";

// Loose RFC-5322-ish check. Stricter validators reject real addresses;
// a server bounce is the real source of truth.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface SignupBody {
  email?: string;
  feedback?: string | null;
  /** "marketing_site" | "mobile_app" | other future surface. */
  source?: string;
  /** Anonymous device install id from the mobile app. */
  user_id?: string;
}

export async function POST(req: Request) {
  let body: SignupBody;
  try {
    body = (await req.json()) as SignupBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Valid email is required." },
      { status: 400 },
    );
  }

  const source =
    typeof body.source === "string" && body.source.length <= 32
      ? body.source
      : "marketing_site";
  const userId =
    typeof body.user_id === "string" && body.user_id.length <= 64
      ? body.user_id
      : null;
  const feedback =
    typeof body.feedback === "string" && body.feedback.length <= 2000
      ? body.feedback
      : null;

  try {
    const client = await getMongoClient();
    const db = client.db("healthos");
    const collection = db.collection("waitlist");

    const now = new Date();
    // Upsert keyed on email. `user_id` is the single CANONICAL identity for
    // this user — the key all their observations sync under, and what
    // restore-from-email (GET /api/v1/installations) hands back so a fresh
    // install can adopt it. Set once, then stable forever; later submits
    // only touch last_seen_at.
    const update: Record<string, unknown> = {
      $setOnInsert: {
        email,
        createdAt: now,
        first_source: source,
        ...(userId !== null ? { user_id: userId } : {}),
      },
      $set: {
        last_seen_at: now,
        source,
        ...(feedback !== null ? { feedback } : {}),
      },
      $inc: { signup_count: 1 },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await collection.updateOne({ email }, update as any, { upsert: true });

    // Backfill the canonical user_id for rows that predate the mobile
    // install — e.g. an email first captured by the marketing site (no
    // user_id), which $setOnInsert can never populate on a later submit.
    // Without this, recovery returns user_id:null forever and restore can't
    // resolve an account. Only fills when missing, so the canonical id stays
    // stable once set.
    if (userId !== null) {
      await collection.updateOne(
        { email, $or: [{ user_id: { $exists: false } }, { user_id: null }] },
        { $set: { user_id: userId } },
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[waitlist]", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
