import { MongoClient } from "mongodb";
import { createHash } from "node:crypto";
process.loadEnvFile(".env.local");
const [, , email, code] = process.argv;
const c = new MongoClient(process.env.MONGODB_URI); await c.connect();
const col = c.db("healthos").collection("auth_codes");
await col.deleteMany({ email });
await col.insertOne({ email, code_hash: createHash("sha256").update(`${email}:${code}:${process.env.AUTH_PEPPER ?? ""}`).digest("hex"),
  expires_at: new Date(Date.now()+600000), created_at: new Date(), ip: "test" });
console.log("seeded"); await c.close();
