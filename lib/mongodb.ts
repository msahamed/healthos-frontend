import { MongoClient } from "mongodb";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

export function getMongoClient(): Promise<MongoClient> {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not defined.");
  }

  if (clientPromise) return clientPromise;

  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };
    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(process.env.MONGODB_URI);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(process.env.MONGODB_URI);
    clientPromise = client.connect();
  }

  return clientPromise;
}
