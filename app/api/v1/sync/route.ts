// POST /api/v1/sync — push a batch of observations from the mobile app.
// GET  /api/v1/sync — pull observations newer than `since` for one install.
//
// One collection — `observations` — keyed by client-supplied UUID (`_id`).
// All other per-log signals (acoustic, language, dimensional markers) are
// embedded sub-documents on the same doc; the mobile DB normalizes them
// into separate SQLite tables locally but flattens for transport so a
// single Mongo upsert is sufficient.
//
// Auth: none. The `user_id` IS the bearer — a UUIDv4 generated on the
// device, persisted in iCloud Keychain so it survives reinstalls. Anyone
// who has it can read/write the data tied to it. Acceptable for v1
// because (a) random 128-bit keys are not enumerable, (b) data is
// self-awareness/wellness, not regulated, and (c) we'll add a proper
// auth layer if/when sensitivity warrants it.
//
// Sync semantics: last-write-wins by client `updated_at`. Each push is a
// full-document replace (not a diff) — the device is always the source
// of truth for its own state.
//
// Idempotency: `_id` is the UUID; replacing the same _id is a no-op if
// the doc hasn't changed locally.

import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import type { AnyBulkWriteOperation } from "mongodb";

// Stored observation shape. `_id` is a client-supplied UUIDv4, not an
// ObjectId — the collection is parameterized with this so the Mongo
// driver's generics don't force ObjectId on the filter.
interface ObservationDoc {
  _id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  transcript: string | null;
  app_version: string | null;
  platform: string | null;
  extraction: Record<string, unknown>;
  signals: Record<string, unknown>;
  markers: Record<string, unknown>;
  voice_clip: Record<string, unknown> | null;
  received_at: Date;
}

// Mongo Node driver needs the Node runtime (no edge support).
export const runtime = "nodejs";

const PUSH_MAX_BATCH = 200;
const PULL_MAX_BATCH = 200;

// UUIDv4 with hyphens. Used to validate both `_id` and `user_id`.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

interface IncomingObservation {
  _id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  transcript?: string;
  app_version?: string;
  platform?: string;
  extraction?: Record<string, unknown>;
  signals?: Record<string, unknown>;
  markers?: Record<string, unknown>;
  voice_clip?: Record<string, unknown> | null;
}

/** Cheap shape check. Drops malformed observations from the batch
 *  rather than rejecting the whole POST — one bad row shouldn't knock
 *  out the rest of a user's queued sync. */
function sanitize(raw: unknown, expectedUserId: string): IncomingObservation | null {
  if (!isPlainObject(raw)) return null;
  const r = raw as Record<string, unknown>;

  const id = typeof r._id === "string" ? r._id : null;
  const userId = typeof r.user_id === "string" ? r.user_id : null;
  const createdAt = typeof r.created_at === "string" ? r.created_at : null;
  const updatedAt = typeof r.updated_at === "string" ? r.updated_at : null;
  if (!id || !userId || !createdAt || !updatedAt) return null;
  if (!UUID_RE.test(id)) return null;
  // Paranoia: a doc whose user_id doesn't match the batch's user_id
  // gets dropped silently — wrong-bucket writes have no benign cause.
  if (userId !== expectedUserId) return null;

  return {
    _id: id,
    user_id: userId,
    created_at: createdAt,
    updated_at: updatedAt,
    deleted_at: typeof r.deleted_at === "string" ? r.deleted_at : null,
    transcript: typeof r.transcript === "string" ? r.transcript : undefined,
    app_version: typeof r.app_version === "string" ? r.app_version : undefined,
    platform: typeof r.platform === "string" ? r.platform : undefined,
    extraction: isPlainObject(r.extraction) ? r.extraction : undefined,
    signals: isPlainObject(r.signals) ? r.signals : undefined,
    markers: isPlainObject(r.markers) ? r.markers : undefined,
    voice_clip: isPlainObject(r.voice_clip)
      ? r.voice_clip
      : r.voice_clip === null
      ? null
      : undefined,
  };
}

/** Coerce ISO strings → Date so Mongo queries can range-scan them. */
function toDoc(o: IncomingObservation): ObservationDoc {
  return {
    _id: o._id,
    user_id: o.user_id,
    created_at: new Date(o.created_at),
    updated_at: new Date(o.updated_at),
    deleted_at: o.deleted_at ? new Date(o.deleted_at) : null,
    transcript: o.transcript ?? null,
    app_version: o.app_version ?? null,
    platform: o.platform ?? null,
    extraction: o.extraction ?? {},
    signals: o.signals ?? {},
    markers: o.markers ?? {},
    voice_clip: o.voice_clip ?? null,
    received_at: new Date(),
  };
}

