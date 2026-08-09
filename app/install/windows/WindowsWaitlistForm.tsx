"use client";

import { useState } from "react";

// Posts to the existing /api/waitlist route (same one the homepage join
// form uses) with source: "install-windows" so signups from this page
// are countable separately. The route already accepts and tolerates an
// arbitrary `source` string, so no API change was needed for this.
export default function WindowsWaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "install-windows" }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return <p className="wn-success">You&apos;re on the list. We&apos;ll email you.</p>;
  }

  return (
    <>
      <form onSubmit={onSubmit} className="wn-form">
        <input
          type="email"
          inputMode="email"
          required
          aria-label="Email address"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Sending…" : "Tell me when it's ready"}
        </button>
      </form>
      {status === "error" && <p className="wn-error">Something went wrong. Please try again.</p>}
    </>
  );
}
