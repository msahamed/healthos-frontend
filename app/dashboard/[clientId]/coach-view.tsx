// The coach's read on one person.
//
// A direct port of "Ontor Coach.dc.html" from the Claude Design
// project: same panels, same geometry, same palette, same copy, same
// tooltips. Numbers differ from the design file only because this
// reads live Mongo instead of its bundled sample data.
//
// Do not restyle these charts. They were approved as drawn, and the
// constants below are the design's own.
//
// Fetch strategy, which is what the chips and the 7/30 toggle are for:
//   - Day rows arrive with the page. Triage, the zone chips and the
//     range toggle all re-derive in the browser, so switching a dial
//     costs nothing and hits no network.
//   - Recovery and the marker map load once when reached, cached per
//     range.
//
// The trailing slash in the fetch URLs is required, not cosmetic: the
// site runs trailingSlash:true, so the bare form 308-redirects.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  statMean,
  statSd,
  triage as computeTriage,
  type DayRow,
  type MarkerKey,
  type Recovery,
} from "@/lib/markers";

// ── The design's palette, verbatim ────────────────────────────────
const INK = "#1B1A17";
const MUTED = "#8A8577";
const LINE = "#F1ECE2";
const TEAL = "#0F766E";
const TEAL_DEEP = "#0B5048";
const TEAL_TINT = "#E8F1EF";
const ZONE_FILL = "#E1EFEA";
const CLAY = "#B7492F";
const AMBER_TINT = "#FBEFD3";
const AMBER_INK = "#8A5A0B";
const AMBER_LINE = "#FCD34D";
const CARD_LINE = "#E4DDD0";
const CONNECT = "#C9C2B2";
const DOT_PLAIN = "#A9A290";
const SELF_FILL = "#F7F4EE";

/** The four dials the design triages, with its colours. */
const DIALS: { key: MarkerKey; name: string; c: string }[] = [
  { key: "stress", name: "Stress", c: CLAY },
  { key: "confidence", name: "Confidence", c: TEAL },
  { key: "energy", name: "Energy", c: "#F59E0B" },
  { key: "fatigue", name: "Fatigue", c: MUTED },
];

/** The five dials the zone chart offers. */
const ZONES: { key: MarkerKey; name: string }[] = [
  { key: "stress", name: "Stress" },
  { key: "confidence", name: "Confidence" },
  { key: "energy", name: "Energy" },
  { key: "fatigue", name: "Fatigue" },
  { key: "breathing", name: "Breathing" },
];

const MAT_KEYS: MarkerKey[] = [
  "stress", "confidence", "energy", "fatigue", "vocal_strain", "articulation", "breathing",
];
const MAT_NAMES: Record<MarkerKey, string> = {
  stress: "Stress", confidence: "Conf", energy: "Energy", fatigue: "Fatigue",
  vocal_strain: "Strain", articulation: "Artic", breathing: "Breath",
};
/** The design's own circular-pair set. */
const CIRC = new Set([
  "confidence|energy", "confidence|fatigue", "energy|fatigue",
  "confidence|breathing", "energy|breathing", "fatigue|breathing",
]);
const pairKey = (a: string, b: string) => [a, b].sort().join("|");

const HI_BAD: Record<MarkerKey, boolean> = {
  stress: true, fatigue: true, vocal_strain: true,
  confidence: false, energy: false, breathing: false, articulation: false,
};

const ord = (d: string) => Date.parse(d + "T00:00:00Z") / 86400000;
const short = (d: string) => d.slice(5).replace("-", "/");

type Range = 7 | 30;

