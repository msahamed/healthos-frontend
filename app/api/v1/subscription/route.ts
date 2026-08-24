// POST /api/v1/subscription — cancel or resume, without leaving Ontor.
//
// Body:    { action: "cancel" | "resume" }
// Returns: the resulting entitlement, same shape as GET /entitlement.
//
// Neither action touches a card, so neither needs Stripe's hosted
// pages. Sending someone to a third-party site to press one button —
// a button Stripe labels "Don't cancel subscription" — is a worse
// experience than doing it here. Changing a payment method and reading
// invoices DO involve card data and stay in the portal.
//
// Cancelling is always at period end, never immediately. They paid for
// the month; taking it away the moment they click would be theft
// dressed up as tidiness, and it is what generates chargebacks.
//
// The webhook remains the authority, but this endpoint writes the flag
// too, from the value Stripe just returned. Waiting for the event to
// come back round meant every response carried the PREVIOUS state:
// cancel returned "renewing", resume returned "ending". Not a rare
// race — it happened every single time, because a local read always
// wins against a network round trip.
//
// Both writers copy the same field from the same Stripe response, so
// there is nothing for them to disagree about; the webhook simply
// confirms what is already there, and remains the only path that can
// act on changes made outside this endpoint.

import { NextResponse } from "next/server";
import {
  accounts,
  getSessionFromCookies,
  requireSession,
  type Session,
} from "@/lib/auth";
import { entitlementForEmail } from "@/lib/entitlement";
import { periodEndOf, stripe, stripeConfigured } from "@/lib/stripe";

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

  let action: string | null = null;
  try {
    action = ((await req.json()) as { action?: string })?.action ?? null;
  } catch {
    action = null;
  }
  if (action !== "cancel" && action !== "resume") {
    return NextResponse.json({ error: "bad_action" }, { status: 400 });
  }

  const col = await accounts();
  const account = await col.findOne(
    { email: session.email },
    { projection: { stripe_subscription_id: 1 } },
  );
  if (!account?.stripe_subscription_id) {
    return NextResponse.json({ error: "no_subscription" }, { status: 404 });
  }

  // Read it back from Stripe before writing. The id we hold came from a
  // webhook, and acting on a stored id without checking who owns it is
  // how one account ends up cancelling another's subscription.
  const sub = await stripe().subscriptions.retrieve(
    account.stripe_subscription_id,
  );
  const owner = sub.metadata?.ontor_email?.toLowerCase();
  if (owner && owner !== session.email.toLowerCase()) {
    console.error("[subscription] ownership mismatch", sub.id, session.email);
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (sub.status === "canceled") {
    // Already over. Resuming a dead subscription means buying a new
    // one, which is checkout's job, not this endpoint's.
    return NextResponse.json({ error: "subscription_ended" }, { status: 409 });
  }

  const updated = await stripe().subscriptions.update(sub.id, {
    cancel_at_period_end: action === "cancel",
  });

  await col.updateOne(
    { email: session.email },
    {
      $set: {
        cancel_at_period_end: Boolean(updated.cancel_at_period_end),
        current_period_end: periodEndOf(updated),
      },
    },
  );

  return NextResponse.json(
    {
      ...(await entitlementForEmail(session.email)),
      access_until: periodEndOf(updated)?.toISOString() ?? null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
