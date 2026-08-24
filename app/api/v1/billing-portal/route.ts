// POST /api/v1/billing-portal — a link into Stripe's hosted billing portal.
//
// Returns: { url } — open it in a browser. 401 without a session.
//
// Changing a card, downloading invoices and cancelling all happen on
// Stripe's pages, not ours. Rebuilding them would mean handling card
// details, which is exactly what we never want to touch; and Stripe's
// version is already localised, PCI-compliant and maintained.
//
// Accepts EITHER credential: the desktop app sends a bearer token, the
// website sends its httpOnly cookie. Same session store behind both.

import { NextResponse } from "next/server";
import {
  accounts,
  getSessionFromCookies,
  requireSession,
  type Session,
} from "@/lib/auth";
import { siteUrl, stripe, stripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function sessionFor(req: Request): Promise<Session | null> {
  return (await requireSession(req)) ?? (await getSessionFromCookies());
}

export async function POST(req: Request) {
  const session = await sessionFor(req);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "billing_unavailable" }, { status: 503 });
  }

  const col = await accounts();
  const account = await col.findOne(
    { email: session.email },
    { projection: { stripe_customer_id: 1 } },
  );
  // No customer means they have never checked out. There is nothing for
  // the portal to show, and Stripe would reject the call — say so
  // plainly so the caller can offer checkout instead.
  if (!account?.stripe_customer_id) {
    return NextResponse.json({ error: "no_customer" }, { status: 404 });
  }

  try {
    const portal = await stripe().billingPortal.sessions.create({
      customer: account.stripe_customer_id,
      return_url: `${siteUrl()}/dashboard/subscription/`,
    });
    return NextResponse.json(
      { url: portal.url },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    // The portal needs its settings saved once per mode in the Stripe
    // dashboard before the API will mint links. Until that happens this
    // throws, and the message is worth surfacing rather than a bare 500.
    console.error("[stripe] billing portal failed", err);
    return NextResponse.json(
      { error: "portal_unconfigured" },
      { status: 503 },
    );
  }
}
