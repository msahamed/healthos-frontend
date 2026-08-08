"use client";
import { createElement, useState } from "react";
import Script from "next/script";

// "What it adds up to" — ported 1:1 from the design export "Ontor Pattern Section.html".
// Markup + CSS match the export (scoped under .patsec); the charts are the export's own
// <ontor-chart> web component served verbatim from /ontor-pattern-charts.js.

const TABS = [
  { num: "01", label: "See the patterns" },
  { num: "02", label: "Where you slip" },
  { num: "02", label: "Where you hold steady" },
  { num: "03", label: "Take action, get better" },
];

const CARDS = [
  {
    step: "Step 01 · See the patterns",
    q: "Stress, energy, confidence, and more",
    story: "Every check-in adds a dot. A week in, they line up into a picture of your days. One evening here, the words said fine. The voice read energy 31 and fatigue 72.",
    move: "Log a minute a day. The picture builds itself.",
    ct: "Day by day · real calendar, real gaps",
    cs: "daily mean per marker · ◆ = the Jul 24 evening check-in · hover a day",
    legend: [["Stress", "#2a78d6"], ["Confidence", "#008300"], ["Energy", "#eda100"], ["Fatigue", "#e87ba4"]],
    chart: "week",
  },
  {
    step: "Step 02 · Know where you slip",
    q: "What causes your stress to spike",
    story: "See it in your own voice. In one real 44-minute call, stress was calm until the price came up. Saying it out loud pushed it to 87. Twice.",
    move: "Say the number out loud a few times before the call. A sentence you have practiced stops spiking.",
    ct: "Inside one conversation · Jul 28",
    cs: "marker 0–100 by minute · hover to read",
    legend: [["Stress", "#2a78d6"], ["Confidence", "#008300"]],
    chart: "timeline",
  },
  {
    step: "Step 02 · And where you hold steady",
    q: "Your breath moves your confidence",
    story: "When your breathing is full and steady, your confidence holds. When it turns short and shallow, confidence slips with it. Hour by hour, the two move together.",
    move: "Book the conversation that scares you before noon.",
    ct: "Across the working day",
    cs: "mean by local hour, all days pooled · hover to read",
    legend: [["Confidence", "#008300"], ["Breathing", "#2a78d6"]],
    chart: "hours",
  },
  {
    step: "Step 03 · Take action, get better",
    q: "What moves with confidence",
    story: "When breathing improved, confidence rose with it. Fatigue pulled it down. Your own patterns show you what to work on. So work on it.",
    move: "Losing your footing mid-call? Slow the exhale. The voice follows.",
    ct: "Measured across one real week",
    cs: "correlation across 839 speech windows · hover a bar",
    legend: [],
    chart: "coupling",
  },
];

