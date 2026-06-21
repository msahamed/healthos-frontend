"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";

// Sticky nav matching the landing's paper palette. Picks up a hairline
// border once the user scrolls past the hero — the design's subtle
// "you've left the top" affordance.
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background:
          "color-mix(in srgb, var(--paper) 88%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${scrolled ? "var(--line)" : "transparent"}`,
        transition: "border-color .25s",
      }}
    >
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: "0 32px",
          height: 70,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/#top"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: "-0.01em",
            color: "var(--ink)",
            textDecoration: "none",
          }}
        >
          <Logo size={30} />
          HealthOS
        </Link>

        <nav
          className="nav-links-row"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 30,
            fontSize: 14.5,
            fontWeight: 500,
            color: "var(--ink-soft)",
          }}
        >
          <Link href="/#signals" className="nav-link">
            What it reveals
          </Link>
          <Link href="/faq" className="nav-link">
            FAQ
          </Link>
        </nav>

        <Link
          href="/#join"
          style={{
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 600,
            background: "var(--teal)",
            color: "#fff",
            borderRadius: 12,
            padding: "9px 16px",
            whiteSpace: "nowrap",
            boxShadow: "0 6px 18px rgba(15,118,110,.22)",
            textDecoration: "none",
            transition: "transform .15s, box-shadow .2s, background .2s",
          }}
        >
          Join the waitlist
        </Link>
      </div>

      {/* Nav links hover + responsive hide via plain CSS */}
      <style>{`
        .nav-link { color: inherit; text-decoration: none; transition: color .15s; }
        .nav-link:hover { color: var(--ink); }
        @media (max-width: 720px) {
          .nav-links-row { display: none !important; }
        }
      `}</style>
    </header>
  );
}
