// Coach analytics reads.
//
// One function per panel, each aggregating INSIDE Mongo and returning
// only what that panel draws. Nothing here loads a run into Node and
// slices it up: the correlation matrix returns 21 numbers instead of
// ~1,600 windows, a day chart returns one row per day, and a marker
// chip fetches that marker alone. That is what the chips and the 7/30
// toggle are for.
//
// Windows come from `frames` — one scored window every few seconds
// inside a check-in — falling back to the check-in's own marker block
// when a row predates frames. Values are 0-100, as the design shows
// them; the fallback block is 0-1 and is scaled on the way out.
//
// Never reads transcript.

import { getDb } from "@/lib/auth";
import type { Document } from "mongodb";
import {
  MARKER_KEYS,
  statMean as mean,
  statSd as sd,
  type DayRow,
  type MarkerKey,
  type Recovery,
} from "@/lib/markers";

export * from "@/lib/markers";

// ── Shared pipeline head ──────────────────────────────────────────
//
// Turns each observation into a stream of scored windows regardless of
// whether it carries frames, so every panel below counts the same
// things. `keys` narrows the payload to the markers a panel needs.

function windowStages(userId: string, days: number, keys: readonly string[]): Document[] {
  const since = new Date(Date.now() - days * 864e5);
  const fromFrames: Document = {};
  const fromMarkers: Document = {};
  for (const k of keys) {
    fromFrames[k] = `$$f.m.${k}`;
    // Legacy rows store 0-1 on the check-in itself.
    fromMarkers[k] = { $multiply: [{ $ifNull: [`$markers.${k}.value`, null] }, 100] };
  }

  return [
    { $match: { user_id: userId, deleted_at: null, created_at: { $gte: since } } },
    {
      $project: {
        _id: 0,
        day: { $ifNull: ["$extraction.event_date", { $dateToString: { date: "$created_at", format: "%Y-%m-%d" } }] },
        tod: "$extraction.time_of_day",
        w: {
          $cond: [
            { $gt: [{ $size: { $ifNull: ["$frames", []] } }, 0] },
            { $map: { input: "$frames", as: "f", in: { ...fromFrames, t: "$$f.t" } } },
            [{ ...fromMarkers, t: null }],
          ],
        },
      },
    },
    { $unwind: "$w" },
  ];
}

// ── Panel: day means (drives triage, zones and the day chart) ─────


/**
 * One row per local day. This is the only call the first paint makes:
 * it is small (a few dozen rows) and three panels read from it.
 */
export async function getDayMeans(userId: string, days = 90): Promise<DayRow[]> {
  const db = await getDb();
  const group: Document = { _id: "$day", n: { $sum: 1 } };
  for (const k of MARKER_KEYS) group[k] = { $avg: `$w.${k}` };

  const rows = await db
    .collection("observations")
    .aggregate([...windowStages(userId, days, MARKER_KEYS), { $group: group }, { $sort: { _id: 1 } }])
    .toArray();

  return rows.map((r) => {
    const m: Partial<Record<MarkerKey, number>> = {};
    for (const k of MARKER_KEYS) if (typeof r[k] === "number") m[k] = r[k] as number;
    return { day: r._id as string, n: r.n as number, m };
  });
}

/** Totals for the header, in one cheap pass. */
export async function getTotals(userId: string, days = 90) {
  const db = await getDb();
  const since = new Date(Date.now() - days * 864e5);
  const [row] = await db
    .collection("observations")
    .aggregate([
      { $match: { user_id: userId, deleted_at: null, created_at: { $gte: since } } },
      {
        $group: {
          _id: null,
          checkins: { $sum: 1 },
          windows: { $sum: { $max: [{ $size: { $ifNull: ["$frames", []] } }, 1] } },
          lastAt: { $max: "$created_at" },
          firstDay: { $min: "$extraction.event_date" },
          lastDay: { $max: "$extraction.event_date" },
        },
      },
    ])
    .toArray();

  if (!row) return { checkins: 0, windows: 0, lastAt: null, spanDays: 0 };
  const span =
    row.firstDay && row.lastDay
      ? Math.round((Date.parse(row.lastDay) - Date.parse(row.firstDay)) / 864e5) + 1
      : 0;
  return {
    checkins: row.checkins as number,
    windows: row.windows as number,
    lastAt: (row.lastAt as Date) ?? null,
    spanDays: span,
  };
}

