// POST /api/v1/stripe/webhook — Stripe telling us what it just did.
//
// This is the ONLY path by which a payment becomes access. The success
// page after checkout is not trusted for that: the buyer's browser can
// be closed, refreshed, or forged, and a card can fail months later
// with no browser involved at all. Stripe retries this endpoint until
// it gets a 2xx, which is why every failure below returns 500 rather
// than swallowing the event.
//
// Signature verification uses the RAW body — parsing it first changes
// the bytes and the signature stops matching. Hence req.text().
//
// ⚠️ REGISTER THIS ENDPOINT WITH THE TRAILING SLASH:
//
//     https://ontor.ai/api/v1/stripe/webhook/
//
// next.config.ts sets `trailingSlash: true`, which applies to /api too, so
// the slashless URL answers 308. Stripe does not follow redirects on webhook
// delivery — it counts a 3xx as a failed attempt, retries, and eventually
// gives up. Every payment would then be taken without access being granted,
// and the only symptom is failed deliveries in the Stripe dashboard. The
// same applies to `stripe listen --forward-to`.
//
// Handled events:
//   checkout.session.completed         — first payment; link the customer
//   customer.subscription.created      — the subscription's opening state
//   customer.subscription.updated      — renewal, dunning, cancel-at-end
//   customer.subscription.deleted      — it is over
//
// Everything else is acknowledged and ignored, deliberately: an
// unhandled event type is not an error, and 500-ing on one would make
// Stripe retry something we will never do anything with.

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { accounts } from "@/lib/auth";
import {
  sendCancelled,
  sendSubscribed,
  sendSubscriptionEnded,
} from "@/lib/billing-email";
import { normalizeStatus, periodEndOf, stripe, stripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Which account does this subscription belong to?
 *
 * Metadata first — we set it at checkout and it survives every later
 * event. The customer's email is the fallback for a subscription made
 * outside our checkout (the Stripe dashboard, say), and the customer id
 * is the last resort once a previous event has linked it.
 */
async function findAccountEmail(sub: Stripe.Subscription): Promise<string | null> {
  const tagged = sub.metadata?.ontor_email;
  if (tagged) return tagged.toLowerCase();

  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customerId) return null;

  const col = await accounts();
  const linked = await col.findOne(
    { stripe_customer_id: customerId },
    { projection: { email: 1 } },
  );
  if (linked?.email) return linked.email;

  const customer = await stripe().customers.retrieve(customerId);
  if (!customer.deleted && customer.email) return customer.email.toLowerCase();
  return null;
}

async function applySubscription(
  sub: Stripe.Subscription,
  eventAt: Date,
): Promise<void> {
  const email = await findAccountEmail(sub);
  if (!email) {
    // Nothing to write this to. Throwing would make Stripe retry forever
    // on an event we can never resolve, so record it and move on.
    console.error("[stripe] no account for subscription", sub.id);
    return;
  }

  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  const status = normalizeStatus(sub.status);
  const periodEnd = periodEndOf(sub);
  const cancelling = Boolean(sub.cancel_at_period_end);

  const col = await accounts();
  // Read BEFORE writing. Stripe sends subscription.updated for a dozen
  // reasons, most of which change nothing a customer would care about.
  // Emailing on the event rather than on the transition would mean a
  // "you cancelled" message every time an invoice was finalised.
  const before = await col.findOne(
    { email },
    { projection: { subscription_status: 1, cancel_at_period_end: 1 } },
  );

  // Refuse to apply an event older than the state we already hold.
  // Stripe makes no ordering promise, so a cancel and a resume issued
  // seconds apart can arrive backwards — and the loser of that race
  // silently becomes the truth. Doing the comparison inside the filter
  // keeps it atomic: two events landing together cannot both read
  // "nothing newer yet" and then both write.
  const res = await col.updateOne(
    {
      email,
      $or: [
        { subscription_synced_at: { $exists: false } },
        { subscription_synced_at: { $lte: eventAt } },
      ],
    },
    {
      $set: {
        subscription_status: status,
        current_period_end: periodEnd,
        // Cancelling at period end leaves Stripe's status on "active",
        // so this flag is the only way to tell "renews" from "ends".
        cancel_at_period_end: cancelling,
        subscription_synced_at: eventAt,
        stripe_subscription_id: sub.id,
        ...(customerId ? { stripe_customer_id: customerId } : {}),
      },
    },
  );

  if (res.matchedCount === 0) {
    console.warn("[stripe] ignored out-of-order event for", sub.id);
    return;
  }

  const justCancelled = cancelling && !before?.cancel_at_period_end;
  const justEnded =
    status === "canceled" && before?.subscription_status !== "canceled";

  if (justEnded) await sendSubscriptionEnded(email);
  else if (justCancelled) await sendCancelled(email, periodEnd);
}

export async function POST(req: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "billing_unavailable" }, { status: 503 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "no_webhook_secret" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "unsigned" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(
      await req.text(),
      signature,
      secret,
    );
  } catch (err) {
    // A bad signature is 400, never 500 — it is not something a retry
    // can fix, and Stripe should stop rather than hammer the endpoint.
    console.error("[stripe] signature check failed", err);
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }

  const eventAt = new Date(event.created * 1000);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        const email = (s.client_reference_id ?? s.customer_email ?? "").toLowerCase();
        const customerId =
          typeof s.customer === "string" ? s.customer : s.customer?.id;
        if (email && customerId) {
          const col = await accounts();
          await col.updateOne(
            { email },
            { $set: { stripe_customer_id: customerId } },
          );
        }
        // The subscription events carry the dates; this one only links
        // the customer. Fetching the subscription here as well makes
        // access immediate rather than waiting on event ordering.
        if (typeof s.subscription === "string") {
          const sub = await stripe().subscriptions.retrieve(s.subscription);
          await applySubscription(sub, eventAt);
          // Checkout completing is the one unambiguous "they just
          // subscribed" moment. subscription.created also fires, but it
          // fires for dashboard-created subscriptions too, where a
          // welcome email would be wrong.
          if (email) await sendSubscribed(email, periodEndOf(sub));
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await applySubscription(event.data.object, eventAt);
        break;
      default:
        break;
    }
  } catch (err) {
    // 500 so Stripe retries — a dropped event here means someone paid
    // and never got access.
    console.error("[stripe] handler failed", event.type, err);
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
