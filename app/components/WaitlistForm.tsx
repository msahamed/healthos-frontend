"use client";

import { useState } from "react";

const TEAL = "#0F766E";
const TEAL_LIGHT = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";
const AMBER = "#F59E0B";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, feedback }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        className="rounded-2xl p-8 text-center border"
        style={{ backgroundColor: TEAL_LIGHT, borderColor: TEAL_BORDER }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: TEAL }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">You're on the list!</h3>
        <p className="text-slate-500 text-sm">We'll reach out as soon as HealthOS is ready for early access.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
          Email address <span className="text-red-400">*</span>
        </label>
        <input
          id="email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:ring-2 transition-all"
          style={{ ["--tw-ring-color" as string]: TEAL }}
        />
      </div>
      <div>
        <label htmlFor="feedback" className="block text-sm font-medium text-slate-700 mb-1.5">
          What features matter most to you? <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="feedback"
          rows={3}
          placeholder="e.g. voice search, Apple Health sync, sharing records with my doctor…"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:ring-2 resize-none transition-all"
          style={{ ["--tw-ring-color" as string]: TEAL }}
        />
      </div>
      {status === "error" && (
        <p className="text-red-500 text-sm">Something went wrong — please try again.</p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3.5 rounded-xl font-semibold text-sm text-white shadow-md hover:opacity-90 transition-all disabled:opacity-60"
        style={{ backgroundColor: AMBER }}
      >
        {status === "loading" ? "Joining…" : "Join the Waitlist"}
      </button>
      <p className="text-center text-xs text-slate-400">No spam. We'll only email you when early access is ready.</p>
    </form>
  );
}
