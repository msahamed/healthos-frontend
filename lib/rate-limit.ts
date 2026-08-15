// Mongo-backed fixed-window rate limiting.
//
// Why Mongo and not an in-memory Map: this runs on Vercel serverless.
// Each invocation may land on a fresh instance, so an in-process
// counter silently resets and the limit does nothing — the failure
// mode is invisible, which is the worst kind. The DB is the only
// shared state we have, and these are single-document upserts on an
// indexed _id, so the cost is negligible.
//
// Fixed windows (not sliding) are deliberate: one atomic $inc per
// call, no history to store. The tradeoff is that a caller can burst
// up to 2x the limit across a window boundary. For login throttling
// that's fine — the numbers below are already conservative.
//
// Documents self-delete via the TTL index on `expires_at` (see
// scripts/ensure-indexes.ts). Nothing here needs pruning.

import { getMongoClient } from "@/lib/mongodb";

export const RATE_LIMITS = "rate_limits";

interface RateLimitDoc {
  _id: string;
  count: number;
  expires_at: Date;
}

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the current window rolls over. For Retry-After. */
  retryAfterSec: number;
}

/**
 * Count one hit against `key` and report whether it stays within
 * `limit` per `windowSec`.
 *
 * Fails OPEN: if Mongo is unreachable this returns ok, because a
 * database blip must not lock every user out of signing in. Login
 * availability beats throttling under failure.
 */
export async function consume(
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const bucketStart = Math.floor(now / windowMs) * windowMs;
  const retryAfterSec = Math.ceil((bucketStart + windowMs - now) / 1000);

  try {
    const client = await getMongoClient();
    const col = client
      .db("healthos")
      .collection<RateLimitDoc>(RATE_LIMITS);

    // One round trip: increment and read back the post-increment value.
    const doc = await col.findOneAndUpdate(
      { _id: `${key}:${bucketStart}` },
      {
        $inc: { count: 1 },
        $setOnInsert: { expires_at: new Date(bucketStart + windowMs) },
      },
      { upsert: true, returnDocument: "after" },
    );

    const count = doc?.count ?? 1;
    return { ok: count <= limit, retryAfterSec };
  } catch (err) {
    console.error("[rate-limit] failing open:", err);
    return { ok: true, retryAfterSec: 0 };
  }
}

/**
 * Read the caller's IP from Vercel's forwarding headers. Only ever
 * used as a rate-limit key, never as an identity or trust signal —
 * it is client-controllable and shared behind NAT/VPN, so the
 * per-IP caps are deliberately loose and the per-email cap is what
 * actually protects an account.
 */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const first = fwd.split(",")[0]?.trim();
  return first || req.headers.get("x-real-ip")?.trim() || "unknown";
}
