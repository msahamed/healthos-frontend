import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { email, feedback } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    const client = await getMongoClient();
    const db = client.db("healthos");
    const collection = db.collection("waitlist");

    await collection.insertOne({
      email,
      feedback: feedback || null,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[waitlist]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