// ── Panel: time of day ────────────────────────────────────────────

/**
 * Pooled by the device's own local bucket.
 *
 * The design charts this by hour. The cloud cannot: observations carry
 * a local DATE and a coarse bucket, but no local hour and no UTC
 * offset, so an hourly axis built here would silently be in the wrong
 * timezone. Four honest buckets beat twenty-four wrong ones.
 */
export async function getTimeOfDay(userId: string, days: number, keys: MarkerKey[], minN = 5) {
  const db = await getDb();
  const group: Document = { _id: "$tod", n: { $sum: 1 } };
  for (const k of keys) group[k] = { $avg: `$w.${k}` };

  const rows = await db
    .collection("observations")
    .aggregate([...windowStages(userId, days, keys), { $match: { tod: { $ne: null } } }, { $group: group }])
    .toArray();

  const ORDER = ["morning", "afternoon", "evening", "night"];
  return ORDER.flatMap((bucket) => {
    const r = rows.find((x) => x._id === bucket);
    if (!r || (r.n as number) < minN) return [];
    const m: Partial<Record<MarkerKey, number>> = {};
    for (const k of keys) if (typeof r[k] === "number") m[k] = r[k] as number;
    return [{ bucket, n: r.n as number, m }];
  });
}

// ── Panel: correlation matrix ─────────────────────────────────────

/**
 * Pearson for all 21 pairs, accumulated in Mongo as sums. Returns 21
 * numbers rather than every window, so the payload does not grow with
 * the length of the run.
 */
export async function getMatrix(userId: string, days: number): Promise<number[][]> {
  const db = await getDb();
  const group: Document = { _id: null };
  for (let i = 0; i < MARKER_KEYS.length; i++) {
    for (let j = i + 1; j < MARKER_KEYS.length; j++) {
      const a = MARKER_KEYS[i]!, b = MARKER_KEYS[j]!;
      const both = { $and: [{ $ne: [`$w.${a}`, null] }, { $ne: [`$w.${b}`, null] }] };
      const p = `${a}__${b}`;
      group[`${p}_n`] = { $sum: { $cond: [both, 1, 0] } };
      group[`${p}_x`] = { $sum: { $cond: [both, `$w.${a}`, 0] } };
      group[`${p}_y`] = { $sum: { $cond: [both, `$w.${b}`, 0] } };
      group[`${p}_xy`] = { $sum: { $cond: [both, { $multiply: [`$w.${a}`, `$w.${b}`] }, 0] } };
      group[`${p}_xx`] = { $sum: { $cond: [both, { $multiply: [`$w.${a}`, `$w.${a}`] }, 0] } };
      group[`${p}_yy`] = { $sum: { $cond: [both, { $multiply: [`$w.${b}`, `$w.${b}`] }, 0] } };
    }
  }

  const [row] = await db
    .collection("observations")
    .aggregate([...windowStages(userId, days, MARKER_KEYS), { $group: group }])
    .toArray();

  const out = MARKER_KEYS.map(() => MARKER_KEYS.map(() => 0));
  for (let i = 0; i < MARKER_KEYS.length; i++) out[i]![i] = 1;
  if (!row) return out;

  for (let i = 0; i < MARKER_KEYS.length; i++) {
    for (let j = i + 1; j < MARKER_KEYS.length; j++) {
      const p = `${MARKER_KEYS[i]}__${MARKER_KEYS[j]}`;
      const n = row[`${p}_n`] as number;
      if (!n || n < 4) continue;
      const sx = row[`${p}_x`] as number, sy = row[`${p}_y`] as number;
      const num = (row[`${p}_xy`] as number) - (sx * sy) / n;
      const dx = (row[`${p}_xx`] as number) - (sx * sx) / n;
      const dy = (row[`${p}_yy`] as number) - (sy * sy) / n;
      const r = dx > 0 && dy > 0 ? num / Math.sqrt(dx * dy) : 0;
      out[i]![j] = out[j]![i] = Number(r.toFixed(2));
    }
  }
  return out;
}

