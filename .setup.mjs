// Set up a REAL coach so the sharing loop can be tested end to end.
// Uses a plus-address so both sides land in one inbox the founder owns.
process.loadEnvFile(".env.local");
import { MongoClient } from "mongodb";
import { randomUUID } from "node:crypto";

const COACH_EMAIL = "sabbers+rhoni@gmail.com";
const COACH_NAME = "Rhoni Mercer";
const CLIENT_EMAIL = "sabbers@gmail.com";

const c = new MongoClient(process.env.MONGODB_URI); await c.connect();
const db = c.db("healthos");

// 1. A coach account. verified_at stays null: nobody has proved this
//    inbox yet, and signing in is what will set it.
let acct = await db.collection("accounts").findOne({ email: COACH_EMAIL });
if (!acct) {
  const user_id = randomUUID();
  await db.collection("accounts").insertOne({
    email: COACH_EMAIL, user_id, role: "client", verified_at: null,
    created_at: new Date(), source: "manual_test_coach",
  });
  acct = await db.collection("accounts").findOne({ email: COACH_EMAIL });
  console.log("created coach account", user_id);
} else {
  console.log("coach account already exists", acct.user_id);
}

// 2. Their profile name, so the invite can carry it.
await db.collection("profiles").updateOne(
  { _id: acct.user_id },
  { $set: { full_name: COACH_NAME, updated_at: new Date() } },
  { upsert: true },
);
console.log("profile name set:", COACH_NAME);
await c.close();

// 3. The invite, through the real code path.
const { createInvite } = await import("./lib/shares.ts");
const { sendShareInvite } = await import("./lib/email.ts");
const res = await createInvite(
  { userId: acct.user_id, email: COACH_EMAIL, name: COACH_NAME },
  CLIENT_EMAIL,
);
if (!res.ok) { console.error("invite refused:", res.error); process.exit(1); }

const url = `https://ontor.ai/share/${res.token}/`;
await sendShareInvite(CLIENT_EMAIL, `${COACH_NAME} (${COACH_EMAIL})`, url);
console.log("\ninvite sent to", CLIENT_EMAIL);
console.log("accept link:", url);
