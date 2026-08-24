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
import { accounts, getSessionFromCookies } from "@/lib/auth";
import {
  ENTITLEMENT_FIELDS,
  entitlementFor,
  type Entitlement,
} from "@/lib/entitlement";
import Link from "next/link";
import Controls from "./Controls";
import Subscribe from "./Subscribe";
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
  cta: "checkout" | "manage" | "resume" | "none";
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
        : e.ends_at_expiry
        ? {
            // Cancelled, but still inside the paid period. Saying
            // "renews" here would be a lie the customer discovers on
            // the day it stops working.
            status: "Cancelled",
            tone: "warn",
            detail: `You keep access until ${when(e.expires_at)}. It won't renew after that.`,
            cta: "resume",
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
        detail: `${e.days_left} ${e.days_left === 1 ? "day" : "days"} left. Ends ${when(e.expires_at)}.`,
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
    // Shared with the API so the two cannot drift. stripe_customer_id is
    // this page's own extra — it decides whether a portal link is offered.
    { projection: { ...ENTITLEMENT_FIELDS, stripe_customer_id: 1 } },
  );
  const ent = entitlementFor(account);
  const c = copyFor(ent);
  const hasCustomer = Boolean(account?.stripe_customer_id);

  const dot =
    c.tone === "good"
      ? "var(--teal)"
      : c.tone === "warn"
        ? "var(--above)"
        : "var(--ink-mute)";

  return (
    <div style={{ maxWidth: 620 }}>
      <h1 style={{ marginBottom: 6 }}>Subscription</h1>
      <p style={{ color: "var(--ink-soft)", marginTop: 0 }}>{session.email}</p>

      <section
        style={{
          marginTop: 26,
          padding: "22px 24px",
          border: "1px solid var(--line)",
          borderRadius: 18,
          background: "var(--paper)",
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

        <p style={{ color: "var(--ink-soft)", margin: "10px 0 0", lineHeight: 1.6 }}>
          {c.detail}
        </p>

        <div style={{ marginTop: 20 }}>
          {(c.cta === "manage" || c.cta === "resume") && (
            <Controls
              cancelled={c.cta === "resume"}
              accessUntil={when(ent.expires_at)}
            />
          )}
          {c.cta === "checkout" && (
            <Subscribe label={ent.state === "trial" ? "Keep Ontor" : "Subscribe"} />
          )}
        </div>
      </section>

      {/* Quiet on purpose. Most people here are managing billing and
          already have it installed; this is for the ones who paid on the
          web and have not got round to it. */}
      <p style={{ color: "var(--ink-mute)", fontSize: 14, marginTop: 20 }}>
        Not installed yet?{" "}
        <Link href="/install/" style={{ color: "var(--teal)", fontWeight: 600 }}>
          Get Ontor for Mac, Windows, iPhone or Android
        </Link>
      </p>

      {hasCustomer && (
        <section style={{ marginTop: 22 }}>
          <ManageButton label="Payment method and invoices" />
          <p style={{ color: "var(--ink-mute)", fontSize: 14, marginTop: 10, lineHeight: 1.6 }}>
            Card details and receipts are held by Stripe, not by us. That page
            opens on their site.
          </p>
        </section>
      )}
    </div>
  );
}
