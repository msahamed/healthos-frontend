import Nav from "../components/Nav";
import type { Metadata } from "next";

// Pricing — ported from the approved Claude Design "Ontor Pricing" (.dc.html),
// default variant (white Individual card with a teal border). Server component;
// hover/focus live in the trailing <style> block, matching the site's pattern.
export const metadata: Metadata = {
  title: "Pricing — Ontor",
  description:
    "Try Ontor free for 30 days, then $19.99 / month. Near real-time voice analysis that shows how confident you sound. Enterprise: per-seat pricing for teams.",
};

const ink = "#1B1A17",
  inkSoft = "#5A554B",
  teal = "#0F766E",
  amber = "#F59E0B",
  line = "#E4DDD0",
  lineStrong = "#D6CDBC";

function Check({ color = teal }: { color?: string }) {
  return <span style={{ color, fontWeight: 700 }} aria-hidden="true">✓</span>;
}

export default function Pricing() {
  return (
    <>
      <Nav />
      <main
        style={{
          minHeight: "100vh",
          background: "var(--paper)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "72px 24px 88px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 880, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", color: teal, textTransform: "uppercase", marginBottom: 14 }}>
            Pricing
          </div>

          <h1
            className="font-serif-display"
            style={{ fontWeight: 500, fontSize: "clamp(38px, 4.6vw, 56px)", lineHeight: 1.08, letterSpacing: "-0.015em", margin: "0 0 18px", textAlign: "center", maxWidth: 640, textWrap: "balance" }}
          >
            Try Ontor free for <em style={{ fontStyle: "italic", color: teal }}>30 days</em>
          </h1>

          <p style={{ color: inkSoft, fontSize: 18, margin: "0 0 48px", textAlign: "center", maxWidth: 520 }}>
            Near real-time voice analysis that shows how confident you sound. Start today, no card required.
          </p>

          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, width: "100%", alignItems: "stretch" }}
          >
            {/* Individual */}
            <div style={{ background: "#fff", color: ink, border: `1px solid ${teal}`, borderRadius: 18, padding: "34px 32px 30px", display: "flex", flexDirection: "column", boxShadow: "0 6px 24px rgba(15,118,110,.14)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: teal }}>Individual</div>
                <div style={{ background: "#FBEFD3", border: "1px solid #FCD34D", color: ink, fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", borderRadius: 999, padding: "3px 12px", whiteSpace: "nowrap" }}>30 days free</div>
              </div>
              <div className="font-serif-display" style={{ fontWeight: 500, fontSize: 34, lineHeight: 1.1, letterSpacing: "-0.01em" }}>Free for 30 days</div>
              <div style={{ color: inkSoft, fontSize: 15, marginTop: 6 }}>
                then <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, color: ink }}>$19.99</span> / month
              </div>
              <a href="#" className="price-btn-primary" style={{ display: "block", textAlign: "center", background: teal, color: "#fff", fontWeight: 600, fontSize: 16, borderRadius: 12, padding: "13px 20px", marginTop: 24, textDecoration: "none", boxShadow: "0 6px 18px rgba(15,118,110,.22)" }}>Start free trial</a>
              <div style={{ textAlign: "center", fontSize: 13, color: inkSoft, marginTop: 10 }}>No card required</div>
              <div style={{ height: 1, background: line, margin: "22px 0 18px" }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: inkSoft, marginBottom: 12 }}>Everything you need to read your own voice:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11, fontSize: 15.5 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}><Check /><span>Near real-time voice analysis as you speak</span></div>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}><Check /><span>Your baseline and your usual range</span></div>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}><Check /><span>Only your voice is measured, not the room</span></div>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}><Check /><span>Session history you can look back on</span></div>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                  <Check />
                  <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    Pattern analysis across your week
                    <span style={{ background: "#FBEFD3", border: "1px solid #FCD34D", color: ink, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", borderRadius: 999, padding: "1px 9px" }}>Coming</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Enterprise */}
            <div style={{ background: "#fff", border: `1px solid ${line}`, borderRadius: 18, padding: "34px 32px 30px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: teal, marginBottom: 10 }}>Enterprise</div>
              <div className="font-serif-display" style={{ fontWeight: 500, fontSize: 34, lineHeight: 1.1, letterSpacing: "-0.01em" }}>Let&rsquo;s talk</div>
              <div style={{ color: inkSoft, fontSize: 15, marginTop: 6 }}>Per-seat pricing for teams</div>
              <a href="#" className="price-btn-ghost" style={{ display: "block", textAlign: "center", background: "transparent", color: teal, fontWeight: 600, fontSize: 16, border: `1px solid ${lineStrong}`, borderRadius: 12, padding: "12px 20px", marginTop: 24, textDecoration: "none" }}>Contact us</a>
              <div style={{ textAlign: "center", fontSize: 13, color: inkSoft, marginTop: 10 }}>We&rsquo;ll tailor it to your team</div>
              <div style={{ height: 1, background: line, margin: "22px 0 18px" }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: inkSoft, marginBottom: 12 }}>Everything in Individual, plus:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11, fontSize: 15.5 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}><Check /><span>A dashboard for managers</span></div>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}><Check /><span>Seats you can add and manage</span></div>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}><Check /><span>Onboarding and rollout support</span></div>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}><Check /><span>Priority support</span></div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "center", marginTop: 40, color: inkSoft, fontSize: 14.5 }}>
            <span>Cancel anytime</span>
            <span style={{ color: lineStrong }}>·</span>
            <span>You choose when Ontor listens</span>
            <span style={{ color: lineStrong }}>·</span>
            <span>No card to start</span>
          </div>
        </div>

        <style>{`
          .price-btn-primary { transition: background .2s, box-shadow .2s; }
          .price-btn-primary:hover { background: #0B5048; }
          .price-btn-ghost { transition: border-color .2s, background .2s; }
          .price-btn-ghost:hover { border-color: ${teal}; background: #E8F1EF; }
          .price-btn-primary:focus-visible, .price-btn-ghost:focus-visible { outline: 2px solid ${amber}; outline-offset: 3px; }
        `}</style>
      </main>
    </>
  );
}
