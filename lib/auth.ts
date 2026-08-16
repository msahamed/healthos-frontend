// Passwordless auth primitives — shared by the mobile app and the
// website. Both clients drive the same three endpoints under
// /api/v1/auth; the only difference is where they keep the token
// (Keychain/Keystore on device, httpOnly cookie on web).
//
// Because there is no password and no second factor, the emailed
// code IS the entire security boundary. Two consequences shape
// everything below:
//
//   1. Throttling is per EMAIL, not per code. The classic break on
//      6-digit OTP is re-requesting a fresh code to earn a fresh
//      attempt budget; a few hundred rounds and 1M values stops
//      being a meaningful space. So attempts are counted against
//      the address across codes (see MAX_VERIFY_* below), and
//      issuing a code invalidates any previous one — never more
//      than one live code per address.
//   2. The SESSION is the credential users actually live on, not the
//      code. Re-auth costs an email round trip, so sessions are long
//      and therefore must be revocable — which is why they are rows
//      in Mongo rather than self-contained JWTs. Statelessness would
//      buy us nothing at this scale and would cost us logout.
//
// Accepted residual risk: whoever controls the inbox controls the
// account. That is true of every passwordless system, and of every
// password-reset flow, so it is documented rather than solved.

import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { getMongoClient } from "@/lib/mongodb";
import type { Collection, Db } from "mongodb";

export const DB_NAME = "healthos";

/** How long an emailed code stays valid. */
export const CODE_TTL_SEC = 10 * 60;
/** Verify attempts allowed per address per window, ACROSS codes. */
export const MAX_VERIFY_ATTEMPTS = 5;
export const VERIFY_WINDOW_SEC = 15 * 60;
/** Codes requestable per address per hour (email-bomb protection). */
export const MAX_REQUESTS_PER_EMAIL = 5;
export const REQUEST_WINDOW_SEC = 60 * 60;
/** Looser companion cap so one host can't farm many addresses. */
export const MAX_REQUESTS_PER_IP = 30;

/**
 * Session lifetime. Slides on every authenticated request, so an
 * actively used install effectively never signs out — matching the
 * product rule: you stay logged in until you log out or uninstall.
 * A device dormant for a year drops off on its own.
 */
export const SESSION_TTL_DAYS = 365;

/** Loose RFC-5322-ish check, same as the waitlist intake. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface AccountDoc {
  _id?: unknown;
  email: string;
  /** The observation-sync partition key. Stable once set. */
  user_id: string;
  /** "client" today; "coach" is what the web dashboard will use. */
  role: string;
  /**
   * When this person first proved they read the inbox. NULL on rows
   * backfilled from the waitlist, which were inferred from an install
   * rather than verified. Check this — not whether the row exists —
   * wherever verification actually matters.
   */
  verified_at?: Date | null;
  created_at: Date;
  last_login_at?: Date;
}

export interface AuthCodeDoc {
  _id?: unknown;
  email: string;
  code_hash: string;
  expires_at: Date;
  created_at: Date;
  ip: string;
}

export interface SessionDoc {
  _id: string; // sha256 of the bearer token
  account_id: string;
  user_id: string;
  email: string;
  role: string;
  device: string | null;
  created_at: Date;
  last_used_at: Date;
  expires_at: Date;
}

export async function getDb(): Promise<Db> {
  return (await getMongoClient()).db(DB_NAME);
}

export async function accounts(): Promise<Collection<AccountDoc>> {
  return (await getDb()).collection<AccountDoc>("accounts");
}
export async function authCodes(): Promise<Collection<AuthCodeDoc>> {
  return (await getDb()).collection<AuthCodeDoc>("auth_codes");
}
export async function sessions(): Promise<Collection<SessionDoc>> {
  return (await getDb()).collection<SessionDoc>("sessions");
}

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  return email && EMAIL_RE.test(email) ? email : null;
}

export function isUuid(raw: unknown): raw is string {
  return typeof raw === "string" && UUID_RE.test(raw);
}

// ── Codes ─────────────────────────────────────────────────────────

/**
 * A 6-digit code from a CSPRNG. `randomInt` is rejection-sampled, so
 * unlike `Math.random() * 900000` every value is equally likely and
 * the low digits aren't biased. Leading zeros are preserved — the
 * code is a string, never a number.
 */
export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/**
 * Codes are stored hashed, never in plaintext: a leaked DB snapshot
 * shouldn't hand over live login codes. Salted with the address so
 * the same code for two users hashes differently, and peppered with
 * a server secret so the hash can't be brute-forced offline from the
 * 1M-value space alone. AUTH_PEPPER is optional — absent, this
 * degrades to a plain salted hash rather than failing to boot.
 */
export function hashCode(email: string, code: string): string {
  const pepper = process.env.AUTH_PEPPER ?? "";
  return createHash("sha256").update(`${email}:${code}:${pepper}`).digest("hex");
}

