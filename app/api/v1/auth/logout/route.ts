// POST /api/v1/auth/logout — revoke this session.
//
// Deletes the session row, so the token is dead everywhere
// immediately. This is the whole reason sessions are rows in Mongo
// rather than self-contained JWTs: a year-long credential that
// cannot be revoked is not a credential you want on a lost phone.
//
// Always 200, even with a missing or already-dead token. Logout is
// idempotent by nature, and a client that can't log out because the
// server objected to the state of its token is a client stuck signed
// in.

import { NextResponse } from "next/server";
import { bearerToken, revokeSession, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const token = bearerToken(req);
  if (token) {
    try {
      await revokeSession(token);
    } catch (err) {
      console.error("[auth/logout]", err);
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
