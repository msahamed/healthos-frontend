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
//
// This is now the first screen after "Start free trial" on /pricing
// (?next=/dashboard/subscription/, where the trial auto-starts), so
// it's framed like the rest of the site instead of floating on bare
// white: Nav up top, a bordered card on a recessed page background.
// Visual/copy only — request/verify logic, state, and the `next`
// redirect are unchanged from before this pass.

"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Nav from "../components/Nav";

type Step = "email" | "code";

function LoginForm() {
  const router = useRouter();
  // An invite link sends people here with ?next= pointing back at the
  // accept page, so signing in resumes what they were doing instead of
  // dumping them on the dashboard.
  const search = useSearchParams();
  const raw = search.get("next");
  const next = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
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
        router.replace(next);
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
    <main className="login-page" style={mainStyle}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={cardStyle}>
          {step === "email" ? (
            <>
              <h1 className="font-serif-display" style={h1Style}>
                Sign in
              </h1>
              <p style={subStyle}>We&apos;ll email you a six-digit code. No password.</p>

              <label htmlFor="login-email" style={labelStyle}>
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                autoFocus
                autoComplete="email"
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && requestCode()}
                className="login-input"
                style={inputStyle}
              />
              {error && <p style={errorStyle}>{error}</p>}
              <button
                onClick={requestCode}
                disabled={!emailOk || busy}
                className="login-btn"
                style={emailOk && !busy ? buttonStyle : buttonDisabledStyle}
              >
                {busy ? "Sending…" : "Send me a code"}
              </button>
            </>
          ) : (
            <>
              <h1 className="font-serif-display" style={h1Style}>
                Check your email
              </h1>
              <p style={subStyle}>
                Sent a six-digit code to {email}. It works once and expires in 10 minutes.
              </p>

              <label htmlFor="login-code" style={labelStyle}>
                Six-digit code
              </label>
              <input
                id="login-code"
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
                className="login-input"
                style={{ ...inputStyle, letterSpacing: "0.4em", fontSize: 22, fontWeight: 700, textAlign: "center" }}
              />
              {error && <p style={errorStyle}>{error}</p>}
              <button
                onClick={() => verify(code)}
                disabled={!codeOk || busy}
                className="login-btn"
                style={codeOk && !busy ? buttonStyle : buttonDisabledStyle}
              >
                {busy ? "Checking…" : "Sign in"}
              </button>
              <button
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError(null);
                }}
                className="login-link"
                style={linkStyle}
              >
                Use another email
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        .login-page {
          --lg-paper: #FFFFFF; --lg-paper-2: #F1ECE2; --lg-card: #FFFFFF;
          --lg-ink: #1B1A17; --lg-ink-soft: #5A554B;
          --lg-line: #E4DDD0; --lg-line-strong: #D6CDBC;
          --lg-teal: #0F766E; --lg-teal-dark: #0B5048;
        }
        @media (prefers-color-scheme: dark) {
          .login-page {
            --lg-paper: #14130F; --lg-paper-2: #1C1A15; --lg-card: #1C1A15;
            --lg-ink: #F3EFE6; --lg-ink-soft: #B5AE9F;
            --lg-line: #2E2A22; --lg-line-strong: #403A2F;
            --lg-teal: #4FB3A6; --lg-teal-dark: #7FD0C4;
          }
        }
        :root[data-theme="dark"] .login-page {
          --lg-paper: #14130F; --lg-paper-2: #1C1A15; --lg-card: #1C1A15;
          --lg-ink: #F3EFE6; --lg-ink-soft: #B5AE9F;
          --lg-line: #2E2A22; --lg-line-strong: #403A2F;
          --lg-teal: #4FB3A6; --lg-teal-dark: #7FD0C4;
        }
        :root[data-theme="light"] .login-page {
          --lg-paper: #FFFFFF; --lg-paper-2: #F1ECE2; --lg-card: #FFFFFF;
          --lg-ink: #1B1A17; --lg-ink-soft: #5A554B;
          --lg-line: #E4DDD0; --lg-line-strong: #D6CDBC;
          --lg-teal: #0F766E; --lg-teal-dark: #0B5048;
        }
        .login-input:focus-visible, .login-btn:focus-visible, .login-link:focus-visible {
          outline: 2px solid #F59E0B; outline-offset: 3px;
        }
        .login-input:focus { border-color: var(--lg-teal); }
        .login-btn:hover:not(:disabled) { background: var(--lg-teal-dark); }
        .login-link:hover { color: var(--lg-ink); }
      `}</style>
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  minHeight: "calc(100vh - 70px)",
  background: "var(--lg-paper-2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 24px",
};

const cardStyle: React.CSSProperties = {
  background: "var(--lg-card)",
  border: "1px solid var(--lg-line)",
  borderRadius: 18,
  padding: "36px 32px 32px",
  boxShadow: "0 1px 2px rgba(27,26,23,.04), 0 10px 28px rgba(15,118,110,.08)",
};

const h1Style: React.CSSProperties = {
  fontWeight: 500,
  fontSize: 30,
  lineHeight: 1.15,
  letterSpacing: "-0.015em",
  color: "var(--lg-ink)",
  margin: "0 0 8px",
};

const subStyle: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.5,
  color: "var(--lg-ink-soft)",
  margin: "0 0 26px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--lg-teal)",
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 50,
  padding: "0 14px",
  fontSize: 16.5,
  color: "var(--lg-ink)",
  background: "var(--lg-paper)",
  border: "1.5px solid var(--lg-line-strong)",
  borderRadius: 12,
  outline: "none",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  height: 50,
  marginTop: 18,
  fontSize: 16,
  fontWeight: 700,
  color: "#fff",
  background: "var(--lg-teal)",
  border: "none",
  borderRadius: 12,
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(15,118,110,.22)",
  transition: "background .15s",
};

const buttonDisabledStyle: React.CSSProperties = {
  ...buttonStyle,
  color: "var(--lg-ink-soft)",
  background: "var(--lg-line-strong)",
  boxShadow: "none",
  cursor: "default",
};

const linkStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 14,
  fontSize: 13.5,
  fontWeight: 600,
  color: "var(--lg-ink-soft)",
  background: "none",
  border: "none",
  cursor: "pointer",
  transition: "color .15s",
};

const errorStyle: React.CSSProperties = {
  fontSize: 13.5,
  lineHeight: 1.45,
  fontWeight: 600,
  color: "#B7492F",
  margin: "12px 0 0",
};

/**
 * useSearchParams needs a Suspense boundary: this page is otherwise
 * statically prerendered, and reading the query string at build time
 * is impossible. Nav sits outside the boundary so it's never part of
 * the flash; only the form area waits on the query string.
 */
export default function LoginPage() {
  return (
    <>
      <Nav />
      <Suspense fallback={<main className="login-page" style={mainStyle} />}>
        <LoginForm />
      </Suspense>
    </>
  );
}
