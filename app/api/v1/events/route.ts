// POST /api/v1/events — analytics intake from the HealthOS mobile app.
//
// Body: { events: [<AnalyticsEvent>, ...] }
//
// Schema of one AnalyticsEvent (from mobile_app/.../analytics_event.dart):
//   id              uuid v4 — used as Mongo _id for free dedup
//   install_id      anonymous per-install uuid (no PII)
//   session_id      app-session uuid (rotates on cold launch + 30m idle)
//   event           e.g. "log_created", "pattern_confirmed"
//   tier            "reliability" | "engagement"
//   event_datetime  ISO 8601 with local offset — when the action happened
//   created_at      ISO 8601 — when the device queued the event
//   app_version     "1.0.5"
//   platform        "ios" | "android" | "macos" | ...
//   props           free-form, schema-defined per event name
//
// Contract:
//   - 2xx → client acks and removes from its outbox
//   - 4xx (validation) → client drops the batch (won't retry)
//   - 5xx / network err → client keeps batch in outbox, retries later
//
// Idempotency: we use the client-supplied event.id as _id, so a retry
// after a partial network failure won't double-count. Duplicate inserts
// throw a code-11000 error which we silently ignore.

import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";

// Mongo Node driver needs the Node runtime (no edge support).
export const runtime = "nodejs";

const MAX_BATCH_SIZE = 200;
const ALLOWED_TIERS = new Set(["reliability", "engagement"]);

interface IncomingEvent {
  id: string;
  install_id: string;
  session_id?: string;
  event: string;
  tier: string;
  event_datetime: string;
  created_at: string;
  app_version?: string;
  platform?: string;
  props?: Record<string, unknown>;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Cheap validator. Drops malformed events from the batch rather
 *  than rejecting the whole POST — a single bad client shouldn't
 *  knock out the rest of a user's queued events. */
function sanitize(raw: unknown): IncomingEvent | null {
  if (!isPlainObject(raw)) return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === "string" ? r.id : null;
  const installId = typeof r.install_id === "string" ? r.install_id : null;
  const event = typeof r.event === "string" ? r.event : null;
  const tier = typeof r.tier === "string" ? r.tier : null;
  const eventDt =
    typeof r.event_datetime === "string" ? r.event_datetime : null;
  const createdAt = typeof r.created_at === "string" ? r.created_at : null;
  if (!id || !installId || !event || !tier || !eventDt || !createdAt) {
    return null;
  }
  if (!ALLOWED_TIERS.has(tier)) return null;
  return {
    id,
    install_id: installId,
    session_id:
      typeof r.session_id === "string" ? (r.session_id as string) : undefined,
    event,
    tier,
    event_datetime: eventDt,
    created_at: createdAt,
    app_version:
      typeof r.app_version === "string" ? (r.app_version as string) : undefined,
    platform:
      typeof r.platform === "string" ? (r.platform as string) : undefined,
    props: isPlainObject(r.props) ? (r.props as Record<string, unknown>) : {},
  };
}

export async function POST(req: Request) {
  let body: { events?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const list = Array.isArray(body?.events) ? body.events : null;
  if (!list) {
    return NextResponse.json(
      { error: "events_array_required" },
      { status: 400 },
    );
  }
  if (list.length === 0) {
    return NextResponse.json({ accepted: 0, dropped: 0 });
  }
  if (list.length > MAX_BATCH_SIZE) {
    return NextResponse.json(
      { error: "batch_too_large", limit: MAX_BATCH_SIZE },
      { status: 413 },
    );
  }

  const valid: IncomingEvent[] = [];
  let dropped = 0;
  for (const raw of list) {
    const e = sanitize(raw);
    if (e) valid.push(e);
    else dropped++;
  }
  if (valid.length === 0) {
    return NextResponse.json({ accepted: 0, dropped });
  }

  const docs = valid.map((e) => ({
    _id: e.id,
    install_id: e.install_id,
    session_id: e.session_id ?? null,
    event: e.event,
    tier: e.tier,
    event_datetime: new Date(e.event_datetime),
    created_at: new Date(e.created_at),
    app_version: e.app_version ?? null,
    platform: e.platform ?? null,
    props: e.props ?? {},
    received_at: new Date(),
  }));

  try {
    const client = await getMongoClient();
    const col = client.db("healthos").collection("events");
    // ordered:false → keep inserting on duplicate-key errors. Each
    // dup is the client retrying after a partial failure; that's the
    // whole point of using the client id as _id.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await col.insertMany(docs as any, { ordered: false });
    return NextResponse.json({ accepted: docs.length, dropped });
  } catch (err: unknown) {
    // Duplicate-key (11000) on every write is fine — it means the
    // entire batch was already accepted in a previous attempt.
    const e = err as {
      code?: number;
      writeErrors?: { code?: number }[];
      result?: { nInserted?: number };
    };
    const allDup =
      e?.writeErrors?.every((w) => w?.code === 11000) === true ||
      e?.code === 11000;
    if (allDup) {
      return NextResponse.json({
        accepted: docs.length,
        dropped,
        deduped: true,
      });
    }
    // Mixed batch: some inserted, some duplicates. nInserted (if
    // present) tells us the new count; still a 2xx since the client
    // can safely ack the whole batch.
    const inserted = e?.result?.nInserted;
    if (typeof inserted === "number" && inserted >= 0) {
      return NextResponse.json({
        accepted: docs.length,
        dropped,
        new: inserted,
        deduped: docs.length - inserted,
      });
    }
    console.error("[events] insert failed:", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
