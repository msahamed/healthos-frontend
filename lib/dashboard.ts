// Dashboard reads. Analytics only: aggregates over markers, never
// individual check-ins and never transcripts. That is a product
// promise, so it is enforced here in the projection rather than left
// to whoever writes the page.
//
// Everything is scored against the person's OWN baseline, which the
// device already computes and syncs on each observation. Ranking
// people against each other would be easy and wrong: a calm person
// and an anxious person have different normals, so only the distance
// from your own normal carries meaning.

import { getDb } from "@/lib/auth";

/** The seven markers the device produces, in display order. */
export const MARKERS = [
  { key: "stress", label: "Stress" },
  { key: "fatigue", label: "Fatigue" },
  { key: "vocal_strain", label: "Vocal strain" },
  { key: "breathing", label: "Breathing" },
  { key: "articulation", label: "Articulation" },
  { key: "confidence", label: "Confidence" },
  { key: "energy", label: "Energy" },
] as const;

/** A marker this far from baseline is worth surfacing, as a ratio. */
const NOTABLE = 0.25;
/** Baselines near zero make a ratio explode; floor the denominator. */
const MIN_BASE = 0.05;


export interface MarkerDelta {
  key: string;
  label: string;
  /** Recent mean minus baseline, as a ratio of baseline. */
  ratio: number;
  notable: boolean;
}

export interface ClientSummary {
  userId: string;
  email: string;
  name: string;
  initials: string;
  /** Live check-ins in the last 30 days. */
  count30: number;
  /** ...and in the last 7, for the weekly headline. */
  count7: number;
  lastAt: Date | null;
  /** Daily means of the standout marker, oldest first, for a sparkline. */
  spark: number[];
  standout: MarkerDelta | null;
}

function initialsOf(name: string): string {
  return name
    .split(/[\s.@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join("");
}

/** "sabbers@gmail.com" reads better as "Sabbers" until we ask for a name. */
function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((s) => s[0]!.toUpperCase() + s.slice(1))
    .join(" ");
}


/**
 * Roster + detail summary for one person, computed in Mongo.
 *
 * This used to pull every observation's marker block into Node and
 * reduce it here — 83 docs and ~49 KB for a 30-day window, just to
 * show a count, a date and one sparkline. The aggregation returns a
 * handful of rows instead, and the payload no longer grows with how
 * much someone checks in.
 */
async function summaryFor(userId: string, email: string): Promise<ClientSummary> {
  const db = await getDb();
  const since30 = new Date(Date.now() - 30 * 864e5);
  const since7 = new Date(Date.now() - 7 * 864e5);

  const markerAvgs: Record<string, unknown> = {};
  const baseAvgs: Record<string, unknown> = {};
  for (const { key } of MARKERS) {
    markerAvgs[`r_${key}`] = {
      $avg: { $cond: [{ $gte: ["$created_at", since7] }, `$markers.${key}.value`, null] },
    };
    baseAvgs[`b_${key}`] = { $avg: `$markers.${key}.baseline.mean` };
  }

  const [row] = await db
    .collection("observations")
    .aggregate([
      { $match: { user_id: userId, deleted_at: null, created_at: { $gte: since30 } } },
      {
        $group: {
          _id: null,
          count30: { $sum: 1 },
          count7: { $sum: { $cond: [{ $gte: ["$created_at", since7] }, 1, 0] } },
          lastAt: { $max: "$created_at" },
          ...markerAvgs,
          ...baseAvgs,
        },
      },
    ])
    .toArray();

  const deltas: MarkerDelta[] = [];
  if (row) {
    for (const { key, label } of MARKERS) {
      const recent = row[`r_${key}`] as number | null;
      const base = row[`b_${key}`] as number | null;
      if (typeof recent !== "number" || typeof base !== "number") continue;
      const ratio = (recent - Math.max(base, MIN_BASE)) / Math.max(base, MIN_BASE);
      deltas.push({ key, label, ratio, notable: Math.abs(ratio) >= NOTABLE });
    }
  }
  const standout =
    deltas.slice().sort((a, b) => Math.abs(b.ratio) - Math.abs(a.ratio))[0] ?? null;

  // The sparkline is the only series the roster needs, so ask for that
  // one marker by day rather than every marker on every check-in.
  let spark: number[] = [];
  if (standout) {
    const days = await db
      .collection("observations")
      .aggregate([
        { $match: { user_id: userId, deleted_at: null, created_at: { $gte: since30 } } },
        {
          $group: {
            _id: { $ifNull: ["$extraction.event_date", null] },
            v: { $avg: `$markers.${standout.key}.value` },
          },
        },
        { $match: { _id: { $ne: null }, v: { $ne: null } } },
        { $sort: { _id: 1 } },
        { $limit: 60 },
      ])
      .toArray();
    spark = days.slice(-14).map((d) => d.v as number);
  }

  return {
    userId,
    email,
    name: nameFromEmail(email),
    initials: initialsOf(email),
    count30: (row?.count30 as number) ?? 0,
    count7: (row?.count7 as number) ?? 0,
    lastAt: (row?.lastAt as Date) ?? null,
    spark,
    standout,
  };
}

/**
 * Everyone whose data this session may see.
 *
 * Today that is only the signed-in person: client sharing does not
 * exist yet, so a coach with no clients sees their own numbers. When
 * `shares` lands, this is the one function that changes.
 */
export async function getRoster(session: {
  userId: string;
  email: string;
}): Promise<ClientSummary[]> {
  return [await summaryFor(session.userId, session.email)];
}

/**
 * The header summary for one person, or null when this session may not
 * see them.
 *
 * Used to return deltas, a trend and a band as well. The page stopped
 * rendering those when the coach view landed, so computing them meant
 * a second full scan of the same documents for output nobody read.
 */
export async function getClientDetail(
  session: { userId: string; email: string },
  userId: string,
): Promise<ClientSummary | null> {
  // The only permitted subject until sharing exists. This is the
  // authorization boundary for the dashboard, so it stays explicit.
  if (userId !== session.userId) return null;
  return summaryFor(userId, session.email);
}

/** Headline numbers across the whole roster. */
export function aggregate(roster: ClientSummary[]) {
  const since7 = Date.now() - 7 * 864e5;
  return {
    people: roster.length,
    checkinsWeek: roster.reduce((n, c) => n + c.count7, 0),
    worthALook: roster.filter((c) => c.standout?.notable).length,
    quiet: roster.filter((c) => !c.lastAt || c.lastAt.getTime() < since7).length,
  };
}
