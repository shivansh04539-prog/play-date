import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Challenge from "@/models/challengeSchema";

export async function POST(req: Request) {
  try {
    const { matchId, playerScore, opponentScore, winnerId } = await req.json();
    await dbConnect();

    // Update the existing challenge with scores and status
    // Inside your live-match-results POST function
    const updated = await Challenge.findByIdAndUpdate(
      matchId,
      {
        $set: {
          status: "completed",
          // CHANGE THIS: Put finalScore and winnerId INSIDE a result object
          result: {
            winnerId: winnerId,
            finalScore: { player: playerScore, opponent: opponentScore },
          },
        },
      },
      { new: true },
    );

    if (!updated)
      return NextResponse.json({ error: "Match not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DB Update Error:", error);
    return NextResponse.json(
      { error: "Failed to save results" },
      { status: 500 },
    );
  }
}
