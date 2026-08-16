// Backfill `utc_offset_minutes` onto observations that predate V45.
//
//   npx tsx scripts/backfill-utc-offset.ts            # dry run
//   npx tsx scripts/backfill-utc-offset.ts --apply
//   npx tsx scripts/backfill-utc-offset.ts --user <user_id>
//
// The device stores created_at as UTC and throws its offset away, so
// the offset has to be recovered. Two local-time survivors make that
// possible, because both are computed on-device BEFORE the conversion:
//
//   extraction.event_date    the local calendar date
//   extraction.time_of_day   morning 5-12 · afternoon 12-17 ·
//                            evening 17-21 · night otherwise
//                            (health_items_observations_repository.dart)
//
// ── Why this solves for a ZONE, not an offset ─────────────────────
//
// A single offset is wrong the moment a run crosses a daylight-saving
// boundary: US Central is -300 in summer and -360 in winter, so a
// backfill that picked one number would misplace half the year by an
// hour. Solving for an IANA zone instead means the offset is asked for
// per observation, at that instant, and the DST rules come from the
// system tz database rather than from anything hand-written here.
//
// Each candidate zone is scored on how many observations it explains on
// BOTH constraints. A zone has to reproduce the exact local date and
// the exact bucket the device recorded; two zones an hour apart almost
// never agree on both across a few hundred check-ins.
//
// Anything below MIN_FIT is left alone. An unrecoverable offset is
// better as null (honestly unknown) than as a confident wrong number.

import { MongoClient } from "mongodb";
import type { Document } from "mongodb";

const DB = "healthos";
const MIN_FIT = 0.98;

/** Zones worth trying. Ordered by how likely they are for this base. */
const CANDIDATES = [
  "America/Chicago", "America/New_York", "America/Denver", "America/Los_Angeles",
  "America/Phoenix", "America/Anchorage", "Pacific/Honolulu", "America/Toronto",
  "America/Mexico_City", "America/Sao_Paulo", "Europe/London", "Europe/Dublin",
  "Europe/Berlin", "Europe/Paris", "Europe/Madrid", "Europe/Lisbon",
  "Europe/Warsaw", "Europe/Athens", "Europe/Moscow", "Asia/Dubai",
  "Asia/Karachi", "Asia/Kolkata", "Asia/Kathmandu", "Asia/Dhaka",
  "Asia/Bangkok", "Asia/Singapore", "Asia/Shanghai", "Asia/Tokyo",
  "Asia/Seoul", "Australia/Perth", "Australia/Sydney", "Pacific/Auckland",
  "UTC",
];

function loadEnv() {
  if (process.env.MONGODB_URI) return;
  try {
    process.loadEnvFile(".env.local");
  } catch {
    /* fall through to the explicit error */
  }
}

/**
 * Offset in signed minutes east of UTC for `zone` at `at`.
 *
 * Formatting the same instant in the zone and in UTC and differencing
 * the two gets the DST-correct answer for that date without shipping a
 * tz table: Intl consults the system database, which knows when the
 * rules changed.
 */
function offsetMinutes(zone: string, at: Date): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const p = Object.fromEntries(fmt.formatToParts(at).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(
    Number(p.year), Number(p.month) - 1, Number(p.day),
    Number(p.hour) % 24, Number(p.minute), Number(p.second),
  );
  return Math.round((asUtc - Math.floor(at.getTime() / 1000) * 1000) / 60000);
}

const bucketOf = (h: number) =>
  h >= 5 && h < 12 ? "morning" : h >= 12 && h < 17 ? "afternoon" : h >= 17 && h < 21 ? "evening" : "night";

interface Row {
  _id: string;
  created_at: Date;
  extraction?: { event_date?: string; time_of_day?: string };
}

/** Does `zone` reproduce what the device recorded for this row? */
function explains(zone: string, r: Row): boolean {
  const off = offsetMinutes(zone, r.created_at);
  const local = new Date(r.created_at.getTime() + off * 60000);
  const date = local.toISOString().slice(0, 10);
  const bucket = bucketOf(local.getUTCHours());
  return date === r.extraction?.event_date && bucket === r.extraction?.time_of_day;
}

