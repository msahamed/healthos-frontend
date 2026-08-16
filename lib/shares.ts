// Sharing: a client letting a coach see their voice data.
//
// One record, one direction. A coach invites an email address; the
// client accepts. The client's action is what activates it, because it
// is their data — a coach can create a request but never a grant.
//
// The invite works the same whether or not the client already has an
// account, because sign-in is passwordless: clicking Accept sends them
// to the same six-digit code screen either way, and that screen
// creates the account if there isn't one. There is no separate signup
// path to build.
//
// Ending a share is symmetric and needs no permission from the other
// side: the client revokes because it is their data, the coach removes
// because it is their roster. Both just stop the access.

import { createHash, randomBytes } from "node:crypto";
import { getDb, normalizeEmail } from "@/lib/auth";
import type { Document } from "mongodb";

export type ShareStatus = "pending" | "active" | "ended";

export interface ShareDoc extends Document {
  token_hash: string;
  /** Null when the coach has no account yet; filled on their sign-in. */
  coach_user_id: string | null;
  coach_email: string;
  /** The coach's display name at invite time, for the email. */
  coach_name?: string | null;
  client_email: string;
  /** Null until accepted — a pending invite has no account behind it. */
  client_user_id: string | null;
  status: ShareStatus;
  created_at: Date;
  accepted_at?: Date | null;
  ended_at?: Date | null;
  ended_by?: "coach" | "client" | null;
}

export interface ShareView {
  id: string;
  coachEmail: string;
  coachUserId: string | null;
  clientEmail: string;
  clientUserId: string | null;
  status: ShareStatus;
  createdAt: Date;
  acceptedAt: Date | null;
}

const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");

async function col() {
  return (await getDb()).collection<ShareDoc>("shares");
}

const view = (d: ShareDoc & { _id?: unknown }): ShareView => ({
  id: String(d._id),
  coachEmail: d.coach_email,
  coachUserId: d.coach_user_id,
  clientEmail: d.client_email,
  clientUserId: d.client_user_id,
  status: d.status,
  createdAt: d.created_at,
  acceptedAt: d.accepted_at ?? null,
});

// ── Creating an invite ────────────────────────────────────────────

export type InviteResult =
  | { ok: true; token: string; alreadyPending: boolean }
  | { ok: false; error: string };

/**
 * Invite `clientEmail` to share with this coach.
 *
 * Re-inviting the same address returns the existing pending invite
 * rather than making a second one, so a coach who clicks twice does
 * not send two different links that both work.
 */
export async function createInvite(
  coach: { userId: string; email: string; name?: string | null },
  rawEmail: string,
): Promise<InviteResult> {
  // An invite from a bare email address reads as spam, and the person
  // receiving it has no way to tell who is asking. Requiring a name is
  // one small nudge that decides whether it gets accepted at all.
  if (!coach.name?.trim()) {
    return { ok: false, error: "Add your name on the profile page first, so they know who is asking." };
  }
  const clientEmail = normalizeEmail(rawEmail);
  if (!clientEmail) return { ok: false, error: "That does not look like an email address." };
  if (clientEmail === coach.email) {
    return { ok: false, error: "That is your own address." };
  }

  const c = await col();
  const existing = await c.findOne({
    coach_user_id: coach.userId,
    client_email: clientEmail,
    status: { $in: ["pending", "active"] },
  });
  if (existing?.status === "active") {
    return { ok: false, error: "They already share with you." };
  }

  // The raw token exists only in the email. We keep the hash, so a
  // leaked database yields no working invite links.
  const token = randomBytes(24).toString("base64url");
  if (existing) {
    await c.updateOne(
      { _id: existing._id },
      { $set: { token_hash: hashToken(token), created_at: new Date() } },
    );
    return { ok: true, token, alreadyPending: true };
  }

  await c.insertOne({
    token_hash: hashToken(token),
    coach_user_id: coach.userId,
    coach_email: coach.email,
    coach_name: coach.name.trim(),
    client_email: clientEmail,
    client_user_id: null,
    status: "pending",
    created_at: new Date(),
  } as ShareDoc);

  return { ok: true, token, alreadyPending: false };
}

// ── Accepting ─────────────────────────────────────────────────────

export async function findByToken(token: string): Promise<ShareView | null> {
  const d = await (await col()).findOne({ token_hash: hashToken(token) });
  return d ? view(d) : null;
}

export type AcceptResult =
  | { ok: true }
  | { ok: false; error: string; wrongAccount?: boolean };

/**
 * Accept an invite as the signed-in person.
 *
 * The account's email must match the address the coach invited. A
 * forwarded link should not let a different person share their data
 * with a coach who never asked for it — and more importantly, the
 * coach should get the client they invited, not whoever opened the
 * mail.
 */
export async function acceptInvite(
  session: { userId: string; email: string },
  token: string,
): Promise<AcceptResult> {
  const c = await col();
  const doc = await c.findOne({ token_hash: hashToken(token) });
  if (!doc) return { ok: false, error: "That invite link is not valid." };
  if (doc.status === "active") return { ok: true };
  if (doc.status === "ended") return { ok: false, error: "That invite is no longer open." };

  if (doc.client_email !== session.email) {
    return {
      ok: false,
      wrongAccount: true,
      error: `This invite was sent to ${doc.client_email}, and you are signed in as ${session.email}.`,
    };
  }
  if (doc.coach_user_id === session.userId) {
    return { ok: false, error: "You cannot accept your own invite." };
  }

  await c.updateOne(
    { _id: doc._id, status: "pending" },
    { $set: { status: "active", client_user_id: session.userId, accepted_at: new Date() } },
  );
  return { ok: true };
}

