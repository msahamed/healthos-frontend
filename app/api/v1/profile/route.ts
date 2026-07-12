// GET/PUT /api/v1/profile — user-level state that isn't per-observation.
//
// v1 payload: the speaker-enrollment voiceprint (192-float ECAPA
// embedding). Without it, a restored device runs the speaker gate open
// until the user re-enrolls; syncing it makes "sign in on a new device"
// restore the complete working state, not just the logs.
//
// Keyed by user_id in its own `profiles` collection (the waitlist row
// stays a marketing/contact surface; device state doesn't belong there).
//
// Auth model matches /sync: the user_id UUID is the bearer. The
// voiceprint is not reversible to audio (192 floats), so its sensitivity
// is on par with the acoustic markers already synced.

import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const VOICEPRINT_DIM = 192;

interface ProfileDoc {
  _id: string; // user_id
  voiceprint: number[] | null;
  updated_at: Date;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("user_id") ?? "";
  if (!UUID_RE.test(userId)) {
    return NextResponse.json({ error: "user_id_required" }, { status: 400 });
  }

  try {
    const client = await getMongoClient();
    const row = await client
      .db("healthos")
      .collection<ProfileDoc>("profiles")
      .findOne({ _id: userId }, { projection: { _id: 0 } });

    return NextResponse.json({
      found: row !== null,
      voiceprint: row?.voiceprint ?? null,
    });
  } catch (err) {
    console.error("[profile get]", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  let body: { user_id?: unknown; voiceprint?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const userId = typeof body.user_id === "string" ? body.user_id : "";
  if (!UUID_RE.test(userId)) {
    return NextResponse.json({ error: "user_id_required" }, { status: 400 });
  }

  const vp = body.voiceprint;
  const voiceprint =
    Array.isArray(vp) &&
    vp.length === VOICEPRINT_DIM &&
    vp.every((x) => typeof x === "number" && Number.isFinite(x))
      ? (vp as number[])
      : null;
  if (voiceprint === null) {
    return NextResponse.json({ error: "voiceprint_invalid" }, { status: 400 });
  }

  try {
    const client = await getMongoClient();
    await client
      .db("healthos")
      .collection<ProfileDoc>("profiles")
      .updateOne(
        { _id: userId },
        { $set: { voiceprint, updated_at: new Date() } },
        { upsert: true },
      );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[profile put]", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
