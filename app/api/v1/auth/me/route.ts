// GET /api/v1/auth/me — who is this token, and is it still good?
//
// Returns: { user_id, email, role, expires_at } or 401.
//
// Two jobs. The obvious one is letting a client confirm it is still
// signed in on launch. The quieter one is that verifying a session
// slides its expiry (see verifySessionToken), so an app that pings
// this on cold start keeps an active install signed in indefinitely
// — the product rule being that you stay logged in until you log out
// or uninstall.

import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await requireSession(req);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user_id: session.userId,
    email: session.email,
    role: session.role,
    expires_at: session.expiresAt.toISOString(),
  });
}
