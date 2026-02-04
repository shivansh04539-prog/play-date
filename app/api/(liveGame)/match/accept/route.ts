import { dbConnect } from "@/lib/db";
import Challenge from "@/models/challengeSchema";
import { pusherServer } from "@/lib/pusherServer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { matchId } = await req.json();

    const match = await Challenge.findByIdAndUpdate(
      matchId,
      { status: "accepted", roundEndsAt: Date.now() + 16000 },
      { new: true },
    );

    if (!match)
      return NextResponse.json({ error: "No match" }, { status: 404 });

    // 🔥 THIS IS THE MAGIC PART: Tell Person A (the private channel) to redirect
    await pusherServer.trigger(`private-match-${matchId}`, "match-accepted", {
      matchId: match._id,
      status: "accepted",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
