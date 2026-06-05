import Nav from "./components/Nav";
import Logo from "./components/Logo";
import InlineWaitlistForm from "./components/InlineWaitlistForm";
import HeroCinematic from "./components/landing/HeroCinematic";
import VoiceSnippet from "./components/landing/VoiceSnippet";
import CheckinRecording from "./components/landing/CheckinRecording";

// Real audio + video drop-in:
//   /public/audio/surgeon-preop.mp3
//   /public/audio/first-responder-postshift.mp3
//   /public/audio/performer-aftertheset.mp3
//   /public/landing/checkin.mp4
// Pass the path to the corresponding VoiceSnippet / CheckinRecording
// — both components gracefully fall back to placeholder animation if
// the file isn't there yet.
const SNIPPETS = [
  { label: "Surgeon · pre-op", duration: "0:09" /* src: "/audio/surgeon-preop.mp3" */ },
  { label: "First responder · post-shift", duration: "0:08" },
  { label: "Performer · after the set", duration: "0:11" },
];

export default function Home() {
  return (
    <>
      <Nav />

      <main id="top">
        {/* ════ HERO ════ */}
        <section className="hero">
          <div className="hero-bg-glow-1" />
          <div className="hero-bg-glow-2" />
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <span className="eyebrow eyebrow-dark">
                Voice-first self-understanding
              </span>
              <h1 className="font-serif-display">
                Your voice has been trying to tell you <em>something.</em>
              </h1>
              <p className="hero-sub">
                Every time you speak, your voice carries nine signals —
                energy, stress, mood, confidence, even vocal strain — that
                you&apos;ll never consciously hear, gone the second you stop
                talking. <strong>HealthOS catches them</strong>, and the
                patterns underneath, before they cost you.
              </p>

              <InlineWaitlistForm variant="hero" />

              <div className="hero-micro">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6FD6C9"
                  strokeWidth="2"
                >
                  <rect x="4" y="10" width="16" height="11" rx="2.5" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                On-device. Your voice never leaves your phone.
              </div>
            </div>

            <div className="cine-box">
              <HeroCinematic />
            </div>
          </div>
        </section>

        {/* ════ HEAR REAL LOGS (voice snippets) ════ */}
        <div className="logs-wrap">
          <section id="logs" className="section">
            <div className="wrap">
              <div className="sec-head center">
                <span className="eyebrow eyebrow-center">Hear real logs</span>
                <h2 className="font-serif-display">
                  This is all a check-in is.
                </h2>
                <p>
                  A few honest, unpolished seconds — no script, no
                  performance. Tap one to listen.
                </p>
              </div>
              <div className="snip-row">
                {SNIPPETS.map((s) => (
                  <VoiceSnippet
                    key={s.label}
                    label={s.label}
                    duration={s.duration}
                  />
                ))}
              </div>
              <p className="snip-note">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#5A554B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                </svg>
                Sample audio coming soon — sound on.
              </p>
            </div>
          </section>
        </div>

        {/* ════ SIGNALS (nine biomarkers) ════ */}
        <div className="signals-wrap">
          <section id="signals" className="section">
            <div className="wrap">
              <div className="sec-head center">
                <span className="eyebrow eyebrow-center">
                  What your voice reveals
                </span>
                <h2 className="font-serif-display">
                  Nine signals, read from how you sound.
                </h2>
                <p>
                  Not what you logged — how you actually came across. Zuri
                  reads all nine from a few honest seconds of speech.
                </p>
              </div>
              <div className="bio-grid">
                <Bio
                  title="Energy"
                  body="How much you've got in the tank today."
                  icon={
                    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
                  }
                />
                <Bio
                  title="Fatigue"
                  body="The tiredness under your words, before you'd name it."
                  icon={
                    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
                  }
                />
                <Bio
                  title="Stress"
                  body="The tension your voice carries first — before you notice it."
                  icon={<path d="M3 12h4l3-8 4 16 3-8h4" />}
                />
                <Bio
                  title="Mood"
                  body="Warmer or flatter than your usual week."
                  icon={
                    <>
                      <circle cx="12" cy="12" r="9" />
                      <path d="M8.5 14.5s1.5 2 3.5 2 3.5-2 3.5-2" />
                      <path d="M9 9.5v.5M15 9.5v.5" />
                    </>
                  }
                />
                <Bio
                  title="Vocal strain"
                  body="When your voice itself is running on empty."
                  icon={
                    <path d="M4 12h2M9 6v12M13 3v18M17 8v8M20 12h0" />
                  }
                />
                <Bio
                  title="Cognitive load"
                  body="How much you're juggling all at once."
                  icon={
                    <>
                      <path d="M12 3l9 5-9 5-9-5 9-5z" />
                      <path d="M3 13l9 5 9-5" />
                    </>
                  }
                />
                <Bio
                  title="Confidence"
                  body="Steady and sure, or hedging your way through."
                  icon={
                    <>
                      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
                      <path d="M9 12l2 2 4-4" />
                    </>
                  }
                />
                <Bio
                  title="Social engagement"
                  body="How connected or withdrawn you sound."
                  icon={
                    <>
                      <circle cx="9" cy="8" r="3" />
                      <path d="M3 20a6 6 0 0 1 12 0" />
                      <path d="M16 6a3 3 0 0 1 0 6" />
                      <path d="M18.5 20a6 6 0 0 0-3-5.2" />
                    </>
                  }
                />
                <Bio
                  title="Future orientation"
                  body="Looking ahead, or stuck in the right now."
                  icon={
                    <>
                      <circle cx="12" cy="12" r="9" />
                      <path d="M15.5 8.5l-2.2 5.3-5.3 2.2 2.2-5.3z" />
                    </>
                  }
                />
              </div>
            </div>
          </section>
        </div>

        {/* ════ PATTERNS ════ */}
        <section id="patterns" className="section">
          <div className="wrap">
            <div className="sec-head center">
              <span className="eyebrow eyebrow-center">The payoff</span>
              <h2 className="font-serif-display">
                The patterns hiding in plain sound.
              </h2>
              <p>
                None of these are things you&apos;d catch in yourself — and for
                the people who can&apos;t afford to miss them, that&apos;s the
                whole point.
              </p>
            </div>
            <div className="pat-grid">
              <PatCard>
                Your focus frays after your{" "}
                <em>second back-to-back case.</em>
              </PatCard>
              <PatCard>
                Burnout shows up in your voice <em>a week before</em> you feel
                it.
              </PatCard>
              <PatCard>
                Your confidence dips <em>the morning you compete.</em>
              </PatCard>
              <PatCard>
                You&apos;re still carrying the night shift{" "}
                <em>two days later.</em>
              </PatCard>
            </div>
          </div>
        </section>

        {/* ════ SEE IT (recording) ════ */}
        <div className="see-wrap">
          <section id="see" className="section">
            <div className="wrap see-grid">
              <div className="sec-head">
                <span className="eyebrow eyebrow-dark">See it in action</span>
                <h2 className="font-serif-display">
                  A real check-in, start to finish.
                </h2>
                <p className="dark-sub">
                  Thirty seconds of just talking — and watch it turn into
                  something you can actually read. This is the entire daily
                  ritual.
                </p>
                <div className="see-note">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6FD6C9"
                    strokeWidth="2"
                  >
                    <polygon points="6 4 20 12 6 20 6 4" />
                  </svg>
                  Tap to play — with sound
                </div>
              </div>
              <CheckinRecording />
            </div>
          </section>
        </div>

        {/* ════ CTA ════ */}
        <section id="join" className="section cta">
          <div className="wrap">
            <span className="eyebrow eyebrow-center">Early access</span>
            <h2 className="font-serif-display">
              See what your voice has <em>been telling you.</em>
            </h2>
            <InlineWaitlistForm variant="cta" />
            <div className="cta-micro">
              Free while in beta · iPhone first · On-device &amp; private · No
              spam, ever.
            </div>
          </div>
        </section>
      </main>

      {/* ════ FOOTER ════ */}
      <footer className="foot">
        <div className="wrap foot-inner">
          <div className="foot-brand-wrap">
            <span className="foot-brand">
              <Logo size={26} />
              HealthOS
            </span>
            <span className="foot-tag font-serif-display">
              Notices what you don&apos;t.
            </span>
          </div>
          <div className="foot-links">
            <a href="#signals">What it reveals</a>
            <a href="#join">Waitlist</a>
          </div>
        </div>
      </footer>

      <style>{LANDING_CSS}</style>
    </>
  );
}

