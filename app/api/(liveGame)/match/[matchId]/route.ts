import { dbConnect } from "@/lib/db";
import Challenge from "@/models/challengeSchema";
import { NextResponse } from "next/server";

// Simple in-memory cache to avoid DB writes
const matchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5000; // 5 seconds

export async function GET(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> },
) {
  try {
    await dbConnect();
    const { matchId } = await params;

    // Check cache first
    const cached = matchCache.get(matchId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log("🚀 Cache hit for", matchId);
      return NextResponse.json(cached.data);
    }

    const match = await Challenge.findById(matchId).lean(); // .lean() for faster reads

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Only initialize if truly missing
    if (!match.roundEndsAt || !match.scores) {
      await Challenge.updateOne(
        { _id: matchId },
        {
          $setOnInsert: {
            roundEndsAt: Date.now() + 16000,
            currentRound: 1,
            scores: { player1: 0, player2: 0 },
          },
        },
        { upsert: false },
      );

      // Fetch again after update
      const updatedMatch = await Challenge.findById(matchId).lean();
      match.roundEndsAt = updatedMatch.roundEndsAt;
      match.currentRound = updatedMatch.currentRound;
      match.scores = updatedMatch.scores;
    }

    const responseData = {
      player1Id: match.challengerId.toString(),
      player2Id: match.receiverId.toString(),
      status: match.status,
      roundEndsAt: match.roundEndsAt,
      currentRound: match.currentRound || 1,
      scores: match.scores || { player1: 0, player2: 0 },
    };

    // Cache the response
    matchCache.set(matchId, { data: responseData, timestamp: Date.now() });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("🔥 [MATCH_GET] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
