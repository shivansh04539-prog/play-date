import { NextResponse } from "next/server";
import SocialAction from "@/models/SocialAction";
import User from "@/models/User"; // Assuming you have a User model for names
import { dbConnect } from "@/lib/db";
import { pusherServer } from "@/lib/pusherServer"; // Use the shared config

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { senderId, receiverId } = await req.json();

    if (!senderId || !receiverId) {
      return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
    }

    const existingLike = await SocialAction.findOne({
      senderId,
      receiverId,
      type: "LIKE",
    });

    if (existingLike) {
      await SocialAction.deleteOne({ _id: existingLike._id });
      return NextResponse.json({ isLiked: false, message: "Unliked" });
    }

    // --- CREATE NEW LIKE ---
    const newLike = await SocialAction.create({
      senderId,
      receiverId,
      type: "LIKE",
    });

    // --- TRIGGER NOTIFICATION ---
    // We fetch the sender's name so the toast says "Rahul liked you" instead of "Someone"
    const sender = await User.findById(senderId).select("name");

    try {
      await pusherServer.trigger(`user-${receiverId}`, "new-like", {
        senderName: sender?.name || "Someone",
        senderId: senderId,
      });
    } catch (pusherErr) {
      // We wrap this in a try/catch so even if Pusher fails,
      // the Database like still works and no error is shown to the user.
      console.error("Pusher Notification Failed:", pusherErr);
    }

    return NextResponse.json({ isLiked: true, message: "Liked" });
  } catch (error) {
    console.error("Like Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