// ── Listing and ending ────────────────────────────────────────────

/** Invites this coach has sent, newest first. */
export async function listForCoach(coachUserId: string): Promise<ShareView[]> {
  const rows = await (await col())
    .find({ coach_user_id: coachUserId, status: { $in: ["pending", "active"] } })
    .sort({ created_at: -1 })
    .toArray();
  return rows.map(view);
}

/** Who this person has granted access to. */
export async function listForClient(client: {
  userId: string;
  email: string;
}): Promise<ShareView[]> {
  const rows = await (await col())
    .find({
      status: { $in: ["pending", "active"] },
      $or: [{ client_user_id: client.userId }, { client_email: client.email }],
    })
    .sort({ created_at: -1 })
    .toArray();
  return rows.map(view);
}

/**
 * End a share. Either side may, and neither needs the other's
 * agreement. Scoped so a caller can only end a share they are part of.
 */
export async function endShare(
  session: { userId: string; email: string },
  shareId: string,
): Promise<boolean> {
  const { ObjectId } = await import("mongodb");
  let _id: InstanceType<typeof ObjectId>;
  try {
    _id = new ObjectId(shareId);
  } catch {
    return false;
  }

  const c = await col();
  const doc = await c.findOne({ _id });
  if (!doc) return false;

  const asCoach = doc.coach_user_id === session.userId;
  const asClient =
    doc.client_user_id === session.userId || doc.client_email === session.email;
  if (!asCoach && !asClient) return false;

  await c.updateOne(
    { _id },
    { $set: { status: "ended", ended_at: new Date(), ended_by: asCoach ? "coach" : "client" } },
  );
  return true;
}

// ── The permission check ──────────────────────────────────────────

/**
 * May this session read `targetUserId`'s data?
 *
 * Yourself always; a client who has an ACTIVE share with you. This is
 * the single place that answers the question, so the page, the panel
 * API and anything added later cannot drift apart on it.
 */
export async function canView(
  session: { userId: string; email: string },
  targetUserId: string,
): Promise<boolean> {
  if (targetUserId === session.userId) return true;
  const hit = await (await col()).findOne(
    { coach_user_id: session.userId, client_user_id: targetUserId, status: "active" },
    { projection: { _id: 1 } },
  );
  return hit !== null;
}

/** The user_ids whose data this session may see, self first. */
export async function viewableUserIds(session: {
  userId: string;
  email: string;
}): Promise<{ userId: string; email: string }[]> {
  const rows = await (await col())
    .find(
      { coach_user_id: session.userId, status: "active", client_user_id: { $ne: null } },
      { projection: { client_user_id: 1, client_email: 1 } },
    )
    .toArray();

  return [
    { userId: session.userId, email: session.email },
    ...rows.map((r) => ({ userId: r.client_user_id as string, email: r.client_email })),
  ];
}


// ── The other direction: a client offers access ───────────────────
//
// A coach inviting is a REQUEST, because it is not their data. A
// client sharing is a GRANT, and needs nobody's acceptance — you do
// not have to ask permission to hand over your own numbers. So this
// goes straight to active.
//
// The coach may not have an account yet. The row is still created; it
// carries their email and no user_id, and linkCoachShares fills that
// in the first time they sign in. Nothing is visible to anyone until
// then, because canView matches on coach_user_id.

export type GrantResult = { ok: true; coachHasAccount: boolean } | { ok: false; error: string };

export async function grantToCoach(
  client: { userId: string; email: string },
  rawCoachEmail: string,
): Promise<GrantResult> {
  const coachEmail = normalizeEmail(rawCoachEmail);
  if (!coachEmail) return { ok: false, error: "That does not look like an email address." };
  if (coachEmail === client.email) return { ok: false, error: "That is your own address." };

  const c = await col();
  const existing = await c.findOne({
    client_user_id: client.userId,
    coach_email: coachEmail,
    status: { $in: ["pending", "active"] },
  });
  if (existing) return { ok: false, error: "You already share with them." };

  const db = await getDb();
  const account = await db
    .collection<{ user_id?: string }>("accounts")
    .findOne({ email: coachEmail }, { projection: { user_id: 1 } });

  await c.insertOne({
    // No invite link is involved, so there is no token to guess.
    token_hash: `grant:${client.userId}:${coachEmail}`,
    coach_user_id: account?.user_id ?? null,
    coach_email: coachEmail,
    client_email: client.email,
    client_user_id: client.userId,
    status: "active",
    created_at: new Date(),
    accepted_at: new Date(),
  } as ShareDoc);

  return { ok: true, coachHasAccount: Boolean(account?.user_id) };
}

/**
 * Attach any shares granted to this address before the coach had an
 * account. Called on sign-in, so a coach who is shared with first and
 * signs up second still sees their client.
 */
export async function linkCoachShares(session: {
  userId: string;
  email: string;
}): Promise<void> {
  await (await col()).updateMany(
    { coach_email: session.email, coach_user_id: null, status: "active" },
    { $set: { coach_user_id: session.userId } },
  );
}