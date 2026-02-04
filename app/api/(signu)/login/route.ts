import { NextResponse } from "next/server";
import User from "@/models/User";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/db";
import { adminAuth } from "@/lib/firebase/firebaseAdmin";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await dbConnect();

    // 1. Get the Firebase Token from the client
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token missing" }, { status: 400 });
    }

    // 2. Verify Firebase Token using Admin SDK
    // This proves the user is who they say they are
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (err) {
      console.error("🔴 Token verification failed:", err);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const firebaseUid = decodedToken.uid;

    // 3. Find the user in YOUR MongoDB
    const user = await User.findOne({ firebaseUid });

    if (!user) {
      // If valid in Firebase but not in Mongo, they need to Sign Up first
      return NextResponse.json(
        { error: "User not found. Please sign up first." },
        { status: 404 },
      );
    }

    // 4. Create the Session Token (Same logic as Signup)
    const appToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" },
    );

    // 5. Set the Cookie (Same settings as Signup)
    const cookieStore = await cookies();
    cookieStore.set("token", appToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 Days
      path: "/",
    });

    return NextResponse.json(
      { success: true, userId: user._id },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("🔴 Login API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
