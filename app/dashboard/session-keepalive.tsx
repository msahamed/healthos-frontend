"use client";

import { useEffect } from "react";

// Refreshes the seven-day browser cookie when someone returns to an open
// dashboard. The endpoint also updates the server-side idle clock. It never
// extends the hard 30-day reauthentication limit.
export default function SessionKeepalive() {
  useEffect(() => {
    const refresh = () => {
      void fetch("/api/v1/auth/me/", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };

    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