// ── Panel: recovery ───────────────────────────────────────────────



/**
 * How long a spike takes to fall back inside the usual band.
 *
 * Needs windows in order inside each check-in, which no single $group
 * can express, so this is the one panel that reads rows — but only
 * rows WITH frames, only inside the chosen range, and projected down
 * to a timestamp and the one marker being asked about.
 *
 * The measurement floor is reported rather than hidden. When most
 * spikes land in the first bucket the honest claim is "at least this
 * fast", not a precise median.
 */
export async function getRecovery(
  userId: string,
  days: number,
  key: MarkerKey = "stress",
): Promise<Recovery> {
  const db = await getDb();
  const since = new Date(Date.now() - days * 864e5);

  const rows = await db
    .collection("observations")
    .aggregate([
      {
        $match: {
          user_id: userId,
          deleted_at: null,
          created_at: { $gte: since },
          "frames.0": { $exists: true },
        },
      },
      {
        $project: {
          _id: 0,
          w: { $map: { input: "$frames", as: "f", in: { t: "$$f.t", v: `$$f.m.${key}` } } },
        },
      },
    ])
    .toArray();

  const sessions = rows
    .map((r) =>
      (r.w as { t?: number; v?: number }[])
        .filter((x) => typeof x.t === "number" && typeof x.v === "number")
        .sort((a, b) => a.t! - b.t!),
    )
    .filter((s) => s.length > 1);

  const all = sessions.flatMap((s) => s.map((x) => x.v!));
  if (!all.length) return { n: 0, floorSec: 10, atFloor: false, medianSec: null, buckets: [] };

  const baseline = mean(all);
  const swing = sd(all);
  const peakAt = baseline + swing;

  const gaps: number[] = [];
  for (const s of sessions) for (let i = 1; i < s.length; i++) gaps.push((s[i]!.t! - s[i - 1]!.t!) / 1000);
  gaps.sort((a, b) => a - b);
  const floorSec = gaps.length ? Math.max(1, Math.round(gaps[Math.floor(gaps.length / 2)]!)) : 10;

  const times: number[] = [];
  for (const s of sessions) {
    for (let i = 0; i < s.length; i++) {
      if (s[i]!.v! <= peakAt) continue;
      if (i > 0 && s[i - 1]!.v! > peakAt) continue; // still the same spike
      let j = i + 1;
      while (j < s.length && s[j]!.v! > baseline) j++;
      if (j < s.length) times.push((s[j]!.t! - s[i]!.t!) / 1000);
    }
  }
  if (!times.length) return { n: 0, floorSec, atFloor: false, medianSec: null, buckets: [] };

  const first = Math.round(floorSec * 1.5);
  const edges = [first, 30, 60, 120];
  const labels = [`under ${first}s`, `${first}s to 30s`, "30s to 1 min", "1 to 2 min", "over 2 min"];
  const counts = new Array(labels.length).fill(0) as number[];
  for (const t of times) {
    let i = edges.findIndex((e) => t < e);
    if (i === -1) i = labels.length - 1;
    counts[i] += 1;
  }
  const sorted = times.slice().sort((a, b) => a - b);

  return {
    n: times.length,
    floorSec,
    atFloor: counts[0]! / times.length >= 0.5,
    medianSec: sorted[Math.floor(sorted.length / 2)]!,
    buckets: labels
      .map((label, i) => ({ label, n: counts[i]!, pct: Math.round((counts[i]! / times.length) * 100) }))
      .filter((b) => b.n > 0),
  };
}