/** Constant-time compare, so response timing can't leak the code. */
export function codeMatches(email: string, code: string, hash: string): boolean {
  const a = Buffer.from(hashCode(email, code), "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

// ── Sessions ──────────────────────────────────────────────────────

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Mint a session and return the bearer token. Only the hash is
 * stored, so the raw token exists exactly once — in this response.
 * We cannot show it again, which is the point: a DB leak yields no
 * usable sessions.
 */
export async function issueSession(args: {
  accountId: string;
  userId: string;
  email: string;
  role: string;
  device?: string | null;
}): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  );

  const col = await sessions();
  await col.insertOne({
    _id: hashToken(token),
    account_id: args.accountId,
    user_id: args.userId,
    email: args.email,
    role: args.role,
    device: args.device ?? null,
    created_at: now,
    last_used_at: now,
    expires_at: expiresAt,
  });

  return { token, expiresAt };
}

export interface Session {
  accountId: string;
  userId: string;
  email: string;
  role: string;
  expiresAt: Date;
}

/**
 * Validate a bearer token and slide its expiry forward. Returns null
 * for anything invalid — missing, unknown, or expired — with no
 * distinction between them, since the caller can't act on the
 * difference and the difference is worth something to an attacker.
 *
 * The expiry check is explicit rather than trusting Mongo's TTL
 * reaper, which only sweeps about once a minute and would otherwise
 * leave a window where an expired session still authenticates.
 */
export async function verifySessionToken(
  token: string | null,
): Promise<Session | null> {
  if (!token) return null;

  try {
    const col = await sessions();
    const now = new Date();
    const doc = await col.findOneAndUpdate(
      { _id: hashToken(token), expires_at: { $gt: now } },
      {
        $set: {
          last_used_at: now,
          expires_at: new Date(
            now.getTime() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
          ),
        },
      },
      { returnDocument: "after" },
    );
    if (!doc) return null;

    return {
      accountId: doc.account_id,
      userId: doc.user_id,
      email: doc.email,
      role: doc.role,
      expiresAt: doc.expires_at,
    };
  } catch (err) {
    console.error("[auth] session verify failed:", err);
    return null;
  }
}

/**
 * Pull the bearer token off a request. Checks the Authorization
 * header first (mobile), then the session cookie (web) — one
 * function so every protected route accepts both surfaces without
 * caring which is calling.
 */
export function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (match) return match[1].trim() || null;

  const cookie = req.headers.get("cookie") ?? "";
  const found = /(?:^|;\s*)ontor_session=([^;]+)/.exec(cookie);
  return found ? decodeURIComponent(found[1]) : null;
}

/** Convenience for protected routes: `const s = await requireSession(req)`. */
export async function requireSession(req: Request): Promise<Session | null> {
  return verifySessionToken(bearerToken(req));
}

/**
 * Session for a SERVER COMPONENT, which has no Request to read from.
 * Web-only — the app sends a bearer header and never a cookie.
 *
 * `cookies()` is async in this version of Next; awaiting it is not
 * optional. Verifying here also slides the expiry, so simply using
 * the site keeps you signed in.
 */
export async function getSessionFromCookies(): Promise<Session | null> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value ?? null);
}

/** Revoke one session (logout). Idempotent. */
export async function revokeSession(token: string): Promise<void> {
  const col = await sessions();
  await col.deleteOne({ _id: hashToken(token) });
}

export const SESSION_COOKIE = "ontor_session";

// ── Authorizing a user-scoped request ─────────────────────────────
//
// The data endpoints (/sync, /voice/presign*, /profile) were built
// when a client-generated `user_id` WAS the credential: send someone
// else's UUID and you got their data, or an S3 PUT URL under their
// prefix. This is the gate that ends that.
//
// It runs in two modes so the fix can ship without bricking installed
// builds that know nothing about tokens:
//
//   AUTH_REQUIRED unset  — accept-both. A request WITH a token must
//     prove that token owns the user_id it is asking about; a request
//     WITHOUT one is allowed through and logged, exactly as before.
//   AUTH_REQUIRED=true   — a token is mandatory. Off indefinitely: an
//     app update does NOT sign anyone in, because onboarding runs once
//     and .onboarding_done survives the update. See the note in
//     app/api/v1/sync/route.ts.
//
// A PRESENT-but-invalid token is rejected rather than quietly
// downgraded to the legacy path. Falling back there would mean a
// revoked session still syncs, which would make logout a lie.

export type Authz =
  | { ok: true; authenticated: boolean }
  | { ok: false; status: 401 | 403; error: string };

/** True once the legacy unauthenticated path is closed. */
export function authRequired(): boolean {
  return process.env.AUTH_REQUIRED === "true";
}

/**
 * Decide whether this request may act on [userId]. See the note above
 * for the two modes.
 */
export async function authorizeUser(
  req: Request,
  userId: string,
): Promise<Authz> {
  const token = bearerToken(req);

  if (token) {
    const session = await verifySessionToken(token);
    if (!session) return { ok: false, status: 401, error: "invalid_session" };
    if (session.userId !== userId) {
      // A valid token for the wrong partition. This is the exact
      // attack the gate exists for, so it is worth a log line.
      console.warn(
        `[authz] session ${session.email} tried user_id ${userId.slice(0, 8)}…`,
      );
      return { ok: false, status: 403, error: "forbidden" };
    }
    return { ok: true, authenticated: true };
  }

  if (authRequired()) {
    return { ok: false, status: 401, error: "auth_required" };
  }

  // Legacy install. Logged so the volume of these is visible before
  // deciding it is safe to set AUTH_REQUIRED.
  console.info(`[authz] unauthenticated ${userId.slice(0, 8)}…`);
  return { ok: true, authenticated: false };
}
