// The deeper analytics panels. Server-rendered SVG, no client JS.
//
// Series colours come from a fixed order, assigned per marker and
// never recycled, so a marker keeps its colour across every panel on
// the page. The pair used for direction (--above / --below) is kept
// out of this list: it means "off baseline", not "this marker".

import type { BucketMean, Coupling, DayPoint, Trend } from "@/lib/analytics";
import { labelOf } from "@/lib/analytics";

/** Fixed hue order. A marker's colour is its identity, not its rank. */
// Validated as a 7-slot categorical set on both surfaces: lightness
// band, chroma floor, colour-blind separation, normal-vision floor and
// contrast all pass. Do not hand-tweak a value without re-running
// scripts/validate_palette.js — the earlier greyish fatigue and green
// articulation both failed the chroma floor and read as the same mark.
export const SERIES: Record<string, string> = {
  stress: "#C0522A",
  confidence: "#0E9280",
  energy: "#8A5FC7",
  fatigue: "#8F6D14",
  breathing: "#2F79C4",
  vocal_strain: "#B5478E",
  articulation: "#4E8F3F",
};

const W = 560;

/** Daily means. Missing days stay missing: gaps are the data. */
export function DailyLines({
  days,
  keys,
}: {
  days: DayPoint[];
  keys: string[];
}) {
  const shown = keys.filter((k) => days.some((d) => d.values[k] != null));
  if (days.length < 2 || !shown.length) {
    return <p className="note" style={{ paddingTop: 14 }}>Not enough days yet.</p>;
  }

  const h = 190,
    pl = 30,
    pr = 12,
    pt = 12,
    pb = 26;
  const t0 = Date.parse(days[0]!.day),
    t1 = Date.parse(days[days.length - 1]!.day);
  const span = t1 - t0 || 1;
  const x = (day: string) => pl + ((Date.parse(day) - t0) / span) * (W - pl - pr);
  const y = (v: number) => h - pb - v * (h - pt - pb);

  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${h}`} width="100%" height={h} role="img"
        aria-label={`Daily averages across ${days.length} days for ${shown.map(labelOf).join(", ")}.`}>
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <g key={g}>
            <line x1={pl} x2={W - pr} y1={y(g)} y2={y(g)} stroke="var(--line)" strokeWidth="1" />
            <text x={pl - 6} y={y(g) + 3.5} fontSize="9.5" textAnchor="end" fill="var(--ink-mute)">
              {Math.round(g * 100)}
            </text>
          </g>
        ))}
        {shown.map((k) => {
          // Break the path wherever a day has no reading for this
          // marker, rather than drawing through the gap.
          const segs: string[] = [];
          let cur: string[] = [];
          for (const d of days) {
            const v = d.values[k];
            if (v == null) {
              if (cur.length > 1) segs.push(cur.join(" "));
              cur = [];
              continue;
            }
            cur.push(`${cur.length ? "L" : "M"}${x(d.day).toFixed(1)} ${y(v).toFixed(1)}`);
          }
          if (cur.length > 1) segs.push(cur.join(" "));
          return segs.map((d, i) => (
            <path key={`${k}${i}`} d={d} fill="none" stroke={SERIES[k]} strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          ));
        })}
        <text x={pl} y={h - 6} fontSize="9.5" fill="var(--ink-mute)">{days[0]!.day}</text>
        <text x={W - pr} y={h - 6} fontSize="9.5" textAnchor="end" fill="var(--ink-mute)">
          {days[days.length - 1]!.day}
        </text>
      </svg>
      <Legend keys={shown} />
    </figure>
  );
}

/** Time-of-day means. Buckets under the sample floor are not shown. */
export function TimeOfDayBars({
  buckets,
  keys,
}: {
  buckets: BucketMean[];
  keys: string[];
}) {
  if (!buckets.length) {
    return <p className="note" style={{ paddingTop: 14 }}>Not enough readings to split by time of day.</p>;
  }
  const shown = keys.filter((k) => buckets.some((b) => b.values[k] != null));

  return (
    <figure style={{ margin: 0 }}>
      <div className="tod">
        {buckets.map((b) => (
          <div className="todcol" key={b.bucket}>
            <div className="todbars">
              {shown.map((k) => {
                const v = b.values[k];
                return (
                  <span
                    key={k}
                    className="todbar"
                    style={{ height: v == null ? 2 : `${Math.max(v * 100, 2)}%`, background: SERIES[k] }}
                    title={`${labelOf(k)} ${v == null ? "no data" : Math.round(v * 100)}`}
                  />
                );
              })}
            </div>
            <div className="todlab">{b.bucket}</div>
            <div className="todn num">{b.n}</div>
          </div>
        ))}
      </div>
      <Legend keys={shown} />
    </figure>
  );
}

/** Stress against confidence. If they were opposites this would fall
 *  on a diagonal. Whether it does is the point of the panel. */
export function Scatter({
  points,
  r,
}: {
  points: { x: number; y: number }[];
  r: number | null;
}) {
  if (points.length < 8) {
    return <p className="note" style={{ paddingTop: 14 }}>Not enough scored readings yet.</p>;
  }
  const w = 300,
    h = 240,
    pad = 34;
  const x = (v: number) => pad + v * (w - pad - 12);
  const y = (v: number) => h - pad - v * (h - pad - 12);

  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img"
        aria-label={`Stress against confidence for ${points.length} readings. Correlation ${r?.toFixed(2) ?? "not available"}.`}>
        <line x1={pad} x2={w - 12} y1={h - pad} y2={h - pad} stroke="var(--line-strong)" />
        <line x1={pad} x2={pad} y1={12} y2={h - pad} stroke="var(--line-strong)" />
        {points.map((p, i) => (
          <circle key={i} cx={x(p.x).toFixed(1)} cy={y(p.y).toFixed(1)} r="3"
            fill="var(--teal)" opacity="0.42" />
        ))}
        <text x={(w + pad) / 2} y={h - 8} fontSize="10.5" textAnchor="middle" fill="var(--ink-mute)">stress →</text>
        <text x={12} y={(h - pad) / 2} fontSize="10.5" textAnchor="middle" fill="var(--ink-mute)"
          transform={`rotate(-90 12 ${(h - pad) / 2})`}>confidence →</text>
      </svg>
    </figure>
  );
}

/** Slopes with their intervals. A bar crossing zero reads as flat. */
export function TrendBars({ trends }: { trends: Trend[] }) {
  if (!trends.length) {
    return <p className="note" style={{ paddingTop: 14 }}>Not enough history to fit a trend.</p>;
  }
  const span = Math.max(...trends.map((t) => Math.max(Math.abs(t.lo), Math.abs(t.hi))), 4);

  return (
    <div className="bars">
      {trends.map((t) => {
        const pctOf = (v: number) => 50 + (v / span) * 50;
        const left = Math.min(pctOf(t.lo), pctOf(t.hi));
        const width = Math.abs(pctOf(t.hi) - pctOf(t.lo));
        const flat = t.verdict === "flat";
        const color = flat ? "var(--ink-mute)" : t.perWeek > 0 ? "var(--above)" : "var(--below)";
        return (
          <div className="bar" key={t.key}>
            <span className="lab">{t.label}</span>
            <span className="track">
              <span className="axis" />
              <span className="ci" style={{ left: `${left}%`, width: `${Math.max(width, 1.5)}%`, background: color }} />
              <span className="cidot" style={{ left: `${pctOf(t.perWeek)}%`, background: color }} />
            </span>
            <span className="val num" style={{ color, fontSize: 12.5 }}>
              {flat ? "flat" : `${t.perWeek > 0 ? "+" : "−"}${Math.abs(t.perWeek).toFixed(1)}/wk`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Marker pairs, with the ones sharing inputs called out as such. */
export function CouplingList({ items }: { items: Coupling[] }) {
  if (!items.length) {
    return <p className="note" style={{ paddingTop: 14 }}>Not enough readings to compare markers.</p>;
  }
  return (
    <ul className="couples">
      {items.map((c) => (
        <li key={`${c.a}|${c.b}`}>
          <span className="cpair">
            <i style={{ background: SERIES[c.a] }} />
            {labelOf(c.a)} <span className="cx">and</span>
            <i style={{ background: SERIES[c.b] }} />
            {labelOf(c.b)}
          </span>
          <span className="cr num">{c.r > 0 ? "+" : "−"}{Math.abs(c.r).toFixed(2)}</span>
          {c.circular && <span className="cflag">shares inputs</span>}
        </li>
      ))}
    </ul>
  );
}

function Legend({ keys }: { keys: string[] }) {
  return (
    <figcaption className="legend" style={{ paddingTop: 12 }}>
      {keys.map((k) => (
        <span key={k}>
          <i style={{ background: SERIES[k] }} />
          {labelOf(k)}
        </span>
      ))}
    </figcaption>
  );
}
