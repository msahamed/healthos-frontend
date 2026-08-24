// GET /api/v1/entitlement — may this person use the product, and for how long?
//
// Returns: { state, days_left, expires_at } where state is one of
// none | trial | active | expired. 401 without a session.
//
// This is the ONLY thing a client learns about billing. No price, no
// product, no checkout URL — on iOS and Android, naming where to pay is
// steering, which Apple forbids outside the US. Desktop ships direct
// from ontor.ai and is free to link out, but it links to a URL it
// already knows; it does not learn one from here. Keeping the response
// identical on every platform means one code path and nothing to fail
// review over.

import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { entitlementForEmail } from "@/lib/entitlement";

export const runtime = "nodejs";
// Entitlement changes the moment Stripe's webhook lands; a cached
// answer would keep someone locked out after they paid.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await requireSession(req);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const ent = await entitlementForEmail(session.email);
  return NextResponse.json(ent, {
    headers: { "Cache-Control": "no-store" },
  });
}
