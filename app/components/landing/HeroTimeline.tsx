"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Ported from the Claude Design "HealthOS Home" hero (v2).
// A menu-bar window with a split panel — the HealthOS timeline beside a
// video-call app mock (You + Jordan) — and a 3-mode switcher that animates
// the panels and auto-cycles. Dots appear only where YOU speak; when the
// client speaks, the call panel shows "Mic gated — nothing captured".

const CALL = 2700;
const SEGS: [number, number][] = [
  [60, 420], [540, 900], [1080, 1470], [1770, 2160], [2340, 2640],
];
const GAPS = [
  { a: 420, b: 540 }, { a: 900, b: 1080 }, { a: 1470, b: 1770 }, { a: 2160, b: 2340 },
];
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
type Dot = { t: number; x: number; y: number; s: number; c: string; h: string };
function mk(name: string, sub: string, seed: number, orangeIn: [number, number][]) {
  const dots: Dot[] = [];
  let k = 0;
  for (const [a, b] of SEGS) {
    for (let t = a; t < b; t += 52 + rnd(seed + k) * 46) {
      k++;
      const inOr = orangeIn.some(([oa, ob]) => t >= oa && t <= ob) && rnd(seed * 7 + k) > 0.3;
      const big = rnd(seed + k * 5) > 0.72;
      dots.push({
        t, x: +((t / CALL) * 100).toFixed(2),
        y: Math.round(10 + rnd(seed + k * 3) * 13 - (inOr ? 8 : 0)),
        s: big ? 7 : 5,
        c: inOr ? "#F59E0B" : "#14867B",
        h: inOr ? "rgba(245,158,11,.16)" : "rgba(20,134,123,.13)",
      });
    }
  }
  return { name, sub, dots };
}

const bars = (color: string, animated: boolean, h = 10) =>
  [0, 0.12, 0.24, 0.36, 0.48].map((d, i) => (
    <span key={i} style={{ width: 2.5, height: h, borderRadius: 2, background: color, transformOrigin: "center", ...(animated ? { animation: "hoswave .8s ease-in-out infinite", animationDelay: `${d}s` } : {}) }} />
  ));

