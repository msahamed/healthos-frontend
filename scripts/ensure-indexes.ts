// Create the indexes the auth collections depend on.
//
//   npx tsx scripts/ensure-indexes.ts
//
// Run once per environment, and again after adding an index here.
// `createIndex` is idempotent, so re-running is safe and cheap.
//
// Two of these are load-bearing rather than performance tuning:
//
//   - The TTL indexes are how expired codes, dead sessions, and
//     spent rate-limit buckets get collected. Without them those
//     collections grow forever. (Session expiry is ALSO checked in
//     the query, because Mongo's TTL reaper only runs about once a
//     minute — the index is cleanup, not enforcement.)
//   - The unique index on accounts.email is what stops a race
//     between two simultaneous first-time verifies creating two
//     accounts for one address, which would fork a user's identity.

import { MongoClient } from "mongodb";

const DB = "healthos";

// Next loads .env.local for the app, but not for standalone scripts.
// `process.loadEnvFile` is built into Node 20.12+, so this needs no
// dotenv dependency — and it parses values containing `&` and `%`
// correctly, which a shell `source` of the same file does not.
function loadEnv() {
  if (process.env.MONGODB_URI) return;
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // Fall through to the explicit error below.
  }
}

async function main() {
  loadEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(DB);

  await db
    .collection("accounts")
    .createIndex({ email: 1 }, { unique: true, name: "email_unique" });
  await db
    .collection("accounts")
    .createIndex({ user_id: 1 }, { name: "user_id" });

  await db.collection("auth_codes").createIndex({ email: 1 }, { name: "email" });
  await db
    .collection("auth_codes")
    .createIndex({ expires_at: 1 }, { expireAfterSeconds: 0, name: "ttl" });

  await db
    .collection("sessions")
    .createIndex({ expires_at: 1 }, { expireAfterSeconds: 0, name: "ttl" });
  await db
    .collection("sessions")
    .createIndex({ account_id: 1 }, { name: "account_id" });

  // The dashboard's only read shape: one person's live observations
  // in a date window, newest first. Without this it is a collection
  // scan over every user's history on every page load.
  await db
    .collection("observations")
    .createIndex(
      { user_id: 1, deleted_at: 1, created_at: -1 },
      { name: "user_live_by_date" },
    );

  await db
    .collection("rate_limits")
    .createIndex({ expires_at: 1 }, { expireAfterSeconds: 0, name: "ttl" });

  console.log("indexes ensured on", DB);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
