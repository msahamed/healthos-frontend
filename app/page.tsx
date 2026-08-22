import InlineWaitlistForm from "./components/InlineWaitlistForm";
import HeroTimeline from "./components/landing/HeroTimeline";
import Nav from "./components/Nav";
import PatternSection from "./components/landing/PatternSection";

// Ontor homepage — performance-intelligence relaunch.
// Ported from the approved Claude Design "Ontor Home". The hero visual is
// the product itself: an animated call timeline where dots appear only when
// YOU speak; the gaps are the other person, never captured (mic-gated).
// Waitlist form = real <InlineWaitlistForm> (POST /api/waitlist). Nav = real <Nav>.

const ink = "#1B1A17", inkSoft = "#5A554B", teal = "#0F766E", amber = "#F59E0B";

export default function Home() {
  return (
    <>
      <Nav />

      <main id="top">
        {/* ════ HERO ════ */}
        <section style={{ position: "relative", overflow: "hidden", isolation: "isolate", background: "linear-gradient(168deg, #14272C 0%, #0E1D21 55%, #0A1417 100%)", color: "#F4F1EA" }}>
          <div style={{ position: "absolute", top: "-25%", right: "-10%", width: "60%", height: "90%", background: "radial-gradient(circle, rgba(20,134,123,.4), transparent 68%)", filter: "blur(20px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-30%", left: "-12%", width: "50%", height: "80%", background: "radial-gradient(circle, rgba(245,158,11,.1), transparent 70%)", filter: "blur(20px)", pointerEvents: "none" }} />
          <div className="hos-hero-grid" style={{ position: "relative", zIndex: 1, maxWidth: 1160, margin: "0 auto", padding: "76px 32px 88px", display: "grid", gridTemplateColumns: "1fr 1.22fr", gap: 48, alignItems: "center" }}>
            <div>
              <span style={eyebrow("#6FD6C9")}><span style={eyeDot} />For calls where your focus matters</span>
              <h1 className="font-serif-display" style={{ fontWeight: 500, fontSize: "clamp(38px, 4.6vw, 56px)", lineHeight: 1.05, letterSpacing: "-0.02em", margin: "22px 0 0", color: "#FBF8F1" }}>
                Call after call. A long day at your computer. Tired? Is your focus starting <em style={{ fontStyle: "italic", color: "#FCD34D" }}>to slip?</em>
              </h1>
              <p style={{ maxWidth: 500, margin: "22px 0 0", color: "#C5D0CD", fontSize: 17.5, lineHeight: 1.55 }}>
                Ontor helps you notice when stress is rising and energy is dropping, so you can make a small adjustment in the moment and improve your cognitive performance over time.
              </p>
              <div style={{ margin: "28px 0 0", maxWidth: 520, display: "flex", flexDirection: "column" }}>
                {[
                  ["Notice the shift", "See when stress is rising and energy is dropping."],
                  ["Make a small adjustment", "Slow down, breathe out, or give yourself a moment."],
                  ["See what helps", "Review your patterns and build better ways to work."],
                ].map(([t, b], i, arr) => {
                  const last = i === arr.length - 1;
                  return (
                    <div key={t} style={{ display: "flex", gap: 16 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums", ...(last ? { background: "#F59E0B", color: "#1B1A17" } : { border: "1.5px solid #6FD6C9", color: "#6FD6C9" }) }}>{i + 1}</div>
                        {!last && <div style={{ width: 1.5, flex: 1, background: "rgba(251,248,241,0.14)", margin: "5px 0" }} />}
                      </div>
                      <div style={{ paddingBottom: last ? 0 : 20 }}>
                        <div style={{ color: "#FBF8F1", fontWeight: 600, fontSize: 17.5, marginBottom: 3 }}>{t}</div>
                        <div style={{ color: "#94A39F", fontSize: 15, lineHeight: 1.55 }}>{b}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <InlineWaitlistForm variant="hero" />
              <div style={{ marginTop: 14, fontSize: 13.5, color: "#94A39F", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6FD6C9" strokeWidth="2"><rect x="4" y="10" width="16" height="11" rx="2.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
                macOS, Windows, iOS &amp; Android · only your voice · no wearable needed
              </div>
            </div>
            <div style={{ minWidth: 0 }}><HeroTimeline /></div>
          </div>
        </section>

        {/* ════ PATTERNS (what it adds up to) ════ */}
        <PatternSection />

        {/* ════ HOW IT WORKS ════ */}
        <section id="how" style={{ padding: "88px 0", background: "#F1ECE2" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 32px" }}>
            <div style={{ maxWidth: 660, margin: "0 auto", textAlign: "center" }}>
              <span style={eyebrow(teal, true)}><span style={eyeDot} />How it works</span>
              <h2 className="font-serif-display" style={h2()}>Press Start. Take the call. See how you held up.</h2>
              <p style={{ fontSize: 18, color: inkSoft, margin: "18px 0 0", lineHeight: 1.6 }}>No dashboard to babysit, no behavior to change. It works while you work.</p>
            </div>
            <div className="hos-3grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginTop: 54, alignItems: "stretch" }}>
              {/* Step 1 — menu bar mock */}
              <div style={stepCard}>
                <span style={stepN}>01</span>
                <div style={{ background: "linear-gradient(160deg,#2C3A40,#1B262B)", borderRadius: 12, padding: "12px 12px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, background: "rgba(255,255,255,.13)", borderRadius: 7, padding: "5px 10px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8EDEC" strokeWidth="2" strokeLinecap="round"><path d="M5 12.5a11 11 0 0 1 14 0" /><path d="M8.5 16a6 6 0 0 1 7 0" /><circle cx="12" cy="19" r="1" fill="#E8EDEC" /></svg>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 2.5, background: "rgba(255,255,255,.22)", borderRadius: 6, padding: "4px 7px" }}>
                      {[5, 9, 12, 9, 5].map((h, i) => <span key={i} style={{ width: 2.5, height: h, borderRadius: 2, background: "#fff" }} />)}
                    </span>
                    <span style={{ fontSize: 11, color: "#E8EDEC", fontWeight: 600 }}>Tue 9:58 AM</span>
                  </div>
                  <div style={{ background: "rgba(250,250,250,.96)", borderRadius: 10, margin: "6px 34px 0 auto", width: 172, padding: 6, boxShadow: "0 18px 34px rgba(0,0,0,.35)", fontSize: 13, color: ink }}>
                    <div style={{ padding: "6px 9px", borderRadius: 6 }}>Open Ontor</div>
                    <div style={{ height: 1, background: "#E2E0DB", margin: "3px 6px" }} />
                    <div style={{ padding: "6px 9px", borderRadius: 6, background: teal, color: "#fff", fontWeight: 600 }}>Start</div>
                    <div style={{ padding: "6px 9px", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>Microphone <span style={{ color: "#8A8375" }}>›</span></div>
                    <div style={{ height: 1, background: "#E2E0DB", margin: "3px 6px" }} />
                    <div style={{ padding: "6px 9px", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>Quit Ontor <span style={{ color: "#8A8375", fontSize: 11.5 }}>⌘Q</span></div>
                  </div>
                </div>
                <div><h4 style={stepH}>It lives in your menu bar</h4><p style={stepP}>One click before the call — Start. That&rsquo;s the entire workflow. No window, no note-taking bot joining the meeting.</p></div>
              </div>
              {/* Step 2 — you vs them */}
              <div style={stepCard}>
                <span style={stepN}>02</span>
                <div style={{ background: "#F7F4EE", border: "1px solid #EDE7DA", borderRadius: 12, padding: "18px 16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: teal, marginBottom: 6 }}>You speak → analyzed</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 2.5, height: 22 }}>
                      {[8, 15, 20, 12, 18, 9, 16, 11, 19, 7].map((h, i) => <span key={i} style={{ width: 3, height: h, borderRadius: 2, background: "#14867B" }} />)}
                    </div>
                  </div>
                  <div style={{ borderTop: "1px dashed #D6CDBC" }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#A39B8B", marginBottom: 6 }}>They speak → nothing captured</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, borderTop: "1.5px dashed #C9C2B2" }} />
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A39B8B" strokeWidth="2" strokeLinecap="round"><path d="M12 2a3 3 0 0 1 3 3v4" /><path d="M19 10v1a7 7 0 0 1-11.6 5.3" /><path d="M12 18v4" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
                      <div style={{ flex: 1, borderTop: "1.5px dashed #C9C2B2" }} />
                    </div>
                  </div>
                </div>
                <div><h4 style={stepH}>It reads only you, as you work</h4><p style={stepP}>Pace, pitch, strain, steadiness — measured against your own baseline, on your machine. When anyone else speaks, it&rsquo;s deaf by design.</p></div>
              </div>
              {/* Step 3 — result */}
              <div style={stepCard}>
                <span style={stepN}>03</span>
                <div style={{ background: "#F7F4EE", border: "1px solid #EDE7DA", borderRadius: 12, padding: 16, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 11 }}>
                  {[
                    { n: "Stress", d: [[12, "#14867B", 2], [26, "#14867B", 3], [55, amber, 0], [63, amber, 1], [88, "#14867B", 3]] },
                    { n: "Energy", d: [[10, "#14867B", 2], [30, "#14867B", 2], [58, "#14867B", 3], [86, amber, 5]] },
                    { n: "Confidence", d: [[14, "#14867B", 2], [34, "#14867B", 2], [60, "#14867B", 2], [84, "#14867B", 2]] },
                  ].map((row) => (
                    <div key={row.n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: ink, width: 64 }}>{row.n}</span>
                      <div style={{ flex: 1, position: "relative", height: 10 }}>
                        <div style={{ position: "absolute", inset: "2px 0", background: "rgba(27,26,23,.05)", borderRadius: 5 }} />
                        {(row.d as [number, string, number][]).map(([l, c, top], i) => (
                          <span key={i} style={{ position: "absolute", left: `${l}%`, top, width: 6, height: 6, borderRadius: "50%", background: c }} />
                        ))}
                      </div>
                    </div>
                  ))}
                  <div style={{ fontSize: 12, color: "#8A5A06", fontWeight: 600, borderTop: "1px dashed #E4DDD0", paddingTop: 10, marginTop: 2 }}>Stress climbed at minute 25 — right where the pricing question landed.</div>
                </div>
                <div><h4 style={stepH}>See how you held up</h4><p style={stepP}>A minute-by-minute timeline of your state across the whole call — where you were steady, where you slipped, and how it lines up with the outcome.</p></div>
              </div>
            </div>
            <p style={{ textAlign: "center", margin: "34px 0 0", fontSize: 13.5, color: inkSoft }}>Away from your desk? A natural-voice read on iPhone or Android — same engine, same baseline.</p>
          </div>
        </section>

        {/* ════ PRIVACY ════ */}
        <section id="privacy" style={{ background: "linear-gradient(170deg, #14272C, #0C181C)", color: "#F4F1EA", padding: "88px 0" }}>
          <div className="hos-priv-grid" style={{ maxWidth: 1160, margin: "0 auto", padding: "0 32px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 56, alignItems: "center" }}>
            <div>
              <span style={eyebrow("#6FD6C9")}><span style={eyeDot} />Privacy, by architecture</span>
              <h2 className="font-serif-display" style={{ fontWeight: 500, fontSize: "clamp(30px, 3.6vw, 42px)", lineHeight: 1.1, margin: "16px 0 0", color: "#FBF8F1" }}>The other side of every call is never heard, analyzed, or stored.</h2>
              <p style={{ fontSize: 18, color: "#BFCAC7", margin: "18px 0 0", lineHeight: 1.6 }}>Ontor is speaker-gated: the moment anyone but you talks, no audio exists to capture. There is nothing to disclose and no one to ask — because nothing of theirs is ever touched. <em style={{ fontStyle: "italic", color: "#F4F1EA" }}>Self-tracking, not surveillance.</em></p>
              <p style={{ fontSize: 15.5, color: "#8FA09C", margin: "18px 0 0", lineHeight: 1.6 }}>If you sell for a living: this is the opposite of the call-recording stack your manager bought. Nothing here is for them — your calls, your data, your edge.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                ["Speaker-gated", "Enrolled to your voice. Everyone else is silence to it — by design, not by policy."],
                ["On-device", "All analysis runs on your machine. Audio is processed in memory and discarded."],
                ["No wearable needed", "Nothing to wear, charge, or remember. On-device by default — cloud sync only if you turn it on."],
              ].map(([t2, b]) => (
                <div key={t2} style={{ border: "1px solid rgba(255,255,255,.1)", borderRadius: 16, padding: "20px 22px", background: "rgba(255,255,255,.03)" }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#F4F1EA" }}>{t2}</h4>
                  <p style={{ fontSize: 14, color: "#9FB0AC", margin: "6px 0 0", lineHeight: 1.55 }}>{b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════ SCIENCE ════ */}
        <section id="science" style={{ padding: "88px 0", background: "#F0FDFA" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 32px" }}>
            <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
              <span style={eyebrow(teal, true)}><span style={eyeDot} />The science</span>
              <h2 className="font-serif-display" style={h2()}>Your voice carries signals. Research has read them for decades.</h2>
              <p style={{ fontSize: 17.5, color: inkSoft, margin: "20px 0 0", lineHeight: 1.65 }}>Decades of peer-reviewed research show the human voice carries measurable markers of activation, effort, and strain — how energized, tense, or worn down you are shows up in pitch, rhythm, and voice quality. Ontor turns how you sound into these signals and tracks each against <em style={{ fontStyle: "italic", color: ink }}>your own</em> baseline, so you see when today differs from your normal — never how you compare to anyone else.</p>
            </div>
            <div className="hos-3grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginTop: 48 }}>
              {SCIENCE.map((c) => (
                <div key={c.title} style={{ background: "#fff", border: "1px solid #D4E8E4", borderRadius: 18, padding: "24px 22px" }}>
                  <span style={{ width: 44, height: 44, borderRadius: 12, background: "#CCFBF1", display: "grid", placeItems: "center", marginBottom: 15 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={teal} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: c.icon }} />
                  </span>
                  <h4 style={{ fontSize: 16.5, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>{c.title}</h4>
                  <p style={{ fontSize: 14, color: inkSoft, margin: "6px 0 0", lineHeight: 1.55 }}>{c.body}</p>
                </div>
              ))}
            </div>
            <p style={{ textAlign: "center", margin: "40px auto 0", maxWidth: 640, fontSize: 14, color: inkSoft, lineHeight: 1.6 }}>Built on established acoustic-voice research — the same signal families used across decades of studies on vocal effort, arousal, and speech — adapted for private, personal, day-over-day tracking.</p>
            <p style={{ textAlign: "center", margin: "14px auto 0", maxWidth: 640, fontSize: 12.5, color: "#8A8375", lineHeight: 1.6 }}>Ontor is a self-insight and performance tool, not a medical device. It surfaces trends and prompts reflection — it doesn&rsquo;t diagnose.</p>
          </div>
        </section>

        {/* ════ CTA ════ */}
        <section id="join" style={{ padding: "96px 0", textAlign: "center" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 32px" }}>
            <span style={eyebrow(teal, true)}><span style={eyeDot} />Early access</span>
            <h2 className="font-serif-display" style={{ fontWeight: 500, fontSize: "clamp(34px, 4.6vw, 56px)", lineHeight: 1.06, margin: "18px auto 0", maxWidth: 820, letterSpacing: "-0.01em" }}>See how you actually show up, <em style={{ fontStyle: "italic", color: teal }}>call after call.</em></h2>
            <InlineWaitlistForm variant="cta" />
            <div style={{ marginTop: 16, fontSize: 13.5, color: inkSoft }}>Free while in beta · macOS, Windows, iOS &amp; Android · on-device &amp; private · No spam, ever.</div>
          </div>
        </section>
      </main>

      {/* ════ FOOTER ════ */}
      <footer style={{ borderTop: "1px solid #E4DDD0", padding: "40px 0 56px" }}>
        <div className="hos-foot" style={{ maxWidth: 1160, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 16, color: ink }}>
              <svg width="26" height="26" viewBox="0 0 26 26" style={{ display: "block", borderRadius: 5.7, background: teal }}><rect x="4.4" y="9.4" width="2.3" height="7.2" rx="1.15" fill={amber} /><rect x="8.6" y="6.5" width="2.3" height="13" rx="1.15" fill={amber} /><rect x="12.8" y="4.2" width="2.3" height="17.6" rx="1.15" fill={amber} /><rect x="17" y="6.5" width="2.3" height="13" rx="1.15" fill={amber} /><rect x="21.2" y="9.4" width="2.3" height="7.2" rx="1.15" fill={amber} /></svg>
              Ontor
            </span>
            <span className="font-serif-display" style={{ fontStyle: "italic", color: inkSoft, fontSize: 16 }}>Self-tracking, not surveillance.</span>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 14, color: inkSoft }}>
            <a href="#signals" style={footLink}>What it reads</a>
            <a href="#privacy" style={footLink}>Privacy</a>
            <a href="/blog" style={footLink}>Blog</a>
            <a href="#join" style={footLink}>Beta</a>
          </div>
        </div>
      </footer>

      <style>{RESPONSIVE_CSS}</style>
    </>
  );
}

// ─── shared style helpers ───
const eyeDot = { width: 7, height: 7, borderRadius: "50%", background: "#F59E0B", display: "inline-block" } as const;
function eyebrow(color: string, center = false): React.CSSProperties {
  return { fontSize: 12.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color, display: "inline-flex", alignItems: "center", gap: 9, ...(center ? { justifyContent: "center" } : {}) };
}
function h2(): React.CSSProperties {
  return { fontWeight: 500, fontSize: "clamp(30px, 3.8vw, 44px)", lineHeight: 1.08, letterSpacing: "-0.01em", margin: "16px 0 0" };
}
const stepCard: React.CSSProperties = { background: "#fff", border: "1px solid #E4DDD0", borderRadius: 18, padding: 24, display: "flex", flexDirection: "column", gap: 16 };
const stepN: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: ".08em", color: "#0F766E" };
const stepH: React.CSSProperties = { fontSize: 17, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" };
const stepP: React.CSSProperties = { fontSize: 14.5, color: "#5A554B", margin: "6px 0 0", lineHeight: 1.5 };
const footLink: React.CSSProperties = { color: "inherit", textDecoration: "none" };

const SCIENCE = [
  { title: "On your device", body: "Your voice is analyzed on the device itself. Nothing leaves it unless you turn on optional sync.", icon: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10 18.5h4"/>' },
  { title: "Your baseline, not a benchmark", body: "Every reading is relative to your own recent history — the only fair comparison.", icon: '<path d="M3 12h18" stroke-dasharray="2.5 3"/><path d="M3 15c3-1 4-6 7-6s4 5 7 4c1.5-.5 2.5-1.5 4-3"/>' },
  { title: "Grounded in published science", body: "The signals map to established findings in voice research on arousal, vocal effort, and speech production.", icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' },
];

const RESPONSIVE_CSS = `
.hos-card:hover { border-color:#D6CDBC !important; box-shadow:0 14px 32px rgba(27,26,23,.08); transform:translateY(-3px); }
@media (max-width: 920px){
  .hos-hero-grid, .hos-priv-grid { grid-template-columns:1fr !important; gap:40px !important; padding-top:56px !important; padding-bottom:64px !important; }
  .hos-3grid { grid-template-columns:1fr !important; }
  .hos-4grid { grid-template-columns:repeat(2,1fr) !important; }
}
@media (max-width: 560px){
  .hos-4grid { grid-template-columns:1fr !important; }
}
`;