export default function HeroTimeline({
  demoSeconds = 24,
  autoStart = true,
}: { demoSeconds?: number; autoStart?: boolean }) {
  const baseRows = useMemo(
    () => [
      mk("Stress", "Higher = more pressure", 3, [[1140, 1470], [1770, 2050]]),
      mk("Energy", "Higher = more activated", 11, [[2340, 2600]]),
      mk("Confidence", "Higher = more decisive", 23, [[90, 230]]),
      mk("Vocal strain", "Higher = more strained", 37, [[2380, 2640]]),
    ],
    []
  );

  const [t, setT] = useState(CALL);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState(0);
  const iv = useRef<ReturnType<typeof setInterval> | null>(null);
  const next = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modeRef = useRef(0);

  const start = (m?: number) => {
    if (iv.current) clearInterval(iv.current);
    if (next.current) clearTimeout(next.current);
    const nm = m ?? modeRef.current;
    modeRef.current = nm;
    const step = CALL / (demoSeconds * 10);
    setT(0); setRunning(true); setMode(nm);
    iv.current = setInterval(() => {
      setT((prev) => {
        const nt = prev + step;
        if (nt >= CALL) {
          if (iv.current) clearInterval(iv.current);
          setRunning(false);
          next.current = setTimeout(() => start((modeRef.current + 1) % 3), 1600);
          return CALL;
        }
        return nt;
      });
    }, 100);
  };

  useEffect(() => {
    let to: ReturnType<typeof setTimeout> | null = null;
    if (autoStart) to = setTimeout(() => start(), 900);
    return () => {
      if (to) clearTimeout(to);
      if (iv.current) clearInterval(iv.current);
      if (next.current) clearTimeout(next.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speaking = running && SEGS.some(([a, b]) => t >= a && t <= b);
  const clientSpeaking = running && !speaking;
  const mm = Math.floor(t / 60), ss = Math.floor(t % 60);
  const timer = `${mm < 10 ? "0" : ""}${mm}:${ss < 10 ? "0" : ""}${ss} / 45:00`;

  const pillBg = speaking ? "#0F766E" : "rgba(255,255,255,.22)";
  const youRing = speaking ? "#14867B" : "rgba(255,255,255,.09)";
  const clientRing = clientSpeaking ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.09)";
  const tlGrow = mode < 2 ? 1 : 0;
  const callGrow = mode > 0 ? 1 : 0;
  const panelGap = mode === 1 ? "10px" : "0px";
  const tlTimerDisp = mode === 1 ? "none" : "inline";
  const hdrPillDisp = mode === 1 ? "none" : "inline-flex";
  const hdrBtnDisp = mode === 1 ? "none" : "inline-flex";
  const callTimerDisp = mode === 1 ? "none" : "inline";
  const callAppLabel = mode === 1 ? "Zoom" : "Zoom — your call app";
  const modeLabels = ["Full view", "Side by side", "In the background"];
  const modeCaption = [
    "HealthOS is its own app — open the full read when you want the detail.",
    "Two separate apps: HealthOS docked beside Zoom, Meet, Teams — no integration, no bot in the meeting.",
    "Or entirely in the background while any call app runs — only the menu bar icon moves, and only when you speak.",
  ][mode];

  const rows = baseRows.map((r) => {
    const dots = r.dots.filter((d) => d.t <= t);
    const el = dots.some((d) => d.c === "#F59E0B" && d.t > t - 480);
    return { name: r.name, sub: r.sub, dots, status: el ? "↑ Elevated" : "→ In range", stColor: el ? "#B45309" : "#5A554B" };
  });

  const logo = (
    <svg width="14" height="14" viewBox="0 0 30 30" style={{ display: "block", borderRadius: 3.5, background: "#0F766E", flexShrink: 0 }}>
      {[[5.1, 10.8, 8.4], [9.9, 7.5, 15], [14.7, 4.8, 20.4], [19.5, 7.5, 15], [24.3, 10.8, 8.4]].map(([x, y, h], i) => (
        <rect key={i} x={x} y={y} width="2.7" height={h} rx="1.35" fill="#F59E0B" />
      ))}
    </svg>
  );

  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ background: "linear-gradient(160deg,#2C3A40,#1B262B)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: 9, boxShadow: "0 40px 80px rgba(0,0,0,.45)" }}>
        {/* mac menu bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, background: "rgba(255,255,255,.13)", borderRadius: "9px 9px 0 0", padding: "5px 12px" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E8EDEC" strokeWidth="2" strokeLinecap="round"><path d="M5 12.5a11 11 0 0 1 14 0" /><path d="M8.5 16a6 6 0 0 1 7 0" /><circle cx="12" cy="19" r="1" fill="#E8EDEC" /></svg>
          <span title="HealthOS in your menu bar — it moves only when you speak" style={{ display: "inline-flex", alignItems: "center", gap: 2.5, background: pillBg, borderRadius: 6, padding: "4px 7px", height: 11, transition: "background .3s" }}>
            {speaking ? bars("#fff", true, 10) : [4, 7, 10, 7, 4].map((h, i) => <span key={i} style={{ width: 2.5, height: h, borderRadius: 2, background: "#fff" }} />)}
          </span>
          <span style={{ fontSize: 11, color: "#E8EDEC", fontWeight: 600 }}>Tue 10:04 AM</span>
        </div>

        {/* split panels */}
        <div style={{ display: "flex", gap: panelGap, height: 400, background: "linear-gradient(150deg,#22383F,#141F23)", borderRadius: "0 0 9px 9px", padding: 10, transition: "gap .7s ease" }}>
          {/* LEFT — timeline */}
          <div style={{ flexGrow: tlGrow, flexBasis: 0, minWidth: 0, overflow: "hidden", display: "flex", transition: "flex-grow .7s cubic-bezier(.4,0,.2,1)" }}>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "#FCFAF6", borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 18px", borderBottom: "1px solid #EDE7DA" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, overflow: "hidden" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: running ? "#F59E0B" : "#14867B", animation: running ? "hospulse 1.2s ease-in-out infinite" : "none", flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1B1A17", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 }}>{logo}HealthOS</span>
                  <span style={{ display: tlTimerDisp, fontSize: 12.5, color: "#8A8375", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{timer}</span>
                  {speaking ? (
                    <span title="You're speaking — HealthOS is reading" style={{ display: hdrPillDisp, alignItems: "center", gap: 2.5, background: "#0F766E", borderRadius: 6, padding: "4px 7px", height: 12, flexShrink: 0 }}>{bars("#fff", true, 11)}</span>
                  ) : (
                    <span title="Silence or someone else talking — nothing captured" style={{ display: hdrPillDisp, alignItems: "center", gap: 2.5, background: "#E9E4D8", borderRadius: 6, padding: "4px 7px", height: 12, flexShrink: 0 }}>{[4, 7, 9, 7, 4].map((h, i) => <span key={i} style={{ width: 2.5, height: h, borderRadius: 2, background: "#A39B8B" }} />)}</span>
                  )}
                </div>
                <button onClick={() => start()} style={{ fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, border: "none", borderRadius: 9, padding: "7px 14px", cursor: "pointer", background: "#0F766E", color: "#fff", display: hdrBtnDisp, alignItems: "center", gap: 7, whiteSpace: "nowrap", flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff"><polygon points="6 4 20 12 6 20 6 4" /></svg>
                  {running ? "Listening…" : "Replay"}
                </button>
              </div>
              <div style={{ position: "relative", flex: 1, minHeight: 0, padding: "14px 18px 8px" }}>
                {GAPS.map((g, i) => (
                  <div key={i} style={{ position: "absolute", top: 8, bottom: 8, left: `${((g.a / CALL) * 100).toFixed(2)}%`, width: `${(((g.b - g.a) / CALL) * 100).toFixed(2)}%`, background: "rgba(20,134,123,.05)", borderLeft: "1px dashed #D6CDBC", borderRight: "1px dashed #D6CDBC", borderRadius: 4, zIndex: 3 }} />
                ))}
                {rows.map((row) => (
                  <div key={row.name} style={{ padding: "7px 0 9px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1B1A17", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{row.name} <span style={{ fontWeight: 500, color: "#A39B8B", fontSize: 11.5 }}>{row.sub}</span></span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: row.stColor, whiteSpace: "nowrap" }}>{row.status}</span>
                    </div>
                    <div style={{ position: "relative", height: 34, marginTop: 4 }}>
                      <div style={{ position: "absolute", left: 0, right: 0, top: 9, height: 16, background: "rgba(27,26,23,.04)", borderRadius: 8 }} />
                      <div style={{ position: "absolute", left: 0, right: 0, top: 16.5, borderTop: "1.5px dashed #C9C2B2" }} />
                      {row.dots.map((d, di) => (
                        <span key={di} style={{ position: "absolute", left: `${d.x}%`, top: d.y, width: d.s, height: d.s, marginLeft: -3, borderRadius: "50%", background: d.c, boxShadow: `0 0 0 3.5px ${d.h}`, zIndex: 2 }} />
                      ))}
                    </div>
                  </div>
                ))}
                {running && <div style={{ position: "absolute", top: 8, bottom: 8, left: `${((t / CALL) * 100).toFixed(2)}%`, width: 1.5, background: "#F59E0B", zIndex: 4, marginLeft: 18, transform: "translateX(-18px)" }} />}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#A39B8B", padding: "2px 0 8px" }}>
                  <span>0s</span><span>10m</span><span>20m</span><span>30m</span><span>40m</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — video call app */}
          <div style={{ flexGrow: callGrow, flexBasis: 0, minWidth: 0, overflow: "hidden", display: "flex", transition: "flex-grow .7s cubic-bezier(.4,0,.2,1)" }}>
            <div style={{ flex: 1, minWidth: 170, background: "#101B1F", border: "1px solid rgba(255,255,255,.09)", borderRadius: 10, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "9px 12px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#E9F2F0", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                  <span style={{ width: 13, height: 13, borderRadius: 4, background: "#2D8CFF", color: "#fff", display: "grid", placeItems: "center", fontSize: 8, fontWeight: 800, flexShrink: 0 }}>Z</span>{callAppLabel}
                </span>
                <span style={{ display: callTimerDisp, fontSize: 11, color: "#8FA09C", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", minWidth: 0, overflow: "hidden" }}>{timer}</span>
              </div>
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(84px, 1fr))", gap: 9, padding: 10, minHeight: 0 }}>
                <div style={{ position: "relative", borderRadius: 10, background: "linear-gradient(160deg,#1E3038,#16252B)", border: `2px solid ${youRing}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color .3s" }}>
                  <span style={{ width: 52, height: 52, borderRadius: "50%", background: "#0F766E", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 19 }}>A</span>
                  <span style={{ position: "absolute", left: 8, bottom: 7, fontSize: 10, fontWeight: 600, color: "#CFDAD7", background: "rgba(0,0,0,.35)", borderRadius: 5, padding: "2px 7px" }}>You</span>
                  {speaking && <span style={{ position: "absolute", right: 9, top: 9, display: "inline-flex", alignItems: "center", gap: 2 }}>{bars("#6FD6C9", true, 9).slice(0, 3)}</span>}
                </div>
                <div style={{ position: "relative", borderRadius: 10, background: "linear-gradient(160deg,#2A333A,#1C2329)", border: `2px solid ${clientRing}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color .3s" }}>
                  <span style={{ width: 52, height: 52, borderRadius: "50%", background: "#5A554B", color: "#F4F1EA", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 19 }}>J</span>
                  <span style={{ position: "absolute", left: 8, bottom: 7, fontSize: 10, fontWeight: 600, color: "#CFDAD7", background: "rgba(0,0,0,.35)", borderRadius: 5, padding: "2px 7px" }}>Jordan</span>
                  {clientSpeaking && <span style={{ position: "absolute", right: 9, top: 9, display: "inline-flex", alignItems: "center", gap: 2 }}>{bars("#A9B8B4", true, 9).slice(0, 3)}</span>}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 10px 10px" }}>
                <span style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,.08)", display: "grid", placeItems: "center" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#CFDAD7" strokeWidth="2" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></svg></span>
                <span style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,.08)", display: "grid", placeItems: "center" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#CFDAD7" strokeWidth="2" strokeLinecap="round"><rect x="2" y="6" width="13" height="12" rx="2.5" /><path d="M15 10.5l7-3.5v10l-7-3.5" /></svg></span>
                <span style={{ width: 26, height: 26, borderRadius: "50%", background: "#DC2626", display: "grid", placeItems: "center" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M3 14c5-5 13-5 18 0l-3 3-4-2v-2c-2.5-.8-5.5-.8-8 0v2l-4 2-3-3z" fill="#fff" stroke="none" /></svg></span>
                {clientSpeaking && (
                  <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10.5, fontWeight: 700, color: "#6FD6C9", background: "rgba(20,134,123,.14)", border: "1px solid rgba(111,214,201,.25)", borderRadius: 999, padding: "4px 9px", whiteSpace: "nowrap" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6FD6C9" strokeWidth="2" strokeLinecap="round"><path d="M12 2a3 3 0 0 1 3 3v4" /><path d="M19 10v1a7 7 0 0 1-11.6 5.3" /><path d="M12 18v4" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
                    Mic gated — nothing captured
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* mode switcher */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
        {modeLabels.map((label, i) => (
          <button key={label} onClick={() => start(i)} style={{ fontFamily: "inherit", fontSize: 12, fontWeight: 700, border: `1px solid ${i === mode ? "#F59E0B" : "rgba(255,255,255,.18)"}`, borderRadius: 999, padding: "6px 14px", cursor: "pointer", background: i === mode ? "#F59E0B" : "rgba(255,255,255,.06)", color: i === mode ? "#3B2606" : "#94A39F", transition: "all .3s", whiteSpace: "nowrap" }}>{label}</button>
        ))}
      </div>
      <p style={{ margin: "12px 4px 0", fontSize: 13, color: "#8FA09C", textAlign: "center", minHeight: 44 }}>{modeCaption}</p>

      <style>{`@keyframes hospulse{0%,100%{opacity:1}50%{opacity:.35}}@keyframes hoswave{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}`}</style>
    </div>
  );
}
