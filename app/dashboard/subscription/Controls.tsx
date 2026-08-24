"use client";

// Cancel and resume, in place.
//
// Cancelling asks once before doing it, inline rather than in a browser
// dialog — a native confirm() is easy to dismiss by reflex and reads as
// a bug on a page like this. Resuming asks nothing; it is not a
// decision anyone regrets.
//
// After either action the page is refreshed from the server rather than
// patched locally. The server derives status from the same entitlement
// code everything else uses, so a local guess is one more place for the
// page to disagree with the truth.

import { useRouter } from "next/navigation";
import { useState } from "react";

type Busy = null | "cancel" | "resume";

export default function Controls({
  cancelled,
  accessUntil,
}: {
  cancelled: boolean;
  accessUntil: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<Busy>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "cancel" | "resume") {
    if (busy) return;
    setBusy(action);
    setError(null);
    try {
      const res = await fetch("/api/v1/subscription/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(
          body.error === "subscription_ended"
            ? "That subscription has already ended. Start a new one from the plans page."
            : "That didn't go through. Try again in a moment.",
        );
        return;
      }
      setConfirming(false);
      router.refresh();
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setBusy(null);
    }
  }

  if (cancelled) {
    return (
      <>
        <button
          type="button"
          className="primary"
          onClick={() => act("resume")}
          disabled={busy !== null}
        >
          {busy === "resume" ? "Resuming…" : "Resume subscription"}
        </button>
        <p style={{ color: "#8A8378", fontSize: 14, marginTop: 12 }}>
          Nothing to re-enter. Your card and history are still here.
        </p>
        {error && <Err>{error}</Err>}
      </>
    );
  }

  if (confirming) {
    return (
      <div
        style={{
          padding: "16px 18px",
          border: "1px solid #E4DDD0",
          borderRadius: 12,
          background: "#FBF8F2",
        }}
      >
        <p style={{ margin: "0 0 14px", lineHeight: 1.6 }}>
          You&rsquo;ll keep full access until <strong>{accessUntil}</strong>, which
          you&rsquo;ve already paid for. Nothing is deleted, and you can resume any
          time before then.
        </p>
        <button
          type="button"
          className="primary"
          onClick={() => act("cancel")}
          disabled={busy !== null}
          style={{ background: "#B4462F" }}
        >
          {busy === "cancel" ? "Cancelling…" : "Yes, cancel"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={busy !== null}
          style={{
            marginLeft: 12,
            background: "none",
            border: "none",
            color: "#5A554B",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Keep it
        </button>
        {error && <Err>{error}</Err>}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        style={{
          background: "none",
          border: "1px solid #D6CDBC",
          borderRadius: 10,
          padding: "10px 16px",
          color: "#5A554B",
          fontSize: 15,
          cursor: "pointer",
        }}
      >
        Cancel subscription
      </button>
      {error && <Err>{error}</Err>}
    </>
  );
}

function Err({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: "#B4462F", fontSize: 14, marginTop: 10 }}>{children}</p>
  );
}
