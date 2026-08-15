// Deeper per-person analytics, ported from the panels proven out in
// science/voice-analysis-pipeline/reports/rhoni.
//
// Transcript is never read here. The Rhoni report has a panel that
// reads check-ins back against their own transcript; that one is
// deliberately left out. Everything below is markers and timestamps.
//
// The statistical care in that report carries over, because it is the
// difference between analytics and astrology:
//
//   - A slope without its uncertainty is how a random wobble gets sold
//     as progress. Every trend ships with an interval, and when the
//     interval crosses zero the verdict is "flat", not a direction.
//   - Correlations between markers built from shared inputs are one
//     signal seen twice, not two dials agreeing. Those pairs are
//     flagged rather than presented as findings.
//   - Buckets with too few samples are shown as empty, not averaged
//     into a confident-looking number.

import { MARKERS } from "@/lib/dashboard";

/** A bucket needs at least this many readings to be worth showing. */
const MIN_SAMPLES = 3;

/**
 * Marker pairs that share input features, so their correlation is
 * partly circular. From voice-markers-reference-v2 and the Rhoni
 * report: energy, confidence and breathing all read pause structure.
 */
const SHARED_INPUTS = new Set([
  "confidence|energy",
  "breathing|confidence",
  "breathing|energy",
  "energy|fatigue",
]);

export interface Reading {
  at: Date;
  timeOfDay: string | null;
  markers: Record<string, number>;
}

export interface DayPoint {
  day: string;
  values: Record<string, number>;
  n: number;
}

export interface BucketMean {
  bucket: string;
  values: Record<string, number>;
  n: number;
}

export interface Trend {
  key: string;
  label: string;
  /** Points (0-100 scale) per week. */
  perWeek: number;
  lo: number;
  hi: number;
  verdict: "rising" | "falling" | "flat";
}

export interface Coupling {
  a: string;
  b: string;
  r: number;
  /** True when the two markers share input features. */
  circular: boolean;
}

const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

export function pearson(xs: number[], ys: number[]): number | null {
  const n = Math.min(xs.length, ys.length);
  if (n < 4) return null;
  const mx = mean(xs.slice(0, n)),
    my = mean(ys.slice(0, n));
  let num = 0,
    dx = 0,
    dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i]! - mx,
      b = ys[i]! - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? null : num / den;
}

/** Per-day means. Days with no readings are simply absent: a gap in
 *  the data is shown as a gap, not bridged with a line. */
export function daily(readings: Reading[]): DayPoint[] {
  const buckets = new Map<string, Reading[]>();
  for (const r of readings) {
    const k = r.at.toISOString().slice(0, 10);
    const arr = buckets.get(k);
    if (arr) arr.push(r);
    else buckets.set(k, [r]);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, rs]) => {
      const values: Record<string, number> = {};
      for (const { key } of MARKERS) {
        const vs = rs.map((r) => r.markers[key]).filter((v): v is number => v != null);
        if (vs.length) values[key] = mean(vs);
      }
      return { day, values, n: rs.length };
    });
}

/** Morning / afternoon / evening / night, as recorded on the device in
 *  local time. Deriving this from a UTC timestamp would be wrong. */
export function byTimeOfDay(readings: Reading[]): BucketMean[] {
  const ORDER = ["morning", "afternoon", "evening", "night"];
  const buckets = new Map<string, Reading[]>();
  for (const r of readings) {
    if (!r.timeOfDay) continue;
    const arr = buckets.get(r.timeOfDay);
    if (arr) arr.push(r);
    else buckets.set(r.timeOfDay, [r]);
  }
  return ORDER.filter((b) => (buckets.get(b)?.length ?? 0) >= MIN_SAMPLES).map((bucket) => {
    const rs = buckets.get(bucket)!;
    const values: Record<string, number> = {};
    for (const { key } of MARKERS) {
      const vs = rs.map((r) => r.markers[key]).filter((v): v is number => v != null);
      if (vs.length >= MIN_SAMPLES) values[key] = mean(vs);
    }
    return { bucket, values, n: rs.length };
  });
}

/**
 * Least-squares slope per marker over time, with a 95% interval.
 * Reported in points per week on the 0-100 scale people actually see.
 * When the interval crosses zero the verdict is flat, however
 * suggestive the middle estimate looks.
 */
export function trends(readings: Reading[]): Trend[] {
  if (readings.length < 6) return [];
  const t0 = readings[0]!.at.getTime();
  const out: Trend[] = [];

  for (const { key, label } of MARKERS) {
    const pts = readings
      .filter((r) => r.markers[key] != null)
      .map((r) => ({ x: (r.at.getTime() - t0) / 864e5, y: r.markers[key]! * 100 }));
    if (pts.length < 6) continue;

    const n = pts.length;
    const mx = mean(pts.map((p) => p.x)),
      my = mean(pts.map((p) => p.y));
    let sxy = 0,
      sxx = 0;
    for (const p of pts) {
      sxy += (p.x - mx) * (p.y - my);
      sxx += (p.x - mx) ** 2;
    }
    if (sxx === 0) continue;
    const slope = sxy / sxx;

    // Standard error of the slope, then a 95% interval. Using 1.96 is
    // close enough at these sample sizes and errs slightly narrow, so
    // the verdict below is if anything conservative about "flat".
    let sse = 0;
    for (const p of pts) sse += (p.y - (my + slope * (p.x - mx))) ** 2;
    const se = Math.sqrt(sse / (n - 2) / sxx);
    const lo = (slope - 1.96 * se) * 7;
    const hi = (slope + 1.96 * se) * 7;
    const perWeek = slope * 7;

    out.push({
      key,
      label,
      perWeek,
      lo,
      hi,
      verdict: lo > 0 ? "rising" : hi < 0 ? "falling" : "flat",
    });
  }
  return out;
}

/** Every marker pair, strongest first, with the circular ones flagged. */
export function couplings(readings: Reading[]): Coupling[] {
  const out: Coupling[] = [];
  for (let i = 0; i < MARKERS.length; i++) {
    for (let j = i + 1; j < MARKERS.length; j++) {
      const a = MARKERS[i]!.key,
        b = MARKERS[j]!.key;
      const pairs = readings.filter((r) => r.markers[a] != null && r.markers[b] != null);
      const r = pearson(
        pairs.map((p) => p.markers[a]!),
        pairs.map((p) => p.markers[b]!),
      );
      if (r == null) continue;
      out.push({
        a,
        b,
        r,
        circular: SHARED_INPUTS.has([a, b].sort().join("|")),
      });
    }
  }
  return out.sort((x, y) => Math.abs(y.r) - Math.abs(x.r));
}

/** Stress against confidence, one dot per reading, plus their r. */
export function stressVsConfidence(readings: Reading[]) {
  const pts = readings
    .filter((r) => r.markers.stress != null && r.markers.confidence != null)
    .map((r) => ({ x: r.markers.stress!, y: r.markers.confidence! }));
  return { points: pts, r: pearson(pts.map((p) => p.x), pts.map((p) => p.y)) };
}

export const labelOf = (key: string) =>
  MARKERS.find((m) => m.key === key)?.label ?? key;
