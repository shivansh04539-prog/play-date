import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST() {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ ok: false });

    // Decode token to find ID (no db call needed for verification to save speed)
    const decoded = jwt.decode(token) as any;
    if (!decoded?.userId) return NextResponse.json({ ok: false });

    await dbConnect();

    // Just update the timestamp. Extremely fast.
    await User.findByIdAndUpdate(decoded.userId, { lastActive: new Date() });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false });
  }
}
