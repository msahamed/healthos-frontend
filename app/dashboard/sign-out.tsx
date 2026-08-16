// Sign out of the website.
//
// Coherent here in a way it was not in the mobile app: the web has a
// login page, so signing out lands you somewhere you can sign back in
// from. In the app it was a one-way door, which is why it was removed
// there and kept here.
//
// POSTs to /api/v1/auth/logout, which revokes the session row server
// side and clears the cookie. Revoking matters: the session is a
// year-long credential, so "log out" has to actually kill it, not just
// forget it locally.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/v1/auth/logout/", { method: "POST" });
    } catch {
      // The cookie may still be live if the network failed. Falling
      // through to /login is right either way: the page is session
      // gated, so a still-valid cookie simply lands you back inside
      // rather than pretending you left.
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <button className="signout" onClick={signOut} disabled={busy} type="button">
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
