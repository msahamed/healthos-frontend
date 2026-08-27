import Nav from "../components/Nav";
import type { Metadata } from "next";

// Pricing — Individual is the recommended plan: flat teal fill, cream text,
// so it reads as the plan to pick. Enterprise stays quiet/contact-us, but now
// carries a warm --pp-card fill (paper-2, not stark white) so the two cards
// read as one filled-card family instead of "loud color block vs empty box"
// (founder flagged the pairing as chaotic 2026-08-24; fix = fewer competing
// accents on Individual + a shared fill treatment across both cards, plus a
// tighter vertical rhythm throughout). 14-day free trial (no card), $20/mo or
// $168/yr ($14/mo, ~30% off).
//
// Server component; hover/focus states live in the trailing <style> block.
// globals.css has no dark palette yet, so this page carries its own scoped
// dark override (--pp-* tokens on .pricing-page), mirrored from the vetted
// dark values already in dashboard.css. Nothing outside app/pricing/ changed.
export const metadata: Metadata = {
  title: "Pricing — Ontor",
  description:
    "Try Ontor free for 14 days, no card required. $20 a month, or $168 a year ($14/mo, about 30% off). Enterprise: per-seat pricing for teams.",
};

const amber = "#F59E0B";
const amberInk = "#1B1A17";
const cream = "#FBF8F1";

function Check({ color }: { color: string }) {
  return <span style={{ color, fontWeight: 700 }} aria-hidden="true">✓</span>;
}

