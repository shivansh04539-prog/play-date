import { NextResponse } from "next/server";
import User from "@/models/User";
import { dbConnect } from "@/lib/db";

export async function GET() {
  try {
    await dbConnect();

    // Threshold: 4 minutes ago (3 min heartbeat + 1 min buffer)
    const threshold = new Date(Date.now() - 4 * 60 * 1000);

    const users = await User.find({
      lastActive: { $gte: threshold },
    })
      .select("name photo district city isVerified") // only send what is needed for speed
      .limit(20)
      .lean();

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ users: [] }, { status: 500 });
  }
}
