import { dbConnect } from "@/lib/db";
import Challenge from "@/models/challengeSchema";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> },
) {
  try {
    await dbConnect();
    const { matchId } = await params;
    const { status, pScore, oScore, userId } = await request.json();

    console.log("🏁 [FINISH] Completing match:", matchId, "Status:", status);

    // 🛡️ Atomic Update: Finds the match AND updates it in one go
    const match = await Challenge.findOneAndUpdate(
      { _id: matchId, status: { $ne: "completed" } }, // Don't update if already completed
      {
        $set: {
          status: "completed",
          "result.finalScore": { player: pScore, opponent: oScore },
          "result.winnerId": status === "win" ? userId : null,
        },
      },
      { new: true },
    );

    if (!match) {
      console.log("⚠️ [FINISH] Match already completed or not found");
      return NextResponse.json(
        { message: "Match already finalized" },
        { status: 200 },
      );
    }

    console.log("✅ [FINISH] Match completed successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🔥 [MATCH_FINISH] Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
