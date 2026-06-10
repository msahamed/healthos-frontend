// GET /api/v1/installations?email=<addr> — installation-id recovery.
//
// Used on a fresh install when the user wants to restore their data
// from another device. The user enters their existing email, the
// client calls this endpoint, and adopts the returned `install_id`
// locally — overwriting the fresh UUID generated at first launch.
// All subsequent sync calls then partition against the restored id.
//
// Source of truth: the existing `waitlist` collection, which is
// upserted on email and already carries the device's most recent
// install_id. No new collection needed for v1.
//
// Privacy: returns `install_id` only on exact email match. The
// install_id is a UUIDv4 — effectively a bearer token for that user's
// observation data. Anyone with the email could mint a recovery, so
// this is *not* an auth boundary; it's a convenience layer on top of
// "data tied to a randomly-generated bearer token." Acceptable for
// self-awareness/wellness scope; revisit if sensitivity warrants.
//
// Response shapes (always 200 unless input is malformed):
//   - Email found, has install_id      → { found: true,  install_id, last_seen_at }
//   - Email found, no install_id yet   → { found: true,  install_id: null }
//   - Email never registered           → { found: false }

import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";

export const runtime = "nodejs";

// Same loose RFC-5322-ish check used by the waitlist intake. Stricter
// validators reject real addresses; a server bounce is the real source
// of truth — for *lookup* we don't bounce, so loose is fine.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface WaitlistRow {
  email: string;
  install_id?: string | null;
  last_seen_at?: Date | null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("email") ?? "";
  const email = raw.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "email_required" }, { status: 400 });
  }

  try {
    const client = await getMongoClient();
    const col = client
      .db("healthos")
      .collection<WaitlistRow>("waitlist");

    const row = await col.findOne(
      { email },
      { projection: { _id: 0, install_id: 1, last_seen_at: 1 } },
    );

    if (!row) {
      return NextResponse.json({ found: false });
    }

    const installId =
      typeof row.install_id === "string" && row.install_id.length > 0
        ? row.install_id
        : null;

    return NextResponse.json({
      found: true,
      install_id: installId,
      last_seen_at: row.last_seen_at ?? null,
    });
  } catch (err) {
    console.error("[installations lookup]", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
