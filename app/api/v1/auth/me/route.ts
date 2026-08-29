// GET /api/v1/auth/me — who is this token, and is it still good?
//
// Returns: { user_id, email, role, expires_at } or 401.
//
// Two jobs: confirm that a client is still signed in, and renew its idle
// window. Web sessions remain capped by their absolute 30-day lifetime.

import { NextResponse } from "next/server";
import {
  cookieToken,
  requireSession,
  SESSION_COOKIE,
  WEB_SESSION_IDLE_DAYS,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await requireSession(req);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const res = NextResponse.json({
    user_id: session.userId,
    email: session.email,
    role: session.role,
    expires_at: session.expiresAt.toISOString(),
  });
  // Keep an actively used browser signed in for seven days from its latest
  // visit. The server still enforces the hard 30-day reauthentication limit.
  const token = cookieToken(req);
  if (token) {
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: WEB_SESSION_IDLE_DAYS * 24 * 60 * 60,
    });
  }
  return res;
}
