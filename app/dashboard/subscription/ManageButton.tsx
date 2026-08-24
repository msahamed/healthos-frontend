"use client";

import { useState } from "react";

/**
 * Opens Stripe's hosted billing portal.
 *
 * The URL is minted server-side per click rather than stored, because a
 * portal link is short-lived and tied to one customer — a cached one
 * would either be dead or, worse, still live in someone's history.
 */
export default function ManageButton({ label }: { label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/billing-portal/", { method: "POST" });
      const body = (await res.json()) as { url?: string; error?: string };
      if (res.ok && body.url) {
        window.location.href = body.url;
        return;
      }
      setError(
        body.error === "portal_unconfigured"
          ? "Billing portal isn't set up yet."
          : "Couldn't open billing just now. Try again in a moment.",
      );
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="primary" onClick={open} disabled={busy}>
        {busy ? "Opening…" : label}
      </button>
      {error && (
        <p style={{ color: "#B4462F", fontSize: 14, marginTop: 10 }}>{error}</p>
      )}
    </>
  );
}
