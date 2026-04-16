"use server"

import { dbConnect } from "@/lib/db"
import SocialAction from "@/models/SocialAction";


// Sending views

export async function logViewAction(senderId: string, receiverId: string) {
  try {
    await dbConnect();

    if (!senderId || !receiverId) return;

    // ❗ prevent self view
    if (senderId === receiverId) return;

    await SocialAction.findOneAndUpdate(
      {
        senderId,
        receiverId,
        type: "VIEW",
      },
      {
        createdAt: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    );

    return { success: true };
  } catch (error) {
    console.error("❌ [VIEW ACTION ERROR]:", error);
    return { success: false };
  }
}