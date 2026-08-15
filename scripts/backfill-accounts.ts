// Create `accounts` rows for people who already installed the app.
//
//   npx tsx scripts/backfill-accounts.ts            # dry run (default)
//   npx tsx scripts/backfill-accounts.ts --apply    # write
//
// Why only installed users: a waitlist row gets a `user_id` from
// exactly one place — SignupService in the mobile app POSTing it at
// onboarding. So "has a user_id" IS "installed the app at some point."
// Marketing-site signups who never installed have no user_id, nothing
// to migrate, and no reason to hold an account.
//
// Why this is safe to run: /auth/verify already resolves identity as
// accounts -> waitlist.user_id -> device id. A backfilled row carries
// the SAME user_id the waitlist fallback would have produced, so the
// resolved identity is identical either way. This changes which
// collection answers the question, not the answer.
//
// The one thing it does cost: before this, the existence of an
// accounts row meant "this person verified their email." Backfilled
// rows are NOT verified — nobody proved they read that inbox. So they
// carry `verified_at: null`, and /auth/verify stamps `verified_at` on
// real verification. Check that field, never row existence, when the
// answer matters (sharing, payment, anything a coach can see).
//
// Idempotent: skips any email that already has an account.

import { MongoClient } from "mongodb";

const DB = "healthos";

function loadEnv() {
  if (process.env.MONGODB_URI) return;
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // Fall through to the explicit error below.
  }
}

interface WaitlistRow {
  email: string;
  user_id?: string | null;
  createdAt?: Date | null;
  first_source?: string | null;
}

async function main() {
  loadEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  const apply = process.argv.includes("--apply");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(DB);

  const waitlist = db.collection<WaitlistRow>("waitlist");
  const accounts = db.collection("accounts");
  const observations = db.collection("observations");

  const installed = await waitlist
    .find({ user_id: { $exists: true, $ne: null } })
    .toArray();

  const existing = new Set(
    (await accounts.distinct("email")) as string[],
  );

  const toCreate: WaitlistRow[] = [];
  for (const row of installed) {
    const email = (row.email ?? "").trim().toLowerCase();
    if (!email || existing.has(email)) continue;
    toCreate.push({ ...row, email });
  }

  console.log(`waitlist rows with a user_id : ${installed.length}`);
  console.log(`already have an account      : ${installed.length - toCreate.length}`);
  console.log(`to create                    : ${toCreate.length}`);
  console.log("");

  const now = new Date();
  for (const row of toCreate) {
    const obs = await observations.countDocuments(
      { user_id: row.user_id!, deleted_at: null },
      { limit: 1000 },
    );
    const masked = row.email.replace(/^(..).*@/, "$1***@");
    console.log(
      `  ${masked.padEnd(24)} user_id=${row.user_id} observations=${obs}`,
    );

    if (apply) {
      await accounts.insertOne({
        email: row.email,
        user_id: row.user_id,
        role: "client",
        // Never verified — this row was inferred from an install, not
        // proven by a code. See the header note.
        verified_at: null,
        created_at: row.createdAt ?? now,
        migrated_from: "waitlist",
        migrated_at: now,
      });
    }
  }

  console.log("");
  console.log(
    apply
      ? `✓ created ${toCreate.length} account(s)`
      : `dry run — nothing written. Re-run with --apply to create ${toCreate.length}.`,
  );

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