export default function CoachView({ days, clientId }: { days: DayRow[]; clientId: string }) {
  const [range, setRange] = useState<Range>(30);
  const [zoneKey, setZoneKey] = useState<MarkerKey>("stress");

  const tri = computeTriage(days, 7);
  const flagged = tri.filter((t) => t.level === 2);
  const headline = flagged.length
    ? flagged.length === 1
      ? `${flagged[0]!.name} is off the usual`
      : `${flagged.length} markers are off the usual`
    : "Nothing well off the usual";

  const cards = DIALS.flatMap((d) => {
    const t = tri.find((x) => x.key === d.key);
    return t ? [{ ...t, c: d.c }] : [];
  });

  return (
    <>
      <section className="sect">
        <h2 className="sectTitle">{headline}</h2>
        <div className="dials">
          {cards.map((t) => {
            const d = Math.round(Math.abs(t.delta));
            const good = HI_BAD[t.key] ? t.delta < 0 : t.delta > 0;
            const badge = t.level === 2 ? (good ? "Improving" : "Worth a look") : t.level === 1 ? "Drifting" : "Steady";
            const badgeBg = t.level === 2 ? (good ? TEAL_TINT : AMBER_TINT) : t.level === 1 ? LINE : TEAL_TINT;
            const badgeColor = t.level === 2 ? (good ? TEAL_DEEP : AMBER_INK) : t.level === 1 ? "#5A554B" : TEAL_DEEP;
            const border = t.level === 2 ? (good ? TEAL : AMBER_LINE) : CARD_LINE;
            return (
              <div className="dial" key={t.key} style={{ borderColor: border }}>
                <div className="dialtop">
                  <span className="dialname">{t.name}</span>
                  <span className="dialbadge" style={{ background: badgeBg, color: badgeColor }}>{badge}</span>
                </div>
                <div className="dialrow">
                  <div>
                    <div className="dialval num">{Math.round(t.recent)}</div>
                    <div className="dialdelta num">
                      {t.delta >= 0 ? "+" : "−"}{d} vs usual {Math.round(t.usual)}
                    </div>
                  </div>
                  <Spark points={sparkPoints(days, t.key, 10)} w={92} h={30} color={t.c} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="sect">
        <div className="eyebrow">Day by day, against their own usual</div>
        <div className="sectHead">
          <h2 className="sectTitle">Each dial, in one look</h2>
          <div className="seg">
            <button onClick={() => setRange(7)} aria-pressed={range === 7}>Last 7 days</button>
            <button onClick={() => setRange(30)} aria-pressed={range === 30}>Last 30 days</button>
          </div>
        </div>
        <p className="sub">
          Each dot is one day&apos;s average. The green band is their usual zone for that dial, one
          standard swing either side of their own baseline across the whole run. A dot outside the
          zone is labeled with its day: red means it moved the wrong way for that dial, teal means
          better than usual. Dashed stretches are days with no check-ins. Hover any dot for detail.
        </p>
        <div className="chips">
          {ZONES.map((z) => (
            <button key={z.key} className="chip-btn" aria-pressed={z.key === zoneKey}
              onClick={() => setZoneKey(z.key)}>{z.name}</button>
          ))}
        </div>
        <div className="card">
          <ZoneChart days={days} zoneKey={zoneKey} range={range} />
        </div>
      </section>

      <RecoveryPanel clientId={clientId} />
      <MatrixPanel clientId={clientId} />
    </>
  );
}

// ── Lazy panels ───────────────────────────────────────────────────

function useLazyPanel<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [state, setState] = useState<"loading" | "idle" | "error">("loading");
  const cache = useRef(new Map<string, T>());

  const load = useCallback(async () => {
    const hit = cache.current.get(url);
    if (hit) { setData(hit); setState("idle"); return; }
    setState("loading");
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as T;
      cache.current.set(url, json);
      setData(json);
      setState("idle");
    } catch {
      setState("error");
    }
  }, [url]);

  useEffect(() => { void load(); }, [load]);
  return { data, state };
}

function RecoveryPanel({ clientId }: { clientId: string }) {
  const [range, setRange] = useState<Range>(30);
  const { data, state } = useLazyPanel<Recovery>(
    `/api/v1/dashboard/${clientId}/?panel=recovery&days=${range}&marker=stress`,
  );
  const built = data && data.n > 0 ? buildRecovery(data) : null;

  return (
    <section className="sect">
      <div className="eyebrow">Recovery</div>
      <div className="sectHead">
        <h2 className="sectTitle">How fast a spike comes down</h2>
        <div className="seg">
          <button onClick={() => setRange(7)} aria-pressed={range === 7}>Last 7 days</button>
          <button onClick={() => setRange(30)} aria-pressed={range === 30}>Last 30 days</button>
        </div>
      </div>
      {state === "loading" && <p className="sub">Loading…</p>}
      {state === "error" && <p className="sub">Could not load this panel.</p>}
      {data && data.n === 0 && (
        <p className="sub">
          No stress spikes with enough surrounding detail in this range. Recovery needs a check-in
          long enough to be scored more than once.
        </p>
      )}
      {built && (
        <>
          <p className="sub">
            Everyone spikes. The trainable part is how fast the voice settles back to its own
            baseline. All {built.total} {built.total === 1 ? "spike" : "spikes"} from this run in one
            bar, sorted by how long they took to come down. About {built.floor} seconds is the
            fastest these check-ins can measure, so the first segment means &ldquo;at least that
            fast&rdquo;. That floor is per client, not a fixed number.
          </p>
          <div className="card">
            <RecBar built={built} />
            <div className="legend" style={{ paddingTop: 12 }}>
              {built.buckets.map((b) => (
                <span key={b.label}>
                  <i style={{ background: b.n ? b.c : LINE }} />
                  {b.label} · <b>{b.pct}%</b> ({b.n})
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function MatrixPanel({ clientId }: { clientId: string }) {
  const { data, state } = useLazyPanel<{ keys: MarkerKey[]; matrix: number[][] }>(
    `/api/v1/dashboard/${clientId}/?panel=matrix&days=90`,
  );
  return (
    <section className="sect">
      <div className="eyebrow">Seven dials, one map</div>
      <h2 className="sectTitle">How the markers move together</h2>
      <p className="sub">
        Every marker against every other, across the whole run. A dashed ring means the pair shares
        inputs, so part of that agreement is by construction.
      </p>
      <div className="card">
        {state === "loading" && <p className="sub">Loading…</p>}
        {state === "error" && <p className="sub">Could not load this panel.</p>}
        {data && <MatChart m={data.matrix} />}
      </div>
    </section>
  );
}

// ── Marks, ported from the design ─────────────────────────────────

function sparkPoints(days: DayRow[], key: MarkerKey, take: number) {
  return days.filter((d) => d.m[key] != null).slice(-take).map((d) => ({ d: d.day, v: d.m[key]! }));
}

function Spark({ points, w, h, color }: { points: { d: string; v: number }[]; w: number; h: number; color: string }) {
  if (points.length < 2) return <span style={{ display: "block", width: w, height: h }} />;
  const vs = points.map((p) => p.v);
  const lo = Math.min(...vs) - 3, hi = Math.max(...vs) + 3;
  const o0 = ord(points[0]!.d), o1 = ord(points[points.length - 1]!.d);
  const x = (d: string) => 2 + ((ord(d) - o0) / Math.max(1, o1 - o0)) * (w - 4);
  const y = (v: number) => 2 + (1 - (v - lo) / (hi - lo || 1)) * (h - 4);
  const last = points[points.length - 1]!;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }} aria-hidden="true">
      <path d={points.map((p, i) => `${i ? "L" : "M"}${x(p.d).toFixed(1)} ${y(p.v).toFixed(1)}`).join(" ")}
        fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx={x(last.d)} cy={y(last.v)} r="2.4" fill={color} />
    </svg>
  );
}

function ZoneChart({ days, zoneKey, range }: { days: DayRow[]; zoneKey: MarkerKey; range: Range }) {
  const W = 1040, H = 300, R = 96, L = 36, T = 14, B = 32;
  const withVal = days.filter((d) => d.m[zoneKey] != null);
  if (!withVal.length) return <p className="note">No readings for this dial yet.</p>;

  const lastOrd = ord(withVal[withVal.length - 1]!.day);
  const shownDays = withVal.filter((d) => ord(d.day) > lastOrd - range);
  if (shownDays.length < 2) return <p className="note">Not enough days in this range.</p>;

  const allVals = withVal.map((d) => d.m[zoneKey]!);
  const base = statMean(allVals);
  const sd = statSd(allVals);
  const shown = shownDays.map((d) => ({ d: d.day, v: d.m[zoneKey]!, n: d.n }));

  const O0 = ord(shown[0]!.d), O1 = ord(shown[shown.length - 1]!.d);
  const span = Math.max(1, O1 - O0);
  const x = (d: string) => L + ((ord(d) - O0) / span) * (W - L - R);
  const lo0 = Math.min(base - sd, ...shown.map((p) => p.v));
  const hi0 = Math.max(base + sd, ...shown.map((p) => p.v));
  const ymin = Math.max(0, Math.floor((lo0 - 8) / 10) * 10);
  const ymax = Math.min(100, Math.ceil((hi0 + 8) / 10) * 10);
  const step = ymax - ymin > 45 ? 20 : 10;
  const y = (v: number) => T + (1 - (v - ymin) / (ymax - ymin || 1)) * (H - T - B);

  const grid: number[] = [];
  for (let g = Math.ceil(ymin / step) * step; g <= ymax; g += step) grid.push(g);

  const hiBad = HI_BAD[zoneKey];
  const every = Math.ceil(shown.length / 7);
  const claimed: [number, number][] = [];
  const free = (lx: number, ly: number) =>
    !claimed.some((c) => Math.abs(c[0] - lx) < 70 && Math.abs(c[1] - ly) < 13);

  const labels: React.ReactNode[] = [];
  const dots = shown.map((p, i) => {
    const outHi = p.v > base + sd, outLo = p.v < base - sd, out = outHi || outLo;
    const bad = outHi ? hiBad : outLo ? !hiBad : false;
    const dotCol = out ? (bad ? CLAY : TEAL) : DOT_PLAIN;
    if (out) {
      const above = p.v > base;
      const lx = Math.min(Math.max(x(p.d), L + 34), W - R - 34);
      let ly = y(p.v) + (above ? -12 : 22);
      const dir = above ? -13 : 13;
      let guard = 0;
      while (!free(lx, ly) && guard++ < 8) ly += dir;
      claimed.push([lx, ly]);
      labels.push(
        <text key={`ol${i}`} x={lx} y={ly} textAnchor="middle" fontSize="11.5" fontWeight="700"
          fill={bad ? CLAY : TEAL_DEEP}>{`${short(p.d)} · ${Math.round(p.v)}`}</text>,
      );
    }
    return (
      <circle key={`m${i}`} cx={x(p.d)} cy={y(p.v)} r={out ? 6 : 4} fill={dotCol} stroke="#FFFFFF" strokeWidth="2">
        <title>
          {`${p.d}: average ${Math.round(p.v)} from ${p.n} reading${p.n === 1 ? "" : "s"}` +
            (out ? (bad ? ". Outside the usual zone, the wrong way." : ". Outside the usual zone, the good way.") : "")}
        </title>
      </circle>
    );
  });

  const zlY = y(base + sd) + 16;
  const zlLeftFree = free(L + 50, zlY);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ display: "block", width: "100%", height: "auto" }} role="img"
      aria-label={`Daily averages against a usual zone of ${Math.round(base - sd)} to ${Math.round(base + sd)}.`}>
      {grid.map((g) => (
        <g key={`g${g}`}>
          <line x1={L} x2={W - R} y1={y(g)} y2={y(g)} stroke={LINE} />
          <text x={L - 7} y={y(g) + 4} textAnchor="end" fontSize="12" fill={MUTED}>{g}</text>
        </g>
      ))}
      <rect x={L} y={y(base + sd)} width={W - L - R} height={y(base - sd) - y(base + sd)} fill={ZONE_FILL}>
        <title>{`Usual zone: ${Math.round(base - sd)} to ${Math.round(base + sd)}, one standard swing either side of the client's baseline across the whole run.`}</title>
      </rect>
      <line x1={L} x2={W - R} y1={y(base)} y2={y(base)} stroke={TEAL} strokeWidth="1.5" strokeDasharray="6 5" />
      <text x={W - R + 8} y={y(base) + 4} fontSize="12.5" fontWeight="700" fill={TEAL_DEEP}>
        {`usual ${Math.round(base)}`}
      </text>
      {shown.slice(1).map((p, k) => {
        const i = k + 1;
        const consec = ord(p.d) - ord(shown[i - 1]!.d) === 1;
        return (
          <line key={`ln${i}`} x1={x(shown[i - 1]!.d)} y1={y(shown[i - 1]!.v)} x2={x(p.d)} y2={y(p.v)}
            stroke={CONNECT} strokeWidth={consec ? 1.8 : 1.1}
            strokeDasharray={consec ? undefined : "2 5"} opacity={consec ? 0.9 : 0.55} />
        );
      })}
      {dots}
      {labels}
      {shown.map((p, i) =>
        i % every === 0 ? (
          <text key={`d${i}`} x={x(p.d)} y={H - 12} textAnchor="middle" fontSize="11.5" fill={MUTED}>
            {short(p.d)}
          </text>
        ) : null,
      )}
      <text x={zlLeftFree ? L + 8 : W - R - 8} y={zlY} textAnchor={zlLeftFree ? "start" : "end"}
        fontSize="11.5" fill={TEAL_DEEP}>
        {`zone ${Math.round(base - sd)} to ${Math.round(base + sd)}`}
      </text>
    </svg>
  );
}

function buildRecovery(R: Recovery) {
  const res = R.resolutionSec || 10;
  const t1 = Math.round(res), t2 = Math.round(res * 3), t3 = Math.round(res * 6);
  const s = R.times;
  const buckets = [
    { label: `Back within ~${t1} seconds`, n: s.filter((v) => v <= res + 0.5).length, c: TEAL },
    { label: `Within ~${t2} seconds`, n: s.filter((v) => v > res + 0.5 && v <= t2).length, c: "#4fa583" },
    { label: `Within ~${t3} seconds`, n: s.filter((v) => v > t2 && v <= t3).length, c: "#B0A98F" },
    { label: "Took longer", n: s.filter((v) => v > t3).length, c: "#7E786B" },
    { label: "Never settled that session", n: R.censored, c: CLAY },
  ];
  const total = buckets.reduce((a, b) => a + b.n, 0) || 1;
  return {
    floor: t1,
    total,
    buckets: buckets.map((b) => ({ ...b, pct: Math.round((b.n / total) * 100) })),
  };
}

function RecBar({ built }: { built: ReturnType<typeof buildRecovery> }) {
  const W = 1040, H = 88, L = 4, RG = 4, T = 8, BH = 44;
  const shown = built.buckets.filter((b) => b.n > 0);

  // Widths and offsets resolved up front, as prefix sums. The design
  // accumulated an `x` cursor while drawing; that is a mutation during
  // render, which React's compiler rightly rejects. At five segments
  // the quadratic prefix sum is free and the drawing stays pure.
  const widths = shown.map((b) => (b.n / built.total) * (W - L - RG));
  const laid = shown.map((b, i) => ({
    ...b,
    w: widths[i]!,
    at: L + widths.slice(0, i).reduce((sum, x) => sum + x, 0),
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ display: "block", width: "100%", height: "auto" }} role="img"
      aria-label="Spikes by how long they took to settle, fastest on the left.">
      {laid.map((b, i) => (
        <g key={`b${i}`}>
          <rect x={b.at + 1} y={T} width={Math.max(3, b.w - 2)} height={BH} rx="6" fill={b.c}>
            <title>{`${b.label}: ${b.pct}% (${b.n} of ${built.total})`}</title>
          </rect>
          {b.w > 52 && (
            <text x={b.at + b.w / 2} y={T + BH / 2 + 6} textAnchor="middle" fontSize="16" fontWeight="700" fill="#FFFFFF">
              {b.pct}%
            </text>
          )}
        </g>
      ))}
      <text x={L} y={T + BH + 26} fontSize="16" fill={MUTED}>← settled fastest</text>
      <text x={W - RG} y={T + BH + 26} textAnchor="end" fontSize="16" fill={MUTED}>slowest, or never →</text>
    </svg>
  );
}

function MatChart({ m }: { m: number[][] }) {
  const W = 1040, L = 110, T = 34, ch = 52;
  const cw = (W - L - 8) / MAT_KEYS.length;
  const H = T + MAT_KEYS.length * ch + 8;

  const mix = (hex: string, pct: number) => {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    const p = pct / 100;
    return `rgb(${Math.round(r * p + 255 * (1 - p))},${Math.round(g * p + 255 * (1 - p))},${Math.round(b * p + 255 * (1 - p))})`;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ display: "block", width: "100%", height: "auto" }} role="img"
      aria-label="Correlation between every pair of markers.">
      {MAT_KEYS.map((k, j) => (
        <text key={`h${j}`} x={L + j * cw + cw / 2} y={T - 12} textAnchor="middle" fontSize="14" fontWeight="700" fill={MUTED}>
          {MAT_NAMES[k]}
        </text>
      ))}
      {MAT_KEYS.map((a, i) => (
        <g key={`row${i}`}>
          <text x={L - 12} y={T + i * ch + ch / 2 + 5} textAnchor="end" fontSize="14" fontWeight="700" fill={MUTED}>
            {MAT_NAMES[a]}
          </text>
          {MAT_KEYS.map((b, j) => {
            const v = m[i]?.[j] ?? 0;
            const cx = L + j * cw, cy = T + i * ch;
            if (i === j) {
              return (
                <g key={`c${i}-${j}`}>
                  <rect x={cx + 2} y={cy + 2} width={cw - 4} height={ch - 4} rx="6" fill={SELF_FILL} />
                  <text x={cx + cw / 2} y={cy + ch / 2 + 5} textAnchor="middle" fontSize="14" fill={CONNECT}>—</text>
                </g>
              );
            }
            const pct = Math.min(88, Math.abs(v) * 110);
            const shared = CIRC.has(pairKey(a, b));
            return (
              <g key={`c${i}-${j}`}>
                <rect x={cx + 2} y={cy + 2} width={cw - 4} height={ch - 4} rx="6"
                  fill={mix(v >= 0 ? TEAL : CLAY, pct)}
                  stroke={shared ? MUTED : "none"} strokeWidth={shared ? 1.4 : 0}
                  strokeDasharray={shared ? "4 4" : undefined}>
                  <title>
                    {`${MAT_NAMES[a]} × ${MAT_NAMES[b]}: ${(v > 0 ? "+" : "") + v.toFixed(2)}` +
                      (shared ? ". Shares inputs, partly by construction." : "")}
                  </title>
                </rect>
                <text x={cx + cw / 2} y={cy + ch / 2 + 5} textAnchor="middle" fontSize="14.5" fontWeight="700"
                  fill={Math.abs(v) > 0.45 ? "#FFFFFF" : INK}>
                  {(v > 0 ? "+" : "") + v.toFixed(2).replace("0.", ".")}
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}
