// /upgrade/done — where Stripe sends someone straight after paying.
//
// Deliberately NOT behind the session gate. People sign in on the
// desktop app and pay in a browser; those are different session stores,
// so requiring a login here would put a wall in front of somebody who
// has just handed over money. The `session_id` Stripe appends IS the
// proof — we retrieve it server-side and only confirm what Stripe
// itself reports.
//
// This page never grants access. The webhook does that, and it has
// usually landed before the browser gets here. What this page owes the
// reader is a plain confirmation and a way back.

import type { Metadata } from "next";
import Link from "next/link";
import { stripe, stripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "You're subscribed — Ontor",
  robots: { index: false, follow: false },
};

const ink = "#1B1A17",
  inkSoft = "#5A554B",
  teal = "#0F766E",
  line = "#E4DDD0";

function money(amount: number | null | undefined, currency = "usd"): string {
  if (amount == null) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export default async function UpgradeDone({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  let email: string | null = null;
  let amount: string | null = null;
  let interval: string | null = null;
  let paid = false;

  if (sessionId && stripeConfigured()) {
    try {
      const s = await stripe().checkout.sessions.retrieve(sessionId, {
        expand: ["line_items"],
      });
      paid = s.payment_status === "paid" || s.status === "complete";
      email = s.customer_details?.email ?? null;
      const item = s.line_items?.data?.[0];
      amount = money(item?.price?.unit_amount, item?.price?.currency);
      interval = item?.price?.recurring?.interval ?? null;
    } catch {
      // A bad or expired session id lands here. Fall through to the
      // generic message rather than showing an error to someone whose
      // payment very likely succeeded.
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "40px 22px",
        background: "#FBF8F2",
        color: ink,
      }}
    >
      <div style={{ maxWidth: 460, width: "100%", textAlign: "center" }}>
        <div
          aria-hidden="true"
          style={{
            width: 52,
            height: 52,
            margin: "0 auto 22px",
            borderRadius: "50%",
            background: teal,
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          ✓
        </div>

        <h1
          className="font-serif-display"
          style={{ fontSize: 32, lineHeight: 1.15, letterSpacing: "-0.01em", margin: 0 }}
        >
          {paid ? "You're subscribed" : "Thanks, you're all set"}
        </h1>

        <p style={{ color: inkSoft, fontSize: 16, lineHeight: 1.6, marginTop: 14 }}>
          {amount && interval
            ? `${amount} per ${interval}${email ? `, billed to ${email}` : ""}.`
            : "Your subscription is active."}
        </p>

        <p style={{ color: inkSoft, fontSize: 16, lineHeight: 1.6, marginTop: 10 }}>
          Open Ontor and it will pick this up on its own. Nothing else to do.
        </p>

        <div
          style={{
            marginTop: 28,
            paddingTop: 22,
            borderTop: `1px solid ${line}`,
            fontSize: 15,
          }}
        >
          <Link href="/dashboard/subscription/" style={{ color: teal, fontWeight: 600 }}>
            Manage your subscription
          </Link>
          <span style={{ color: inkSoft }}> · </span>
          <Link href="/" style={{ color: inkSoft }}>
            Back to ontor.ai
          </Link>
        </div>
      </div>
    </main>
  );
}
