import { NextResponse } from "next/server";
import SocialAction from "@/models/SocialAction";
import { dbConnect } from "@/lib/db";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId"); // This is YOUR ID

    if (!userId) return NextResponse.json({ count: 0 });

    // Count records where YOU are the receiver
    const count = await SocialAction.countDocuments({
      receiverId: userId,
      type: "LIKE",
    });

    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