function Bio({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bio">
      <span className="bio-ic">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0F766E"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icon}
        </svg>
      </span>
      <h4>{title}</h4>
      <p>{body}</p>
    </div>
  );
}

function PatCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="pat">
      <span className="qmark">Pattern</span>
      <p className="font-serif-display">{children}</p>
    </div>
  );
}

// ─── Landing-page CSS ───────────────────────────────────────────────────

const LANDING_CSS = `
.wrap { max-width: 1160px; margin: 0 auto; padding: 0 32px; }
.section { padding: 88px 0; }

/* Eyebrow */
.eyebrow {
  font-size: 12.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--teal); display: inline-flex; align-items: center; gap: 9px;
}
.eyebrow::before {
  content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--amber); flex-shrink: 0;
}
.eyebrow-dark { color: #6FD6C9; }
.eyebrow-center { justify-content: center; }

/* Section headers */
.sec-head { max-width: 660px; }
.sec-head h2 { font-size: clamp(30px, 3.8vw, 44px); line-height: 1.08; margin: 16px 0 0; }
.sec-head p { font-size: 18px; color: var(--ink-soft); margin: 18px 0 0; line-height: 1.6; }
.sec-head .dark-sub { color: #BFCAC7; }
.center { text-align: center; margin-left: auto; margin-right: auto; }

/* ── HERO ── */
.hero {
  position: relative; overflow: hidden;
  background: linear-gradient(168deg, #14272C 0%, #0E1D21 55%, #0A1417 100%);
  color: #F4F1EA;
}
.hero-bg-glow-1 {
  position: absolute; top: -25%; right: -10%; width: 60%; height: 90%;
  background: radial-gradient(circle, rgba(20,134,123,.45), transparent 68%);
  filter: blur(20px); pointer-events: none;
}
.hero-bg-glow-2 {
  position: absolute; bottom: -30%; left: -12%; width: 50%; height: 80%;
  background: radial-gradient(circle, rgba(245,158,11,.12), transparent 70%);
  filter: blur(20px); pointer-events: none;
}
.hero-grid {
  position: relative; display: grid; grid-template-columns: 1.05fr 0.95fr;
  gap: 48px; align-items: center; padding: 76px 0 84px;
}
.hero h1 {
  font-size: clamp(38px, 5vw, 60px); line-height: 1.04; margin: 22px 0 0;
  color: #FBF8F1; letter-spacing: -0.02em;
}
.hero h1 em { font-style: italic; color: #FCD34D; }
.hero-sub {
  margin: 26px 0 0; font-size: 18.5px; line-height: 1.62; color: #C9D4D2; max-width: 540px;
}
.hero-sub strong { color: #F4F1EA; font-weight: 600; }
.hero-micro {
  margin-top: 14px; font-size: 13.5px; color: #94A39F;
  display: inline-flex; align-items: center; gap: 8px;
}

/* Cinematic container */
.cine-box {
  position: relative; display: flex; align-items: center; justify-content: center;
  min-height: 740px;
}

/* ── HEAR REAL LOGS (voice snippets) ── */
.logs-wrap { background: var(--paper-2); }
.snip-row {
  display: flex; gap: 18px; margin-top: 50px;
  flex-wrap: wrap; justify-content: center;
}
.snip:hover {
  border-color: var(--line-strong) !important;
  box-shadow: 0 14px 30px rgba(27,26,23,.08);
  transform: translateY(-2px);
}
.snip-note {
  text-align: center; margin: 30px 0 0; font-size: 13.5px; color: var(--ink-soft);
  display: flex; align-items: center; justify-content: center; gap: 8px;
}

/* ── SIGNALS (nine biomarkers) ── */
.signals-wrap { background: var(--paper-3); }
.bio-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 54px;
}
.bio {
  background: #fff; border: 1px solid var(--line); border-radius: 18px;
  padding: 22px 22px 20px;
  transition: border-color .2s, box-shadow .2s, transform .2s;
}
.bio:hover {
  border-color: var(--line-strong);
  box-shadow: 0 14px 32px rgba(27,26,23,.08);
  transform: translateY(-3px);
}
.bio-ic {
  width: 44px; height: 44px; border-radius: 12px;
  background: var(--teal-surface); display: grid; place-items: center; margin-bottom: 15px;
}
.bio h4 {
  font-family: var(--font-hanken), sans-serif;
  font-size: 17px; font-weight: 700; margin: 0; letter-spacing: -0.01em; color: var(--ink);
}
.bio p {
  font-size: 14.5px; color: var(--ink-soft); margin: 6px 0 0; line-height: 1.5;
}

/* ── PATTERNS ── */
.pat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 52px; }
.pat {
  border: 1px solid var(--line); border-radius: 20px; padding: 30px 30px 28px;
  background: #FCFAF6; transition: border-color .2s, transform .2s, box-shadow .2s;
}
.pat:hover {
  border-color: var(--line-strong); transform: translateY(-2px);
  box-shadow: 0 16px 36px rgba(27,26,23,.07);
}
.pat .qmark {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; color: var(--teal);
}
.pat p {
  font-size: 25px; line-height: 1.28; margin: 14px 0 0;
  color: var(--ink); font-weight: 400;
}
.pat p em { font-style: italic; }

/* ── SEE IT (recording) ── */
.see-wrap { background: linear-gradient(170deg, #14272C, #0C181C); color: #F4F1EA; }
.see-grid {
  display: grid; grid-template-columns: 0.92fr 1.08fr; gap: 56px; align-items: center;
}
.see-wrap h2 {
  color: #FBF8F1; font-size: clamp(30px, 3.6vw, 42px); line-height: 1.1; margin: 16px 0 0;
}
.see-note {
  margin-top: 26px; font-size: 14px; color: #8FA09C;
  display: inline-flex; align-items: center; gap: 9px;
}

/* ── CTA ── */
.cta { text-align: center; }
.cta h2 {
  font-size: clamp(34px, 4.6vw, 56px); line-height: 1.06;
  margin: 18px auto 0; max-width: 820px;
}
.cta h2 em { font-style: italic; color: var(--teal); }
.cta-micro { margin-top: 16px; font-size: 13.5px; color: var(--ink-soft); }

/* ── FOOTER ── */
.foot { border-top: 1px solid var(--line); padding: 40px 0 56px; }
.foot-inner {
  display: flex; align-items: center; justify-content: space-between;
  gap: 20px; flex-wrap: wrap;
}
.foot-brand-wrap { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
.foot-brand {
  display: inline-flex; align-items: center; gap: 10px;
  font-weight: 700; font-size: 16px; color: var(--ink);
}
.foot-tag { font-style: italic; color: var(--ink-soft); font-size: 16px; }
.foot-links { display: flex; gap: 24px; font-size: 14px; color: var(--ink-soft); }
.foot-links a { color: inherit; text-decoration: none; transition: color .15s; }
.foot-links a:hover { color: var(--ink); }

/* ── Responsive ── */
@media (max-width: 920px) {
  .hero-grid, .see-grid { grid-template-columns: 1fr; gap: 44px; }
  .bio-grid { grid-template-columns: repeat(2, 1fr); }
  .cine-box { min-height: 0; }
  .pat-grid { grid-template-columns: 1fr; }
  .hero-grid { padding: 56px 0 64px; }
}
@media (max-width: 560px) {
  .wrap { padding: 0 20px; }
  .bio-grid { grid-template-columns: 1fr; }
  .section { padding: 64px 0; }
}
`;
