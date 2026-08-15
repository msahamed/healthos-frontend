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

interface MarkerVal {
  value?: number;
  baseline?: { mean?: number };
}
interface ObsDoc {
  created_at: Date;
  markers?: Record<string, MarkerVal>;
}

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

export interface ClientDetail extends ClientSummary {
  deltas: MarkerDelta[];
  /** Daily means of the standout marker over 30 days. */
  trend: { day: string; value: number }[];
  /** The person's usual range for that marker: baseline ± 1 sd. */
  band: { low: number; high: number } | null;
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

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Group observations into per-day means for one marker. */
function dailyMeans(obs: ObsDoc[], key: string): { day: string; value: number }[] {
  const buckets = new Map<string, number[]>();
  for (const o of obs) {
    const v = o.markers?.[key]?.value;
    if (typeof v !== "number" || !Number.isFinite(v)) continue;
    const d = dayKey(o.created_at);
    const arr = buckets.get(d);
    if (arr) arr.push(v);
    else buckets.set(d, [v]);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, vs]) => ({ day, value: mean(vs) }));
}

/**
 * How far each marker's recent average sits from that person's own
 * baseline. Recent means the last 7 days, which is enough to be a
 * pattern rather than one bad morning.
 */
function computeDeltas(obs: ObsDoc[], since: Date): MarkerDelta[] {
  const recent = obs.filter((o) => o.created_at >= since);
  const out: MarkerDelta[] = [];

  for (const { key, label } of MARKERS) {
    const vals: number[] = [];
    const bases: number[] = [];
    for (const o of recent) {
      const m = o.markers?.[key];
      if (typeof m?.value === "number") vals.push(m.value);
      if (typeof m?.baseline?.mean === "number") bases.push(m.baseline.mean);
    }
    if (!vals.length || !bases.length) continue;

    const base = Math.max(mean(bases), MIN_BASE);
    const ratio = (mean(vals) - base) / base;
    out.push({ key, label, ratio, notable: Math.abs(ratio) >= NOTABLE });
  }
  return out;
}

async function loadObservations(userId: string, since: Date): Promise<ObsDoc[]> {
  const db = await getDb();
  return db
    .collection<ObsDoc>("observations")
    .find(
      { user_id: userId, deleted_at: null, created_at: { $gte: since } },
      // Markers and a timestamp. Never transcript, never voice_clip.
      { projection: { _id: 0, created_at: 1, markers: 1 } },
    )
    .sort({ created_at: 1 })
    .toArray();
}

function summarize(
  userId: string,
  email: string,
  obs: ObsDoc[],
  since7: Date,
): ClientSummary {
  const deltas = computeDeltas(obs, since7);
  const standout =
    deltas.slice().sort((a, b) => Math.abs(b.ratio) - Math.abs(a.ratio))[0] ??
    null;

  const spark = standout
    ? dailyMeans(obs, standout.key).slice(-14).map((d) => d.value)
    : [];

  return {
    userId,
    email,
    name: nameFromEmail(email),
    initials: initialsOf(email),
    count30: obs.length,
    count7: obs.filter((o) => o.created_at >= since7).length,
    lastAt: obs.length ? obs[obs.length - 1]!.created_at : null,
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
  const since30 = new Date(Date.now() - 30 * 864e5);
  const since7 = new Date(Date.now() - 7 * 864e5);
  const obs = await loadObservations(session.userId, since30);
  return [summarize(session.userId, session.email, obs, since7)];
}

/** Null when this session may not see that person. */
export async function getClientDetail(
  session: { userId: string; email: string },
  userId: string,
): Promise<ClientDetail | null> {
  // The only permitted subject until sharing exists. This is the
  // authorization boundary for the dashboard, so it stays explicit.
  if (userId !== session.userId) return null;

  const since30 = new Date(Date.now() - 30 * 864e5);
  const since7 = new Date(Date.now() - 7 * 864e5);
  const obs = await loadObservations(userId, since30);
  const base = summarize(userId, session.email, obs, since7);
  const deltas = computeDeltas(obs, since7);

  let trend: { day: string; value: number }[] = [];
  let band: { low: number; high: number } | null = null;

  if (base.standout) {
    trend = dailyMeans(obs, base.standout.key);
    const bases = obs
      .map((o) => o.markers?.[base.standout!.key]?.baseline?.mean)
      .filter((x): x is number => typeof x === "number");
    if (bases.length) {
      const b = mean(bases);
      const vals = trend.map((t) => t.value);
      const sd = vals.length > 1
        ? Math.sqrt(mean(vals.map((v) => (v - b) ** 2)))
        : 0.05;
      band = { low: b - sd, high: b + sd };
    }
  }

  return { ...base, deltas, trend, band };
}

/**
 * One fetch that feeds every analytics panel, so the page makes a
 * single round trip instead of one per chart.
 *
 * Projection is deliberately narrow: a timestamp, the marker block,
 * and the device's local time-of-day label. No transcript, no
 * voice_clip, no raw signals, no frames. Rows carrying no markers at
 * all are dropped here rather than in each panel.
 */
export async function getReadings(
  userId: string,
  days = 90,
): Promise<import("@/lib/analytics").Reading[]> {
  const db = await getDb();
  const since = new Date(Date.now() - days * 864e5);
  const rows = await db
    .collection("observations")
    .find(
      { user_id: userId, deleted_at: null, created_at: { $gte: since } },
      {
        projection: {
          _id: 0,
          created_at: 1,
          markers: 1,
          "extraction.time_of_day": 1,
        },
      },
    )
    .sort({ created_at: 1 })
    .toArray();

  const out: import("@/lib/analytics").Reading[] = [];
  for (const r of rows) {
    const markers: Record<string, number> = {};
    for (const { key } of MARKERS) {
      const v = (r.markers as Record<string, MarkerVal> | undefined)?.[key]?.value;
      if (typeof v === "number" && Number.isFinite(v)) markers[key] = v;
    }
    if (!Object.keys(markers).length) continue;
    out.push({
      at: r.created_at as Date,
      timeOfDay:
        (r.extraction as { time_of_day?: string } | undefined)?.time_of_day ?? null,
      markers,
    });
  }
  return out;
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
