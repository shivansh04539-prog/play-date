import { dbConnect } from "@/lib/db";
import SocialAction from "@/models/SocialAction";
import { NextResponse } from "next/server";

// api/social/my-likes/route.ts
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ likedIds: [], count: 0 });

    const likes = await SocialAction.find({
      senderId: userId,
      type: "LIKE",
    }).select("receiverId");

    const likedIds = likes.map((l) => l.receiverId);

    return NextResponse.json({
      likedIds,
      count: likedIds.length, // Return the count here
    });
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