// ── POST ────────────────────────────────────────────────────────────────────
//
// Body: { user_id, observations: IncomingObservation[] }
// Response: { accepted, dropped, upserted, modified }

export async function POST(req: Request) {
  let body: { user_id?: unknown; observations?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const userId =
    typeof body.user_id === "string" ? body.user_id : "";
  if (!UUID_RE.test(userId)) {
    return NextResponse.json(
      { error: "user_id_required" },
      { status: 400 },
    );
  }

  const list = Array.isArray(body.observations) ? body.observations : null;
  if (!list) {
    return NextResponse.json(
      { error: "observations_array_required" },
      { status: 400 },
    );
  }
  if (list.length === 0) {
    return NextResponse.json({ accepted: 0, dropped: 0, upserted: 0, modified: 0 });
  }
  if (list.length > PUSH_MAX_BATCH) {
    return NextResponse.json(
      { error: "batch_too_large", limit: PUSH_MAX_BATCH },
      { status: 413 },
    );
  }

  const valid: IncomingObservation[] = [];
  let dropped = 0;
  for (const raw of list) {
    const o = sanitize(raw, userId);
    if (o) valid.push(o);
    else dropped++;
  }
  if (valid.length === 0) {
    return NextResponse.json({ accepted: 0, dropped, upserted: 0, modified: 0 });
  }

  // bulkWrite with replaceOne(upsert) per doc. Each push is a full-doc
  // state replacement — devices send the canonical state of their rows,
  // never diffs. Last-write-wins falls out naturally.
  const ops: AnyBulkWriteOperation<ObservationDoc>[] = valid.map((o) => ({
    replaceOne: {
      filter: { _id: o._id },
      replacement: toDoc(o),
      upsert: true,
    },
  }));

  try {
    const client = await getMongoClient();
    const col = client
      .db("healthos")
      .collection<ObservationDoc>("observations");
    const res = await col.bulkWrite(ops, { ordered: false });

    // Touch the install's last_seen_at so the waitlist row tracks
    // active devices. Fire-and-forget — failure here doesn't affect
    // the sync result.
    void client
      .db("healthos")
      .collection("waitlist")
      .updateOne(
        { user_id: userId },
        { $set: { user_id: userId, last_seen_at: new Date() } },
        { upsert: false },
      )
      .catch(() => {});

    return NextResponse.json({
      accepted: valid.length,
      dropped,
      upserted: res.upsertedCount,
      modified: res.modifiedCount,
    });
  } catch (err) {
    console.error("[sync push]", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

// ── GET ─────────────────────────────────────────────────────────────────────
//
// Query: ?user_id=<uuid>&since=<iso>[&limit=<N>]
// Response: { observations, server_now, has_more }
//
// Client persists `server_now` from each response and uses it as the
// next `since`. Echoing server time (vs. client computing it) prevents
// clock-drift gaps where a doc written at "server time T+1ms" gets
// missed because the client polled at "client time T."

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("user_id") ?? "";
  if (!UUID_RE.test(userId)) {
    return NextResponse.json(
      { error: "user_id_required" },
      { status: 400 },
    );
  }

  const sinceRaw = url.searchParams.get("since");
  const since = sinceRaw ? new Date(sinceRaw) : new Date(0);
  if (Number.isNaN(since.valueOf())) {
    return NextResponse.json({ error: "invalid_since" }, { status: 400 });
  }

  const limitRaw = url.searchParams.get("limit");
  const limit = (() => {
    if (!limitRaw) return PULL_MAX_BATCH;
    const n = Number.parseInt(limitRaw, 10);
    if (!Number.isFinite(n) || n <= 0) return PULL_MAX_BATCH;
    return Math.min(n, PULL_MAX_BATCH);
  })();

  try {
    const client = await getMongoClient();
    const col = client
      .db("healthos")
      .collection<ObservationDoc>("observations");

    // Strictly-greater-than `since` excludes the boundary row the
    // client already has. Order by updated_at so pagination is
    // deterministic across pages.
    const rows = await col
      .find(
        { user_id: userId, updated_at: { $gt: since } },
        { projection: { received_at: 0 } },
      )
      .sort({ updated_at: 1 })
      .limit(limit + 1)
      .toArray();

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;

    return NextResponse.json({
      observations: page,
      server_now: new Date().toISOString(),
      has_more: hasMore,
    });
  } catch (err) {
    console.error("[sync pull]", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
