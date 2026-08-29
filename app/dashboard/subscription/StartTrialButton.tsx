"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StartTrialButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/trial/start/", {
        method: "POST",
        credentials: "same-origin",
      });
      if (res.status === 401) {
        router.push("/login/?next=/dashboard/subscription/");
        return;
      }
      if (!res.ok) throw new Error("trial_start_failed");
      router.push("/install/?trial=started");
    } catch {
      setError("The trial couldn't start just now. Try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={start} disabled={busy}>
        {busy ? "Starting…" : "Start free trial"}
      </button>
      {error && (
        <p role="alert" style={{ color: "var(--above)", fontSize: 14, margin: "12px 0 0" }}>
          {error}
        </p>
      )}
    </>
  );
}
