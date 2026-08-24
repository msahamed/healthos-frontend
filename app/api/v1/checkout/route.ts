// POST /api/v1/checkout — a Stripe Checkout URL for the signed-in account.
//
// Body:    { plan?: "monthly" | "annual" }
// Returns: { url } — open it in a browser. 401 without a session.
//
// The client never builds a checkout URL itself and never learns a price.
// It asks for a URL and opens it. That matters on desktop, where the app
// may show a real upgrade button (it ships direct from ontor.ai, outside
// any store), while iOS and Android show state only and never call this.
//
// The session is bound to the ACCOUNT's email, not to anything the buyer
// types. Stripe will not let them change it at checkout. If it were
// editable, someone could pay with a different address, the webhook
// would credit an account that doesn't exist, and they would stay locked
// out having been charged — the worst failure this system can produce.

import { NextResponse } from "next/server";
import { accounts, requireSession } from "@/lib/auth";
import { priceIdFor, siteUrl, stripe, stripeConfigured, type Plan } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await requireSession(req);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "billing_unavailable" }, { status: 503 });
  }

  let plan: Plan = "monthly";
  try {
    const body = (await req.json()) as { plan?: string };
    if (body?.plan === "annual") plan = "annual";
  } catch {
    // No body is fine — monthly is the default.
  }

  // Reuse the Stripe customer if this account has checked out before, so
  // a second subscription attempt doesn't create a duplicate customer
  // with the same email and split their billing history in two.
  const col = await accounts();
  const account = await col.findOne(
    { email: session.email },
    { projection: { stripe_customer_id: 1 } },
  );
  const customerId = account?.stripe_customer_id ?? null;

  const checkout = await stripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceIdFor(plan), quantity: 1 }],
    ...(customerId
      ? { customer: customerId }
      : { customer_email: session.email }),
    // Both carry the account email so the webhook can find the account
    // whether it reads the session or the subscription that follows it.
    client_reference_id: session.email,
    subscription_data: { metadata: { ontor_email: session.email } },
    metadata: { ontor_email: session.email },
    allow_promotion_codes: true,
    success_url: `${siteUrl()}/upgrade/done?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/pricing`,
  });

  return NextResponse.json(
    { url: checkout.url },
    { headers: { "Cache-Control": "no-store" } },
  );
}
