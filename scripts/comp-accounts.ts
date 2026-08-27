// Mark accounts as comped — free forever, never gated.
//
//   npx tsx scripts/comp-accounts.ts a@x.com b@y.com          # dry run
//   npx tsx scripts/comp-accounts.ts a@x.com --apply          # write
//   npx tsx scripts/comp-accounts.ts --file pilots.txt --apply
//   npx tsx scripts/comp-accounts.ts --list                   # who is comped
//
// These are the pilot users who used the product before it was worth
// paying for and told us what was wrong with it. They are not customers
// to be converted; comping them is the deal we owe them.
//
// Run this BEFORE the gate ships. `comped` beats every other signal in
// entitlementFor(), so a comped account never sees a trial clock, never
// expires, and is unaffected by anything Stripe later says.
//
// Idempotent: re-running changes nothing for an already-comped account.
// An email with no account row is REPORTED, not created — a typo should
// surface as "not found", not quietly mint an account that shadows the
// real one at verify time.
//
// To reverse one: db.accounts.updateOne({email}, {$unset:{comped:"", comped_reason:""}})

import { MongoClient } from "mongodb";
import { readFileSync } from "node:fs";

const DB = "healthos";
const DEFAULT_REASON = "pilot user — comped for life";

function loadEnv() {
  if (process.env.MONGODB_URI) return;
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // Fall through to the explicit error below.
  }
}

function argValue(flag: string): string | null {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? (process.argv[i + 1] ?? null) : null;
}

function collectEmails(): string[] {
  const out: string[] = [];
  const file = argValue("--file");
  if (file) {
    out.push(...readFileSync(file, "utf8").split(/\r?\n/));
  }
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--")) continue;
    // Skip the value belonging to --file / --reason.
    if (out.length && (arg === file || arg === argValue("--reason"))) continue;
    out.push(arg);
  }
  return [
    ...new Set(
      out
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e && !e.startsWith("#") && e.includes("@")),
    ),
  ];
}

async function main() {
  loadEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  const apply = process.argv.includes("--apply");
  const reason = argValue("--reason") ?? DEFAULT_REASON;
  const client = new MongoClient(uri);
  await client.connect();
  const accounts = client.db(DB).collection("accounts");

  if (process.argv.includes("--list")) {
    const rows = await accounts
      .find({ comped: true }, { projection: { email: 1, comped_reason: 1 } })
      .toArray();
    console.log(`comped accounts: ${rows.length}`);
    for (const r of rows) console.log(`  ${r.email}  — ${r.comped_reason ?? ""}`);
    await client.close();
    return;
  }

  const emails = collectEmails();
  if (emails.length === 0) {
    console.log("No emails given. Pass them as arguments or via --file.");
    await client.close();
    return;
  }

  const found = new Set(
    (await accounts.distinct("email", { email: { $in: emails } })) as string[],
  );
  const already = new Set(
    (await accounts.distinct("email", {
      email: { $in: emails },
      comped: true,
    })) as string[],
  );

  const missing = emails.filter((e) => !found.has(e));
  const toComp = emails.filter((e) => found.has(e) && !already.has(e));

  console.log(`requested        : ${emails.length}`);
  console.log(`already comped   : ${already.size}`);
  console.log(`to comp          : ${toComp.length}`);
  console.log(`no account found : ${missing.length}`);
  for (const e of missing) console.log(`  MISSING  ${e}`);
  for (const e of toComp) console.log(`  COMP     ${e}`);
  console.log("");

  if (!apply) {
    console.log("Dry run. Re-run with --apply to write.");
    await client.close();
    return;
  }

  if (toComp.length > 0) {
    const res = await accounts.updateMany(
      { email: { $in: toComp } },
      { $set: { comped: true, comped_reason: reason } },
    );
    console.log(`comped ${res.modifiedCount} account(s).`);
  } else {
    console.log("Nothing to do.");
  }

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
