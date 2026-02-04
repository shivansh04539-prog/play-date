// app/api/received/route.ts
import { NextResponse } from "next/server";
import SocialAction from "@/models/SocialAction";
import User from "@/models/User";
import { dbConnect } from "@/lib/db";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const userId = new URL(req.url).searchParams.get("userId");

    if (!userId) return NextResponse.json([]);

    const likes = await SocialAction.find({
      receiverId: userId,
      type: "LIKE",
    })
      .select("senderId createdAt") // Optimization: Only get the ID and time
      .populate("senderId", "name photo")
      .sort({ createdAt: -1 })
      .limit(10) // Polling 20 items every few seconds is heavy; 10 is enough.
      .lean();

    return NextResponse.json(likes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
