// Shown while the subscription page works out what this account has.
//
// That work is not instant: it reads the account, and for a brand-new
// one it also starts the trial and sends the welcome email before it
// can render. Without this the browser keeps showing the PREVIOUS page
// for a second or two, with its buttons live — so someone can press
// "Start free trial" again, or "Subscribe", on a screen that is already
// out of date.
//
// A skeleton rather than a spinner: it occupies the same shape as the
// real card, so the answer arrives in place instead of the layout
// jumping when it does.

export default function Loading() {
  return (
    <div style={{ maxWidth: 620 }} aria-busy="true" aria-live="polite">
      <h1 style={{ marginBottom: 6 }}>Subscription</h1>
      <p style={{ color: "var(--ink-soft)", marginTop: 0 }}>
        Checking your account&hellip;
      </p>

      <section
        style={{
          marginTop: 26,
          padding: "22px 24px",
          border: "1px solid var(--line)",
          borderRadius: 18,
          background: "var(--paper)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="sub-skel" style={{ width: 9, height: 9, borderRadius: "50%" }} />
          <span className="sub-skel" style={{ width: 132, height: 18, borderRadius: 6 }} />
        </div>
        <div className="sub-skel" style={{ width: "72%", height: 14, borderRadius: 6, marginTop: 16 }} />
        <div className="sub-skel" style={{ width: 178, height: 44, borderRadius: 12, marginTop: 22 }} />
      </section>

      <style>{`
        .sub-skel{
          display:inline-block;
          background:linear-gradient(90deg,var(--paper-3) 25%,var(--paper-2) 37%,var(--paper-3) 63%);
          background-size:400% 100%;
          animation:sub-shimmer 1.4s ease-in-out infinite;
        }
        @keyframes sub-shimmer{0%{background-position:100% 0}100%{background-position:0 0}}
        @media (prefers-reduced-motion:reduce){
          .sub-skel{animation:none;background:var(--paper-3)}
        }
      `}</style>
    </div>
  );
}