async function main() {
  loadEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  const apply = process.argv.includes("--apply");
  const userArg = process.argv.indexOf("--user");
  const onlyUser = userArg > -1 ? process.argv[userArg + 1] : null;

  const client = new MongoClient(uri);
  await client.connect();
  // _id is a client-supplied UUID string, not an ObjectId.
  const col = client.db(DB).collection<Document & { _id: string }>("observations");

  const match: Record<string, unknown> = {
    "extraction.event_date": { $ne: null },
    "extraction.time_of_day": { $ne: null },
    utc_offset_minutes: { $exists: false },
  };
  if (onlyUser) match.user_id = onlyUser;

  const users = (await col.distinct("user_id", match)) as string[];
  console.log(`users with rows to backfill: ${users.length}\n`);

  let written = 0;
  for (const user of users) {
    const rows = (await col
      .find({ ...match, user_id: user }, {
        projection: { _id: 1, created_at: 1, "extraction.event_date": 1, "extraction.time_of_day": 1 },
      })
      .toArray()) as unknown as Row[];
    if (!rows.length) continue;

    // Score every candidate zone on the whole run.
    const scored = CANDIDATES.map((zone) => ({
      zone,
      fit: rows.filter((r) => explains(zone, r)).length / rows.length,
    })).sort((a, b) => b.fit - a.fit);

    const best = scored[0]!;
    const short = user.slice(0, 8);

    if (best.fit < MIN_FIT) {
      console.log(
        `  ${short}…  ${String(rows.length).padStart(4)} rows  SKIP  best ${best.zone} only ${(best.fit * 100).toFixed(1)}%`,
      );
      continue;
    }

    // A tie between zones is fine when they agree on the offsets they
    // imply — Berlin and Paris are both +120, and which label we use is
    // irrelevant because the label is not what gets stored. A tie is
    // FATAL when they disagree: Chicago and Denver can both reproduce a
    // short run's dates and buckets while implying -300 and -360. With
    // no way to choose, the honest answer is to leave it null.
    const sig = (zone: string) => rows.map((r) => offsetMinutes(zone, r.created_at)).join(",");
    const tied = scored.filter((z) => z.fit >= best.fit - 1e-9);
    const distinct = new Set(tied.map((z) => sig(z.zone)));

    if (distinct.size > 1) {
      const example = tied.slice(0, 3).map((z) => `${z.zone} ${offsetMinutes(z.zone, rows[0]!.created_at)}`).join(" vs ");
      console.log(
        `  ${short}…  ${String(rows.length).padStart(4)} rows  SKIP  ambiguous: ${example}` +
          ` — too few check-ins to separate them`,
      );
      continue;
    }

    // More than one offset across the run means it spans a
    // daylight-saving change, which is exactly what a single fixed
    // offset would have got wrong.
    const offsets = new Set(rows.map((r) => offsetMinutes(best.zone, r.created_at)));
    console.log(
      `  ${short}…  ${String(rows.length).padStart(4)} rows  WRITE ${best.zone}` +
        `${tied.length > 1 ? ` (${tied.length} zones agree)` : ""}` +
        `  offsets: ${[...offsets].sort((a, b) => a - b).join(", ")}`,
    );

    if (!apply) continue;

    // One bulk write, offset resolved per row at its own instant.
    const ops = rows.map((r) => ({
      updateOne: {
        filter: { _id: r._id },
        update: {
          $set: {
            utc_offset_minutes: offsetMinutes(best.zone, r.created_at),
            utc_offset_source: "backfill",
            utc_offset_zone: best.zone,
          },
        },
      },
    }));
    for (let i = 0; i < ops.length; i += 500) {
      const res = await col.bulkWrite(ops.slice(i, i + 500));
      written += res.modifiedCount;
    }
  }

  console.log(
    apply ? `\n✓ wrote an offset onto ${written} observation(s)` : "\ndry run — nothing written. Re-run with --apply.",
  );
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
