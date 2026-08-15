// POST /api/v1/auth/request — email a sign-in code.
//
// Body: { email }
// Returns: { ok: true } — always, for any well-formed address.
//
// This endpoint deliberately never reveals whether an account
// exists. It doesn't even look: a code is minted and mailed to any
// valid address, and the account is resolved later during /verify.
// That makes enumeration impossible by construction rather than by
// remembering to keep two branches symmetric.
//
// Issuing a code invalidates every previous one for that address, so
// there is never more than one live code per user. Combined with the
// per-email attempt cap in /verify (counted across codes, not per
// code), that closes the standard OTP break: re-requesting to farm
// fresh attempt budgets until the 6-digit space gives.

import { NextResponse } from "next/server";
import {
  authCodes,
  generateCode,
  hashCode,
  normalizeEmail,
  CODE_TTL_SEC,
  MAX_REQUESTS_PER_EMAIL,
  MAX_REQUESTS_PER_IP,
  REQUEST_WINDOW_SEC,
} from "@/lib/auth";
import { consume, clientIp } from "@/lib/rate-limit";
import { sendLoginCode } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { email?: unknown };
  try {
    body = (await req.json()) as { email?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    return NextResponse.json({ error: "email_required" }, { status: 400 });
  }

  const ip = clientIp(req);

  // Per-email first: this is the cap that stops someone using us to
  // bomb one person's inbox. The per-IP cap is the looser companion
  // that stops one host farming many addresses.
  const perEmail = await consume(
    `auth:request:email:${email}`,
    MAX_REQUESTS_PER_EMAIL,
    REQUEST_WINDOW_SEC,
  );
  if (!perEmail.ok) {
    return NextResponse.json(
      { error: "too_many_requests" },
      { status: 429, headers: { "Retry-After": String(perEmail.retryAfterSec) } },
    );
  }

  const perIp = await consume(
    `auth:request:ip:${ip}`,
    MAX_REQUESTS_PER_IP,
    REQUEST_WINDOW_SEC,
  );
  if (!perIp.ok) {
    return NextResponse.json(
      { error: "too_many_requests" },
      { status: 429, headers: { "Retry-After": String(perIp.retryAfterSec) } },
    );
  }

  const code = generateCode();
  const now = new Date();

  try {
    const col = await authCodes();
    // One live code per address, always. Deleting first means a user
    // who taps "resend" can't accidentally leave two valid codes in
    // flight, and an attacker can't hold one open while requesting
    // more.
    await col.deleteMany({ email });
    await col.insertOne({
      email,
      code_hash: hashCode(email, code),
      expires_at: new Date(now.getTime() + CODE_TTL_SEC * 1000),
      created_at: now,
      ip,
    });
  } catch (err) {
    console.error("[auth/request] store failed:", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  try {
    await sendLoginCode(email, code, CODE_TTL_SEC);
  } catch (err) {
    // Passwordless means a failed send is a user who cannot sign in
    // at all. Say so plainly instead of returning ok and stranding
    // them on a code screen that will never accept anything.
    console.error("[auth/request] send failed:", err);
    return NextResponse.json({ error: "email_send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, expires_in: CODE_TTL_SEC });
}
