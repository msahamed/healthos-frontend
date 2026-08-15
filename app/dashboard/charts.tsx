// Chart marks for the dashboard. Plain SVG, rendered on the server —
// no chart library, no client JS, nothing to hydrate.
//
// Colour conventions, decided once here:
//   below a person's usual  → var(--below)
//   above a person's usual  → var(--above)
// Those two were validated as a diverging pair (chroma, colour-blind
// separation, contrast) against both the light and dark surfaces.
// Direction carries the meaning; colour only reinforces it, because
// "above" is not automatically bad — high energy is good, high stress
// is not.

import { MARKERS, type MarkerDelta } from "@/lib/dashboard";

export function markColor(ratio: number, notable = true): string {
  if (!notable) return "var(--ink-mute)";
  return ratio > 0 ? "var(--above)" : "var(--below)";
}

/** 14-day sparkline. One series, so no legend: the column names it. */
export function Sparkline({
  values,
  color,
}: {
  values: number[];
  color: string;
}) {
  if (values.length < 2) {
    return <span style={{ fontSize: 12.5, color: "var(--ink-mute)" }}>not enough yet</span>;
  }
  const w = 104,
    h = 26,
    p = 2;
  const min = Math.min(...values),
    max = Math.max(...values);
  const range = max - min || 1;
  const x = (i: number) => p + (i * (w - 2 * p)) / (values.length - 1);
  const y = (v: number) => h - p - ((v - min) / range) * (h - 2 * p);
  const d = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={x(values.length - 1).toFixed(1)}
        cy={y(values[values.length - 1]!).toFixed(1)}
        r="3"
        fill={color}
        stroke="var(--paper)"
        strokeWidth="2"
      />
    </svg>
  );
}

/**
 * Deviation bars: each marker's recent average against that person's
 * own baseline, growing left or right from a centre axis. Full width
 * is a 60% swing, which keeps ordinary weeks legible instead of
 * squashing everything against one outlier.
 */
export function DeviationBars({ deltas }: { deltas: MarkerDelta[] }) {
  const FULL = 0.6;
  const byKey = new Map(deltas.map((d) => [d.key, d]));
  const ordered = MARKERS.map(({ key }) => byKey.get(key)).filter(
    (d): d is MarkerDelta => Boolean(d),
  );

  if (!ordered.length) {
    return (
      <p className="note" style={{ paddingTop: 14 }}>
        No check-ins in the last seven days, so there is nothing to compare yet.
      </p>
    );
  }

  return (
    <div className="bars">
      {ordered.map((d) => {
        const pos = d.ratio > 0;
        const pct = Math.min(Math.abs(d.ratio) / FULL, 1) * 50;
        const color = markColor(d.ratio, d.notable);
        return (
          <div className="bar" key={d.key}>
            <span className="lab">{d.label}</span>
            <span className="track">
              <span className="axis" />
              <span
                className="fill"
                style={{
                  [pos ? "left" : "right"]: "50%",
                  width: `${pct}%`,
                  background: color,
                }}
              />
            </span>
            <span className="val num" style={{ color }}>
              {pos ? "+" : "−"}
              {Math.abs(Math.round(d.ratio * 100))}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** 30-day trend for one marker, with the person's usual range shaded. */
export function TrendChart({
  points,
  band,
  color,
}: {
  points: { day: string; value: number }[];
  band: { low: number; high: number } | null;
  color: string;
}) {
  if (points.length < 2) {
    return (
      <p className="note" style={{ paddingTop: 14 }}>
        A few more check-ins and a trend will show up here.
      </p>
    );
  }

  const w = 360,
    h = 150,
    pl = 8,
    pr = 8,
    pt = 10,
    pb = 18;
  const vals = points.map((p) => p.value);
  const lo = Math.min(...vals, band?.low ?? Infinity);
  const hi = Math.max(...vals, band?.high ?? -Infinity);
  const pad = (hi - lo) * 0.15 || 0.05;
  const min = lo - pad,
    max = hi + pad,
    range = max - min || 1;

  const x = (i: number) => pl + (i * (w - pl - pr)) / (points.length - 1);
  const y = (v: number) => h - pb - ((v - min) / range) * (h - pt - pb);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
  const last = points[points.length - 1]!;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={h}
      role="img"
      aria-label={`Trend over the last ${points.length} days with the usual range shaded.`}
    >
      {band && (
        <>
          <rect
            x={pl}
            y={y(band.high)}
            width={w - pl - pr}
            height={Math.max(y(band.low) - y(band.high), 2)}
            fill="var(--mid)"
            opacity="0.28"
            rx="4"
          />
          <text x={pl + 4} y={y(band.high) - 5} fontSize="10.5" fill="var(--ink-mute)">
            usual range
          </text>
        </>
      )}
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(points.length - 1).toFixed(1)} cy={y(last.value).toFixed(1)} r="4" fill={color} stroke="var(--paper)" strokeWidth="2" />
      <text x={pl} y={h - 4} fontSize="10.5" fill="var(--ink-mute)">
        {points[0]!.day}
      </text>
      <text x={w - pr} y={h - 4} fontSize="10.5" textAnchor="end" fill="var(--ink-mute)">
        latest
      </text>
    </svg>
  );
}
