import { NextResponse } from "next/server";
import User from "@/models/User";
import { dbConnect } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Challenge from "@/models/challengeSchema";
import { pusherServer } from "@/lib/pusherServer";

export async function POST() {
  const startTime = Date.now();
  console.log("🚀 [MATCH_API] Starting Multicast Match Search...");

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const challengerId = decoded.userId;

    await dbConnect();

    const fourMinutesAgo = new Date(Date.now() - 4 * 60 * 1000);

    // 2. Fetch TOP 5 most recent active users
    const potentialOpponents = await User.find({
      _id: { $ne: challengerId },
      lastActive: { $gte: fourMinutesAgo },
    })
      .sort({ lastActive: -1 })
      .limit(5)
      .select("_id name");

    console.log(
      `🔍 [MATCH_API] Found ${potentialOpponents.length} potential opponents active since ${fourMinutesAgo.toLocaleTimeString()}`,
    );

    if (potentialOpponents.length === 0) {
      console.log("❌ [MATCH_API] No users online in the last 4 minutes.");
      return NextResponse.json({ error: "NO_USERS_ONLINE" }, { status: 404 });
    }

    // List targeted names for debugging
    const names = potentialOpponents.map((u) => u.name).join(", ");
    console.log(`🎯 [MATCH_API] Targeting users: [${names}]`);

    const mainTarget = potentialOpponents[0];

    const newChallenge = await Challenge.create({
      challengerId,
      receiverId: mainTarget._id,
      status: "pending",
      mode: "live",
      challengerMoves: [],
    });

    const challenger = await User.findById(challengerId).select("name photo");

    // 4. BROADCAST to all 5
    await Promise.all(
      potentialOpponents.map((opponent) =>
        pusherServer.trigger(`user-${opponent._id}`, "new-challenge", {
          senderName: challenger?.name || "Someone",
          challengeId: newChallenge._id,
          mode: "live",
        }),
      ),
    );

    const duration = Date.now() - startTime;
    console.log(
      `✅ [MATCH_API] Success! Multicast sent in ${duration}ms. Match ID: ${newChallenge._id}`,
    );

    return NextResponse.json({ matchId: newChallenge._id }, { status: 201 });
  } catch (error) {
    console.error("🔥 [MATCH_API] CRITICAL ERROR:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
