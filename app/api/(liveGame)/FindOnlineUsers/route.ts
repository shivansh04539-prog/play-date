import { NextResponse } from "next/server";
import User from "@/models/User";
import { dbConnect } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    let currentUserId = null;

    // Try to get user from JWT to filter them out of the list
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        currentUserId = decoded.userId;
      } catch (e) {
        // Token invalid, treat as guest
      }
    }

    await dbConnect();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Build Query
    const query: any = { lastActive: { $gte: fiveMinutesAgo } };
    if (currentUserId) {
      query._id = { $ne: currentUserId }; // Don't find myself
    }

    const onlineUsers = await User.find(query)
      .select("name photo _id")
      .sort({ lastActive: -1 })
      .limit(5)
      .lean();

    return NextResponse.json(onlineUsers, { status: 200 });
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
