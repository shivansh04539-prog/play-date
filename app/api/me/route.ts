import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { dbConnect } from "@/lib/db";

export async function GET() {
  const start = Date.now();
  console.log("🔍 API/ME: Request received");

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      console.log("ℹ️ API/ME: No token found");
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // 1. Verify JWT
    console.time("⏱️ JWT_Verify");
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.timeEnd("⏱️ JWT_Verify");

    // 2. Connect and Update
    await dbConnect();
    console.time("⏱️ DB_Update_Active");

    // We use findByIdAndUpdate to both GET the user and SET their online status in 1 trip
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { lastActive: new Date() },
      { new: true, runValidators: false }
    )
      .select("-password")
      .lean(); // .lean() makes the response much faster

    console.timeEnd("⏱️ DB_Update_Active");

    if (!user) {
      console.log("❌ API/ME: User not found");
      return NextResponse.json({ user: null }, { status: 200 });
    }

    console.log(`✅ API/ME: Success (${Date.now() - start}ms)`);
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error("❌ API/ME: Auth Error", error.message);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
