import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import Notification from "@/models/Notification";
import SocialAction from "@/models/SocialAction";
import User from "@/models/User";
// Import the file directly to ensure Mongoose registers the schema
import Challenge from "@/models/challengeSchema";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await dbConnect();

  try {
    // 🔥 This line is the magic fix. It ensures the model is "awake"
    const ChallengeModel =
      mongoose.models.Challenge || mongoose.model("Challenge");

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ challenges: [], likes: [] });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Run parallel queries for maximum speed
    const [rawChallenges, rawLikes] = await Promise.all([
      Notification.find({
        userId: userObjectId,
        type: "CHALLENGE",
        seen: false,
      })
        .populate("senderId", "name photo")
        .populate("challengeId") // Now Mongoose knows exactly what this is!
        .sort({ createdAt: -1 })
        .lean(),

      SocialAction.find({
        receiverId: userId,
        type: "LIKE",
      })
        .populate("senderId", "name photo")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const validChallenges = rawChallenges.filter(
      (n: any) => n.challengeId != null && n.senderId != null,
    );

    const formattedLikes = rawLikes.map((l: any) => ({
      id: l._id.toString(),
      name: l.senderId?.name || "Unknown User",
      photo: l.senderId?.photo || null,
      msg: "Liked your profile!",
      time: l.createdAt,
      isDummy: false,
    }));

    return NextResponse.json({
      challenges: validChallenges,
      likes: formattedLikes,
    });
  } catch (error: any) {
    console.error("Fast API Error:", error.message);
    return NextResponse.json({ challenges: [], likes: [] });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    if (body.notificationId) {
      await Notification.findByIdAndDelete(body.notificationId);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
