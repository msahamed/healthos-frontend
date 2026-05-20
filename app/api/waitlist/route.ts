import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { email, feedback } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("healthos");
    const collection = db.collection("waitlist");

    const existing = await collection.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Already on the waitlist." }, { status: 409 });
    }

    await collection.insertOne({
      email,
      feedback: feedback || null,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
