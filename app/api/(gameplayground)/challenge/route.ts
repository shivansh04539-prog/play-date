import { dbConnect } from "@/lib/db";
import Challenge from "@/models/challengeSchema";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusherServer";

import Notification from "@/models/Notification";

// 1. GET: Fetching data for Activity Tab or Match Game
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const challengeId = searchParams.get("id");
    const status = searchParams.get("status") || "pending";

    if (challengeId) {
      const challenge = await Challenge.findById(challengeId)
        .populate("challengerId", "name photo")
        .lean();
      // REMOVED the .select("-challengerMoves") here!
      // We NEED the moves for the actual game to work.
      return NextResponse.json(challenge);
    }

    if (userId) {
      const query: any = { status: status };

      if (status === "completed") {
        query.$or = [{ challengerId: userId }, { receiverId: userId }];
      } else {
        const fortyFiveSecondsAgo = new Date(Date.now() - 45 * 1000);
        query.receiverId = userId;
        query.$or = [
          { mode: "recorded" },
          { mode: "live", createdAt: { $gte: fortyFiveSecondsAgo } },
        ];
      }

      const challenges = await Challenge.find(query)
        // PRO OPTIMIZATION: Only fetch 'name', NO 'photo' for history
        .populate("challengerId", "name")
        .populate("receiverId", "name")
        .select("-challengerMoves -receiverMoves")
        .sort({ createdAt: -1 })
        .limit(status === "completed" ? 15 : 10)
        .lean(); // This makes the query 4x faster

      return NextResponse.json(challenges);
    }
    return NextResponse.json({ error: "No ID" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
// 2. POST: Saving the moves when you record a game
// 2. POST: Saving the moves when you record a game
// 2. POST: Saving the moves when you record a game
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { challengerId, receiverId, moves } = body;

    console.log("------------------------------------");
    console.log("👉 DEBUG: Sender (Challenger):", challengerId);
    console.log("👉 DEBUG: Target (Receiver):", receiverId);
    console.log("------------------------------------");

    // 1. Create Challenge
    const newChallenge = await Challenge.create({
      challengerId,
      receiverId,
      challengerMoves: moves,
      status: "pending",
      mode: "recorded",
    });

    // 2. Create Notification
    const savedNotification = await Notification.create({
      userId: receiverId,
      senderId: challengerId,
      type: "CHALLENGE",
      challengeId: newChallenge._id,
      seen: false,
    });

    // ✅ DETAILED NOTIFICATION LOGGING
    console.log("🔔 NOTIFICATION DETAILS:");
    console.log("  - Notification ID:", savedNotification._id);
    console.log("  - userId (receiver):", savedNotification.userId);
    console.log("  - userId type:", typeof savedNotification.userId);
    console.log("  - senderId:", savedNotification.senderId);
    console.log("  - challengeId:", savedNotification.challengeId);
    console.log("  - seen:", savedNotification.seen);
    console.log("  - type:", savedNotification.type);

    // 3. Fetch User Name for Pusher
    const challenger = await User.findById(challengerId).select("name");

    // 4. Trigger Notification via Pusher
    try {
      console.log("📡 Attempting Pusher trigger...");
      console.log("  - Channel: user-" + receiverId);
      console.log("  - Event: new-challenge");

      const pusherResponse = await pusherServer.trigger(
        `user-${receiverId}`,
        "new-challenge",
        {
          senderName: challenger?.name || "Someone",
          challengeId: newChallenge._id,
          mode: "recorded",
        },
      );

      console.log("✨ Pusher Response Status:", pusherResponse.status);
      console.log("✅ Pusher Sent Successfully!");
    } catch (pusherErr: any) {
      console.error("❌ PUSHER ERROR:");
      console.error("  Message:", pusherErr.message);
      console.error("  Status:", pusherErr.status);
      console.error("  Body:", pusherErr.body);
      console.log("⚠️ Pusher failed but notification saved to DB");
    }

    return NextResponse.json(
      { success: true, id: newChallenge._id },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("🔥 Global API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// 3. PATCH: Completing the game and wiping moves

// ... Keep GET and POST exactly as they are ...

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { challengeId, status, winnerId, finalScore } = body;

    const existingChallenge = await Challenge.findById(challengeId);
    if (!existingChallenge) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (existingChallenge.status === "completed") {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    const updateData: any = {};

    if (status === "accepted") {
      updateData.status = "accepted";

      // ✅ TRIGGER PUSHER: Tell the Challenger to start the game
      await pusherServer.trigger(
        `user-${existingChallenge.challengerId}`,
        "match-accepted",
        {
          matchId: challengeId,
          acceptedBy: existingChallenge.receiverId,
        },
      );
    } else {
      updateData.status = "completed";
      updateData.result = { winnerId, finalScore };
    }

    const updatedChallenge = await Challenge.findByIdAndUpdate(
      challengeId,
      {
        $set: updateData,
        ...(updateData.status === "completed"
          ? { $unset: { challengerMoves: "", receiverMoves: "" } }
          : {}),
      },
      { new: true },
    );

    // Badge Logic
    if (updateData.status === "completed" && winnerId && winnerId !== "DRAW") {
      const isChallengerWinner =
        winnerId.toString() === updatedChallenge.challengerId.toString();
      const loserId = isChallengerWinner
        ? updatedChallenge.receiverId
        : updatedChallenge.challengerId;

      await Promise.all([
        User.findByIdAndUpdate(winnerId, {
          $set: { statusBadge: "Horse" },
          $inc: { cheetahCount: 1 },
        }),
        User.findByIdAndUpdate(loserId, { $set: { statusBadge: "DONKEY" } }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
