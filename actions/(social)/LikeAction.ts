"use server"

import { dbConnect } from "@/lib/db"
import { pusherServer } from "@/lib/pusherServer";
import SocialAction from "@/models/SocialAction";
import User from "@/models/User";

// Sending like and notification

export async function toggleLikeAction(senderId: string, receiverId: string) {
  try {
    await dbConnect();

    if (!senderId || !receiverId) {
      return { error: "Missing IDs" };
    }

    const existingLike = await SocialAction.findOne({
      senderId,
      receiverId,
      type: "LIKE",
    });

    // ❌ UNLIKE
    if (existingLike) {
      await SocialAction.deleteOne({ _id: existingLike._id });
      return { isLiked: false };
    }

    // ✅ LIKE
    await SocialAction.create({
      senderId,
      receiverId,
      type: "LIKE",
    });

    // 🔔 Notification
    try {
      const sender = await User.findById(senderId).select("name").lean();

      await pusherServer.trigger(`user-${receiverId}`, "new-like", {
        senderName: sender?.name || "Someone",
        senderId,
      });
    } catch (pusherErr) {
      console.error("⚠️ Pusher Failed:", pusherErr);
    }

    return { isLiked: true };
  } catch (error) {
    console.error("❌ [LIKE ACTION ERROR]:", error);
    return { error: "Database error" };
  }
}