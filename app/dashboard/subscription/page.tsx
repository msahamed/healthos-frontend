// /dashboard/subscription — what you're on, and how to change it.
//
// Inside the dashboard shell, so it inherits the session gate in
// layout.tsx and cannot be reached signed out.
//
// The state shown here is DERIVED from the same entitlement code the
// app reads, not from a separate query. If this page and the app ever
// disagreed about whether someone is paid up, the support conversation
// that followed would be unanswerable.
//
// Card changes, invoices and cancellation all live in Stripe's portal.
// We link out rather than rebuild them — the alternative means handling
// card details, which is the one thing worth never touching.

import type { Metadata } from "next";
import Link from "next/link";
import { accounts, getSessionFromCookies } from "@/lib/auth";
import { entitlementFor, type Entitlement } from "@/lib/entitlement";
import ManageButton from "./ManageButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subscription — Ontor",
  robots: { index: false, follow: false },
};

function when(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Headline, supporting line, and whether checkout is the next step. */
function copyFor(e: Entitlement): {
  status: string;
  tone: "good" | "warn" | "plain";
  detail: string;
  cta: "checkout" | "manage" | "none";
} {
  switch (e.state) {
    case "active":
      return e.reason === "comped"
        ? {
            status: "Active",
            tone: "good",
            detail: "You have full access, with our thanks. Nothing to pay.",
            cta: "none",
          }
        : {
            status: "Active",
            tone: "good",
            detail: `Renews ${when(e.expires_at)}.`,
            cta: "manage",
          };
    case "trial":
      return {
        status: "Free trial",
        tone: "good",
        detail: `${e.days_left} ${e.days_left === 1 ? "day" : "days"} left — ends ${when(e.expires_at)}.`,
        cta: "checkout",
      };
    case "expired":
      return {
        status: e.reason === "lapsed" ? "Subscription ended" : "Trial ended",
        tone: "warn",
        detail:
          e.reason === "lapsed"
            ? "Your subscription is no longer active."
            : `Your free trial ended ${when(e.expires_at)}.`,
        cta: "checkout",
      };
    default:
      return {
        status: "No subscription",
        tone: "plain",
        detail: "Start with a 14-day free trial. No card needed.",
        cta: "checkout",
      };
  }
}

export default async function SubscriptionPage() {
  const session = await getSessionFromCookies();
  // layout.tsx already redirects, so this only guards the types.
  if (!session) return null;

  const col = await accounts();
  const account = await col.findOne(
    { email: session.email },
    {
      projection: {
        comped: 1,
        trial_started_at: 1,
        trial_days: 1,
        subscription_status: 1,
        current_period_end: 1,
        stripe_customer_id: 1,
      },
    },
  );
  const ent = entitlementFor(account);
  const c = copyFor(ent);
  const hasCustomer = Boolean(account?.stripe_customer_id);

  const dot =
    c.tone === "good" ? "#0F766E" : c.tone === "warn" ? "#B4462F" : "#8A8378";

  return (
    <div style={{ maxWidth: 620 }}>
      <h1 style={{ marginBottom: 6 }}>Subscription</h1>
      <p style={{ color: "#5A554B", marginTop: 0 }}>{session.email}</p>

      <section
        style={{
          marginTop: 26,
          padding: "22px 24px",
          border: "1px solid #E4DDD0",
          borderRadius: 14,
          background: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            aria-hidden="true"
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: dot,
              flex: "none",
            }}
          />
          <strong style={{ fontSize: 18 }}>{c.status}</strong>
        </div>

        <p style={{ color: "#5A554B", margin: "10px 0 0", lineHeight: 1.6 }}>
          {c.detail}
        </p>

        <div style={{ marginTop: 20 }}>
          {c.cta === "manage" && <ManageButton label="Manage subscription" />}
          {c.cta === "checkout" && (
            <>
              <Link href="/pricing/" className="primary" style={{ display: "inline-block" }}>
                {ent.state === "none" ? "See plans" : "Subscribe"}
              </Link>
              {hasCustomer && (
                <div style={{ marginTop: 12 }}>
                  <ManageButton label="Billing history" />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <p style={{ color: "#8A8378", fontSize: 14, marginTop: 18, lineHeight: 1.6 }}>
        Payment methods, invoices and cancellation are handled by Stripe.
      </p>
    </div>
  );
}