export default function PatternSection() {
  const [tab, setTab] = useState(0);
  return (
    <section id="signals" className="patsec">
      <Script src="/ontor-pattern-charts.js" strategy="afterInteractive" />
      <div className="wrap">
        <div className="head">
          <div className="eyebrow"><i /><span>What it adds up to</span></div>
          <h2 className="font-serif-display">See patterns build from your <em>natural voice.</em></h2>
          <p className="sub">Real charts from ten days of the founder&rsquo;s own logs. Pick a question. Your answers will look different, and that is the point.</p>
        </div>
        <div className="tabs" role="tablist">
          {TABS.map((t, i) => (
            <button key={t.label} className={`tab${i === tab ? " on" : ""}`} role="tab" aria-selected={i === tab} onClick={() => setTab(i)}>
              <b>{t.num}</b>{t.label}
            </button>
          ))}
        </div>
        <div className="panelbox">
          {CARDS.map((c, i) => (
            <div key={c.chart} className={`panel${i === tab ? " on" : ""}`}>
              <div className="card">
                <div className="txt">
                  <div className="step">{c.step}</div>
                  <div className="q font-serif-display">{c.q}</div>
                  <p className="story">{c.story}</p>
                  <div className="move"><b>TRY THIS →</b><p>{c.move}</p></div>
                </div>
                <div className="cht">
                  <div className="ct">{c.ct}</div>
                  <div className="cs">{c.cs}</div>
                  {c.legend.length > 0 && (
                    <div className="legend">
                      {c.legend.map(([name, color]) => <span key={name}><i style={{ background: color }} />{name}</span>)}
                    </div>
                  )}
                  {createElement("ontor-chart", { chart: c.chart })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{CSS}</style>
    </section>
  );
}

// CSS from the design export, scoped under .patsec (body rule → section rule).
// The export's closing CTA row + fine print were dropped at the founder's request.
const CSS = `
.patsec { background: #E9E2CF; font-family: 'Hanken Grotesk', sans-serif; color: #1B1A17; -webkit-font-smoothing: antialiased; }
.patsec ::selection { background: #F8DDB6; }
.patsec .wrap { max-width: 1160px; margin: 0 auto; padding: 96px 24px 80px; }
.patsec .head { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 40px; }
.patsec .eyebrow { display: flex; align-items: center; gap: 9px; margin-bottom: 18px; }
.patsec .eyebrow i { width: 7px; height: 7px; border-radius: 999px; background: #F59E0B; }
.patsec .eyebrow span { font-size: 12px; font-weight: 700; letter-spacing: .19em; text-transform: uppercase; color: #0F766E; }
.patsec h2 { font-weight: 500; font-size: clamp(32px, 4vw, 44px); line-height: 1.08; letter-spacing: -.015em; margin: 0 0 20px; max-width: 22ch; text-wrap: balance; }
.patsec h2 em { font-weight: 500; color: #0F766E; }
.patsec .sub { margin: 0; font-size: 18px; line-height: 1.6; color: #5A554B; max-width: 58ch; }
.patsec .tabs { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin-bottom: 24px; }
.patsec .tab { display: inline-flex; align-items: center; gap: 9px; border-radius: 999px; padding: 11px 19px; font-family: 'Hanken Grotesk', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; border: 1px solid #D6CDBC; background: #FFFFFF; color: #0F766E; }
.patsec .tab b { font-size: 11px; font-weight: 700; letter-spacing: .08em; opacity: .75; }
.patsec .tab.on { background: #0F766E; color: #FFFFFF; border-color: #0F766E; }
.patsec .panelbox { background: #FFFFFF; border-radius: 18px; box-shadow: 0 14px 40px rgba(27,26,23,.09); }
.patsec .panel { display: none; }
.patsec .panel.on { display: block; }
.patsec .card { display: grid; grid-template-columns: 370px 1fr; gap: 48px; align-items: center; padding: 46px 54px; min-width: 0; }
.patsec .txt { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.patsec .step { font-size: 11.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: #0F766E; }
.patsec .q { font-weight: 500; font-size: 29px; line-height: 1.12; letter-spacing: -.015em; text-wrap: balance; }
.patsec .story { margin: 0; font-size: 15.5px; line-height: 1.62; color: #5A554B; }
.patsec .move { display: flex; align-items: flex-start; gap: 10px; margin-top: 6px; background: #FBEFD3; border: 1px solid #FCD34D; border-radius: 12px; padding: 12px 16px; }
.patsec .move b { flex: none; font-size: 10px; font-weight: 700; letter-spacing: .13em; color: #92600B; padding-top: 3px; white-space: nowrap; }
.patsec .move p { margin: 0; font-size: 14px; line-height: 1.55; color: #1B1A17; }
.patsec .cht { min-width: 0; }
.patsec .ct { font-size: 13.5px; font-weight: 700; }
.patsec .cs { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 11px; color: #8A8375; margin: 3px 0 10px; }
.patsec .legend { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 8px; }
.patsec .legend span { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #5A554B; }
.patsec .legend i { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
.patsec :focus-visible { outline: 2px solid #F59E0B; outline-offset: 2px; border-radius: 4px; }
@media (max-width: 900px) { .patsec .card { grid-template-columns: 1fr; gap: 28px; } }
`;
