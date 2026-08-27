// Put a test account into any entitlement state, instantly.
//
//   npx tsx scripts/test-account.ts --show
//   npx tsx scripts/test-account.ts --state trial
//   npx tsx scripts/test-account.ts --state ending --rearm
//   npx tsx scripts/test-account.ts --email other@x.com --state expired
//
// States:
//   none      never trialed, never paid — the "Start free trial" screen
//   trial     day 1 of the trial
//   ending    2 days left (what the reminder email queries for)
//   expired   trial ran out yesterday — the gate closed
//   active    paying, renews in 30 days
//   cancelled paying but cancelled — access until the period ends
//
// --rearm also clears the "already emailed" markers, so the cron will
// send the trial emails again on the next run. Without it a second run
// stays quiet, which is correct behaviour and confusing while testing.
//
// The `active` and `cancelled` states are written DIRECTLY and do not
// create anything in Stripe. That is deliberate — it makes the client
// side testable in a second without spending a card number — but it
// does mean Stripe and Mongo disagree afterwards. Any real webhook for
// that account will overwrite this with the truth. To test the actual
// payment path, go through checkout instead.

import { MongoClient } from "mongodb";
import { randomUUID } from "node:crypto";

const DB = "healthos";
const DAY = 24 * 60 * 60 * 1000;
const DEFAULT_EMAIL = "sabbers+gate1@gmail.com";

function loadEnv() {
  if (process.env.MONGODB_URI) return;
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // Fall through to the explicit error below.
  }
}

function arg(flag: string): string | null {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? (process.argv[i + 1] ?? null) : null;
}

const STATES = ["none", "trial", "ending", "expired", "active", "cancelled"] as const;
type State = (typeof STATES)[number];

/** Fields to $set and $unset for each state. */
function shapeFor(state: State, days: number) {
  const now = Date.now();
  const clear = {
    trial_started_at: "",
    trial_days: "",
    subscription_status: "",
    current_period_end: "",
    cancel_at_period_end: "",
  };
  switch (state) {
    case "none":
      return { set: {}, unset: clear };
    case "trial":
      return {
        set: { trial_started_at: new Date(now), trial_days: days },
        unset: {
          subscription_status: "",
          current_period_end: "",
          cancel_at_period_end: "",
        },
      };
    case "ending":
      return {
        set: { trial_started_at: new Date(now - (days - 2) * DAY), trial_days: days },
        unset: {
          subscription_status: "",
          current_period_end: "",
          cancel_at_period_end: "",
        },
      };
    case "expired":
      return {
        set: { trial_started_at: new Date(now - (days + 1) * DAY), trial_days: days },
        unset: {
          subscription_status: "",
          current_period_end: "",
          cancel_at_period_end: "",
        },
      };
    case "active":
      return {
        set: {
          subscription_status: "active",
          current_period_end: new Date(now + 30 * DAY),
          cancel_at_period_end: false,
        },
        unset: {},
      };
    case "cancelled":
      return {
        set: {
          subscription_status: "active",
          current_period_end: new Date(now + 30 * DAY),
          cancel_at_period_end: true,
        },
        unset: {},
      };
  }
}

async function main() {
  loadEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  const email = (arg("--email") ?? DEFAULT_EMAIL).trim().toLowerCase();
  const days = Number(process.env.TRIAL_DAYS) || 14;
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db(DB).collection("accounts");

  const show = async (label: string) => {
    const d = await col.findOne({ email });
    if (!d) {
      console.log(`${label}: no account row for ${email}`);
      return;
    }
    const { entitlementFor } = await import("../lib/entitlement");
    const e = entitlementFor(d as never);
    console.log(`${label}: ${e.state}` +
      (e.days_left != null ? `, ${e.days_left}d` : "") +
      (e.ends_at_expiry ? ", ends (not renewing)" : "") +
      `  [${e.reason}]`);
  };

  if (process.argv.includes("--show") || !arg("--state")) {
    await show("current");
    if (!arg("--state")) {
      console.log(`\nstates: ${STATES.join(" | ")}`);
      console.log(`usage : npx tsx scripts/test-account.ts --state trial [--rearm] [--email ${email}]`);
    }
    await client.close();
    return;
  }

  const state = arg("--state") as State;
  if (!STATES.includes(state)) {
    console.log(`Unknown state "${state}". One of: ${STATES.join(", ")}`);
    await client.close();
    return;
  }

  // Create the row if it isn't there, so a fresh alias works first time.
  await col.updateOne(
    { email },
    {
      $setOnInsert: {
        email,
        user_id: randomUUID(),
        role: "client",
        verified_at: null,
        created_at: new Date(),
      },
    },
    { upsert: true },
  );

  await show("before ");

  const { set, unset } = shapeFor(state, days);
  const rearm = process.argv.includes("--rearm");
  const update: Record<string, unknown> = {};
  if (Object.keys(set).length) update.$set = set;
  const allUnset = {
    ...unset,
    ...(rearm ? { trial_ending_email_at: "", trial_ended_email_at: "" } : {}),
  };
  if (Object.keys(allUnset).length) update.$unset = allUnset;
  if (Object.keys(update).length) await col.updateOne({ email }, update);

  await show("after  ");
  if (rearm) console.log("(email markers cleared — the cron will send again)");

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
