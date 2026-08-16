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
  if (!all.length) return { n: 0, times: [], resolutionSec: 10, censored: 0 };

  const baseline = mean(all);
  const swing = sd(all);
  const peakAt = baseline + swing;

  const gaps: number[] = [];
  for (const s of sessions) {
    for (let i = 1; i < s.length; i++) gaps.push((s[i]!.t! - s[i - 1]!.t!) / 1000);
  }
  gaps.sort((a, b) => a - b);
  const resolutionSec = gaps.length ? Math.max(1, Math.round(gaps[Math.floor(gaps.length / 2)]!)) : 10;

  const times: number[] = [];
  let censored = 0;
  for (const s of sessions) {
    for (let i = 0; i < s.length; i++) {
      if (s[i]!.v! <= peakAt) continue;
      if (i > 0 && s[i - 1]!.v! > peakAt) continue; // still the same spike
      let j = i + 1;
      while (j < s.length && s[j]!.v! > baseline) j++;
      if (j < s.length) times.push((s[j]!.t! - s[i]!.t!) / 1000);
      else censored += 1; // ended while still elevated
    }
  }
  times.sort((a, b) => a - b);
  return { n: times.length + censored, times, resolutionSec, censored };
}


// ── Panel: by hour of the local day ───────────────────────────────
//
// Observations carry a local DATE and a coarse time-of-day bucket, but
// no local hour and no UTC offset. The hour is still recoverable,
// because the device's bucketing rule is known:
//
//   morning 5-12 · afternoon 12-17 · evening 17-21 · night otherwise
//   (health_items_observations_repository.dart)
//
// Only one whole-hour offset can put every check-in in the bucket the
// device chose AND on the local date it recorded. Solving for it costs
// one small aggregation — counts per (utc hour, bucket), at most 96
// rows — not a scan of the run.
//
// The fit is returned with the answer. A run spanning a daylight-saving
// change has no single correct offset, so a poor fit is reported rather
// than papered over, and the caller falls back to buckets.

const BUCKET_OF = (h: number) =>
  h >= 5 && h < 12 ? "morning" : h >= 12 && h < 17 ? "afternoon" : h >= 17 && h < 21 ? "evening" : "night";

export interface OffsetSolve {
  /** Only meaningful when perRow is false. */
  offset: number;
  /** Share of check-ins the offset explains, 0-1. */
  fit: number;
  /**
   * True when the rows carry their own offset, so the hour comes from
   * what the device recorded rather than from a whole-run guess. This
   * is the only path that survives a daylight-saving change or a
   * user who travels.
   */
  perRow?: boolean;
}

export async function solveUtcOffset(userId: string, days: number): Promise<OffsetSolve> {
  const db = await getDb();
  const since = new Date(Date.now() - days * 864e5);

  // Prefer what the device actually recorded. Rows from app V45 carry
  // the offset in force at capture, and the backfill wrote it onto the
  // older rows whose timezone could be pinned. Solving is the fallback
  // for whatever is left, not the normal path.
  const stored = await db
    .collection("observations")
    .aggregate([
      {
        $match: {
          user_id: userId,
          deleted_at: null,
          created_at: { $gte: since },
          utc_offset_minutes: { $ne: null },
        },
      },
      { $group: { _id: null, n: { $sum: 1 } } },
    ])
    .toArray();

  const totalInRange = await db.collection("observations").countDocuments({
    user_id: userId,
    deleted_at: null,
    created_at: { $gte: since },
  });
  const haveOffset = (stored[0]?.n as number) ?? 0;
  if (totalInRange > 0 && haveOffset / totalInRange >= 0.9) {
    return { offset: 0, fit: 1, perRow: true };
  }
  const rows = await db
    .collection("observations")
    .aggregate([
      {
        $match: {
          user_id: userId,
          deleted_at: null,
          created_at: { $gte: since },
          "extraction.time_of_day": { $ne: null },
        },
      },
      { $group: { _id: { h: { $hour: "$created_at" }, tod: "$extraction.time_of_day" }, n: { $sum: 1 } } },
    ])
    .toArray();

  const total = rows.reduce((s, r) => s + (r.n as number), 0);
  if (!total) return { offset: 0, fit: 0 };

  let best = { offset: 0, fit: 0 };
  for (let off = -12; off <= 14; off++) {
    let ok = 0;
    for (const r of rows) {
      const g = r._id as { h: number; tod: string };
      if (BUCKET_OF((g.h + off + 24) % 24) === g.tod) ok += r.n as number;
    }
    const fit = ok / total;
    if (fit > best.fit) best = { offset: off, fit };
  }
  return best;
}

/** Means per local hour. At most 24 rows out. */
export async function getByHour(
  userId: string,
  days: number,
  keys: MarkerKey[],
  offset: number,
  minN = 3,
) {
  const db = await getDb();
  // Per-row offset wins; the solved whole-run offset is the fallback
  // for rows that never recorded one. Adding 1440 before the modulo
  // keeps a negative offset positive before the wrap.
  const localHour = {
    $mod: [
      {
        $add: [
          { $multiply: [{ $hour: "$hAt" }, 60] },
          { $minute: "$hAt" },
          { $ifNull: ["$rowOffset", offset * 60] },
          1440,
        ],
      },
      1440,
    ],
  };
  const group: Document = {
    _id: { $floor: { $divide: [localHour, 60] } },
    n: { $sum: 1 },
  };
  for (const k of keys) group[k] = { $avg: `$w.${k}` };

  const stages = windowStages(userId, days, keys);
  // windowStages projects away created_at, so carry the hour through.
  const proj = (stages[1] as { $project: Document }).$project;
  proj.hAt = "$created_at";
  proj.rowOffset = "$utc_offset_minutes";

  const rows = await db.collection("observations").aggregate([...stages, { $group: group }, { $sort: { _id: 1 } }]).toArray();

  return rows
    .filter((r) => (r.n as number) >= minN)
    .map((r) => {
      const m: Partial<Record<MarkerKey, number>> = {};
      for (const k of keys) if (typeof r[k] === "number") m[k] = r[k] as number;
      return { hour: r._id as number, n: r.n as number, m };
    });
}
