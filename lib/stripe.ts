// Stripe client and the two prices we sell.
//
// Stripe is the till, not the source of truth. It knows how to take a
// card and tell us what happened; whether someone may USE Ontor is
// decided in lib/entitlement.ts from what we store. Keeping that line
// sharp is what lets the trial exist before Stripe has ever heard of
// the person, and what keeps a Stripe outage from locking anyone out.

import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function stripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  _stripe = new Stripe(key);
  return _stripe;
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export type Plan = "monthly" | "annual";

export function priceIdFor(plan: Plan): string {
  const id =
    plan === "annual"
      ? process.env.STRIPE_PRICE_ANNUAL
      : process.env.STRIPE_PRICE_MONTHLY;
  if (!id) throw new Error(`No Stripe price configured for plan "${plan}"`);
  return id;
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ontor.ai").replace(
    /\/$/,
    "",
  );
}

/**
 * When the paid period ends.
 *
 * Recent Stripe API versions moved `current_period_end` off the
 * subscription and onto each subscription ITEM, so the field is only on
 * the old shape. Read both: the item is authoritative where it exists,
 * and the subscription-level field keeps older API versions working.
 * Returning null here would silently expire a paying customer, so this
 * is worth the belt and braces.
 */
export function periodEndOf(sub: Stripe.Subscription): Date | null {
  const item = sub.items?.data?.[0] as { current_period_end?: number } | undefined;
  const epoch =
    item?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end;
  return typeof epoch === "number" ? new Date(epoch * 1000) : null;
}

/** Stripe's status vocabulary, narrowed to the three we store. */
export function normalizeStatus(
  status: Stripe.Subscription.Status,
): "active" | "past_due" | "canceled" {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due" || status === "unpaid") return "past_due";
  return "canceled";
}