export default function Pricing() {
  return (
    <>
      <Nav />
      <main
        className="pricing-page"
        style={{
          minHeight: "100vh",
          background: "var(--pp-paper)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px 24px 56px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 880, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h1
            className="font-serif-display"
            style={{ fontWeight: 500, fontSize: "clamp(38px, 4.6vw, 56px)", lineHeight: 1.08, letterSpacing: "-0.015em", margin: "0 0 14px", textAlign: "center", maxWidth: 640, textWrap: "balance", color: "var(--pp-ink)" }}
          >
            Try Ontor free for <em style={{ fontStyle: "italic", color: "var(--pp-teal)" }}>14 days</em>
          </h1>

          <p style={{ color: "var(--pp-ink-soft)", fontSize: 17, margin: "0 0 28px", textAlign: "center", maxWidth: 520 }}>
            Near real-time voice analysis that shows how confident you sound. Start today, no card required.
          </p>

          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, width: "100%", alignItems: "stretch" }}
          >
            {/* Individual — recommended plan, solid teal fill so it's the visually dominant card */}
            <div style={{ background: "#0F766E", color: cream, borderRadius: 18, padding: "30px 30px 28px", display: "flex", flexDirection: "column", boxShadow: "0 6px 18px rgba(15,118,110,.22)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(251,248,241,.75)" }}>Individual</div>
                <div style={{ background: amber, color: amberInk, fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", borderRadius: 999, padding: "3px 12px", whiteSpace: "nowrap" }}>14 days free</div>
              </div>

              <div className="font-serif-display" style={{ fontWeight: 500, fontSize: 40, lineHeight: 1.1, letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}>
                $20<span style={{ fontSize: 18, fontWeight: 500, color: "rgba(251,248,241,.7)" }}>/month</span>
              </div>
              <div style={{ color: "rgba(251,248,241,.78)", fontSize: 14.5, marginTop: 8 }}>
                or <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, color: cream }}>$168</span>/year <span style={{ color: "rgba(251,248,241,.6)" }}>($14/mo)</span> · <span style={{ color: cream, fontWeight: 600 }}>save about 30%</span>
              </div>

              {/* Sign in, then straight to the subscription page, which
                  starts the trial itself for anyone who has never had
                  access. No second press, and nothing here that a
                  redirect could drop on the way. */}
              <a href="/login/?next=/dashboard/subscription/" className="price-btn-primary" style={{ display: "block", textAlign: "center", background: cream, color: "#0B5048", fontWeight: 700, fontSize: 16, borderRadius: 12, padding: "13px 20px", marginTop: 20, textDecoration: "none", boxShadow: "0 6px 18px rgba(0,0,0,.22)" }}>Start free trial</a>
              <div style={{ textAlign: "center", fontSize: 13, color: "rgba(251,248,241,.68)", marginTop: 8 }}>No card required</div>

              <div style={{ height: 1, background: "rgba(251,248,241,.18)", margin: "16px 0 14px" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 15.5 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}><Check color="rgba(251,248,241,.9)" /><span>Near real-time voice analysis as you speak</span></div>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}><Check color="rgba(251,248,241,.9)" /><span>Your baseline and your usual range</span></div>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}><Check color="rgba(251,248,241,.9)" /><span>Only your voice is measured, not the room</span></div>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}><Check color="rgba(251,248,241,.9)" /><span>Session history you can look back on</span></div>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                  <Check color="rgba(251,248,241,.9)" />
                  <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    Pattern analysis across your week
                    <span style={{ color: "rgba(251,248,241,.6)", fontSize: 12, fontWeight: 500 }}>soon</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Enterprise — quiet, contact-us. Filled with --pp-card (paper-2,
                not stark white) so it reads as the same card family as
                Individual, just at lower saturation, rather than a color
                block next to an empty rectangle. */}
            <div style={{ background: "var(--pp-card)", border: "1px solid var(--pp-line-strong)", borderRadius: 18, padding: "30px 30px 28px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--pp-teal)", marginBottom: 10 }}>Enterprise</div>
              <div className="font-serif-display" style={{ fontWeight: 500, fontSize: 34, lineHeight: 1.1, letterSpacing: "-0.01em", color: "var(--pp-ink)" }}>Let&rsquo;s talk</div>
              <div style={{ color: "var(--pp-ink-soft)", fontSize: 15, marginTop: 6 }}>Per-seat pricing for teams</div>
              <a href="#" className="price-btn-ghost" style={{ display: "block", textAlign: "center", background: "transparent", color: "var(--pp-teal)", fontWeight: 600, fontSize: 16, border: "1px solid var(--pp-line-strong)", borderRadius: 12, padding: "12px 20px", marginTop: 20, textDecoration: "none" }}>Contact us</a>
              <div style={{ textAlign: "center", fontSize: 13, color: "var(--pp-ink-soft)", marginTop: 8 }}>We&rsquo;ll tailor it to your team</div>
              <div style={{ height: 1, background: "var(--pp-line)", margin: "16px 0 14px" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 15.5, color: "var(--pp-ink)" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}><Check color="var(--pp-teal)" /><span>A dashboard for managers</span></div>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}><Check color="var(--pp-teal)" /><span>Seats you can add and manage</span></div>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}><Check color="var(--pp-teal)" /><span>Onboarding and rollout support</span></div>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}><Check color="var(--pp-teal)" /><span>Priority support</span></div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "center", marginTop: 28, color: "var(--pp-ink-soft)", fontSize: 14.5 }}>
            <span>Cancel anytime</span>
            <span style={{ color: "var(--pp-line-strong)" }}>·</span>
            <span>You choose when Ontor listens</span>
            <span style={{ color: "var(--pp-line-strong)" }}>·</span>
            <span>No card to start</span>
          </div>
        </div>

        <style>{`
          .pricing-page {
            --pp-paper: #FFFFFF; --pp-card: #F1ECE2; --pp-ink: #1B1A17; --pp-ink-soft: #5A554B;
            --pp-line: #E4DDD0; --pp-line-strong: #D6CDBC; --pp-teal: #0F766E;
          }
          @media (prefers-color-scheme: dark) {
            .pricing-page {
              --pp-paper: #14130F; --pp-card: #1C1A15; --pp-ink: #F3EFE6; --pp-ink-soft: #B5AE9F;
              --pp-line: #2E2A22; --pp-line-strong: #403A2F; --pp-teal: #4FB3A6;
            }
          }
          :root[data-theme="dark"] .pricing-page {
            --pp-paper: #14130F; --pp-card: #1C1A15; --pp-ink: #F3EFE6; --pp-ink-soft: #B5AE9F;
            --pp-line: #2E2A22; --pp-line-strong: #403A2F; --pp-teal: #4FB3A6;
          }
          :root[data-theme="light"] .pricing-page {
            --pp-paper: #FFFFFF; --pp-card: #F1ECE2; --pp-ink: #1B1A17; --pp-ink-soft: #5A554B;
            --pp-line: #E4DDD0; --pp-line-strong: #D6CDBC; --pp-teal: #0F766E;
          }
          .price-btn-primary { transition: background .2s, box-shadow .2s; }
          .price-btn-primary:hover { background: #F1ECE2; }
          .price-btn-ghost { transition: border-color .2s, background .2s; }
          .price-btn-ghost:hover { border-color: var(--pp-teal); background: color-mix(in srgb, var(--pp-teal) 12%, transparent); }
          .price-btn-primary:focus-visible, .price-btn-ghost:focus-visible { outline: 2px solid #F59E0B; outline-offset: 3px; }
        `}</style>
      </main>
    </>
  );
}
