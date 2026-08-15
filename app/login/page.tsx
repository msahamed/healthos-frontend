// /login — passwordless sign-in for the website.
//
// Drives the SAME two endpoints as the mobile app (/auth/request and
// /auth/verify); the only difference is `client: "web"`, which makes
// /auth/verify set an httpOnly cookie instead of only returning the
// token in the body. The browser never touches the token in JS, and
// the session is the same 365-day sliding one the app gets.
//
// Existing users need nothing special: every waitlist row that had
// installed the app was backfilled into `accounts`, so their address
// resolves to their existing user_id and their history the first time
// they sign in here.
//
// Already signed in? The server component redirects before this
// renders — see the session gate in app/dashboard/layout.tsx.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ink = "#1B1A17",
  inkSoft = "#5A554B",
  teal = "#0F766E",
  line = "#E4DDD0";

type Step = "email" | "code";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const codeOk = /^\d{6}$/.test(code.trim());

  async function requestCode() {
    if (!emailOk || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/auth/request/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (res.ok) {
        setStep("code");
      } else if (res.status === 429) {
        setError("Too many tries. Give it a few minutes.");
      } else {
        setError("Couldn't send a code just now. Try again in a minute.");
      }
    } catch {
      setError("Couldn't reach the server. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(value: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/auth/verify/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: value.trim(),
          client: "web",
        }),
      });
      if (res.ok) {
        // Cookie is set by the response; a full refresh makes the
        // server component pick it up.
        router.replace("/dashboard");
        router.refresh();
        return;
      }
      if (res.status === 429) {
        setError("Too many tries. Wait a few minutes, then ask for a new code.");
      } else if (res.status === 400) {
        setError("That code didn't work. Check it and try again.");
        setCode("");
      } else {
        setError("Something went wrong on our end. Try again.");
      }
    } catch {
      setError("Couldn't reach the server. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--paper)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: teal,
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          Ontor
        </div>

        {step === "email" ? (
          <>
            <h1 style={{ fontSize: 28, fontWeight: 600, color: ink, margin: "0 0 10px" }}>
              Sign in
            </h1>
            <p style={{ fontSize: 15.5, lineHeight: 1.5, color: inkSoft, margin: "0 0 24px" }}>
              We&apos;ll email you a six-digit code. No password.
            </p>
            <input
              type="email"
              value={email}
              autoFocus
              autoComplete="email"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && requestCode()}
              style={inputStyle}
            />
            {error && <p style={errorStyle}>{error}</p>}
            <button
              onClick={requestCode}
              disabled={!emailOk || busy}
              style={{ ...buttonStyle, opacity: emailOk && !busy ? 1 : 0.35 }}
            >
              {busy ? "Sending…" : "Send me a code"}
            </button>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 28, fontWeight: 600, color: ink, margin: "0 0 10px" }}>
              Check your email
            </h1>
            <p style={{ fontSize: 15.5, lineHeight: 1.5, color: inkSoft, margin: "0 0 24px" }}>
              Sent a six-digit code to {email}. It works once and expires in 10
              minutes.
            </p>
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              placeholder="000000"
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(v);
                // Submit on the sixth digit — nobody wants to type a
                // code and then hunt for a button.
                if (/^\d{6}$/.test(v)) verify(v);
              }}
              style={{ ...inputStyle, letterSpacing: "0.4em", fontSize: 22, fontWeight: 700 }}
            />
            {error && <p style={errorStyle}>{error}</p>}
            <button
              onClick={() => verify(code)}
              disabled={!codeOk || busy}
              style={{ ...buttonStyle, opacity: codeOk && !busy ? 1 : 0.35 }}
            >
              {busy ? "Checking…" : "Sign in"}
            </button>
            <button
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
              }}
              style={linkStyle}
            >
              Use another email
            </button>
          </>
        )}
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 52,
  padding: "0 14px",
  fontSize: 16.5,
  color: ink,
  background: "#fff",
  border: `1.5px solid ${line}`,
  borderRadius: 14,
  outline: "none",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  height: 52,
  marginTop: 16,
  fontSize: 16.5,
  fontWeight: 700,
  color: "#fff",
  background: teal,
  border: "none",
  borderRadius: 14,
  cursor: "pointer",
};

const linkStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 14,
  fontSize: 13.5,
  fontWeight: 600,
  color: inkSoft,
  background: "none",
  border: "none",
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = {
  fontSize: 13.5,
  lineHeight: 1.45,
  fontWeight: 500,
  color: ink,
  margin: "12px 0 0",
};
