"use client";

import { useState } from "react";

// Compact email-only waitlist form used in the landing hero + CTA
// section. Hero variant uses amber-on-dark (high contrast against the
// dark teal hero); CTA variant uses teal-on-paper (matches the
// editorial body).

type Variant = "hero" | "cta";

type Props = {
  variant?: Variant;
  buttonLabel?: string;
  successLabel?: string;
};

export default function InlineWaitlistForm({
  variant = "cta",
  buttonLabel,
  successLabel = "You're on the list — talk to you soon. ✦",
}: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        style={{
          marginTop: 32,
          fontSize: 16,
          fontWeight: 600,
          minHeight: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: variant === "cta" ? "center" : "flex-start",
          color: variant === "hero" ? "#FCD34D" : "var(--teal)",
        }}
      >
        {successLabel}
      </div>
    );
  }

  const isHero = variant === "hero";
  const label = buttonLabel ?? (isHero ? "Get early access" : "Join the waitlist");

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="signup"
        style={{
          marginTop: 32,
          display: "flex",
          gap: 10,
          maxWidth: 460,
          ...(variant === "cta" ? { marginLeft: "auto", marginRight: "auto" } : {}),
        }}
      >
        <input
          type="email"
          inputMode="email"
          required
          aria-label="Email address"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            flex: 1,
            fontFamily: "inherit",
            fontSize: 15.5,
            color: "var(--ink)",
            background: isHero ? "#FBF9F4" : "#fff",
            border: `1.5px solid ${isHero ? "transparent" : "var(--line)"}`,
            borderRadius: 13,
            padding: "14px 16px",
            outline: "none",
            transition: "border-color .2s",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = isHero ? "var(--amber)" : "var(--teal)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = isHero
              ? "transparent"
              : "var(--line)")
          }
        />
        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            fontFamily: "inherit",
            fontSize: 15,
            fontWeight: 600,
            border: "none",
            borderRadius: 13,
            padding: "14px 22px",
            cursor: status === "loading" ? "default" : "pointer",
            whiteSpace: "nowrap",
            background: isHero ? "var(--amber)" : "var(--teal)",
            color: isHero ? "#3B2606" : "#fff",
            boxShadow: isHero
              ? "0 8px 22px rgba(245,158,11,.35)"
              : "0 8px 22px rgba(15,118,110,.28)",
            opacity: status === "loading" ? 0.7 : 1,
            transition: "transform .15s, box-shadow .2s, background .2s",
          }}
        >
          {status === "loading" ? "Joining…" : label}
        </button>
      </form>
      {status === "error" && (
        <p
          style={{
            marginTop: 10,
            fontSize: 13.5,
            color: isHero ? "#FCA5A5" : "#B91C1C",
          }}
        >
          Something went wrong — please try again.
        </p>
      )}
    </>
  );
}
