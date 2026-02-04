import { NextResponse } from "next/server";
import User from "@/models/User";
import { v2 as cloudinary } from "cloudinary";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/db";
import { adminAuth } from "@/lib/firebase/firebaseAdmin";
import jwt from "jsonwebtoken";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    console.log("🔵 API: Signup request received");
    await dbConnect();

    const body = await req.json();
    console.log("🔵 API Payload:", {
      ...body,
      photo: "Length: " + body.photo?.length,
    });

    const { name, email, firebaseUid, photo, token, age, state, phone } = body;

    // Verify Token
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      if (decodedToken.uid !== firebaseUid) {
        console.error("🔴 API Error: Token mismatch");
        return NextResponse.json(
          { error: "Unauthorized request" },
          { status: 401 },
        );
      }
    } catch (err) {
      console.error("🔴 API Error: Token verification failed", err);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 1. Check if user already exists
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      console.log("🔵 Creating new user in MongoDB...");
      let finalImageUrl = photo;

      // 2. Upload to Cloudinary (only if it's base64)
      if (photo && photo.startsWith("data:image")) {
        console.log("🔵 Uploading Base64 image to Cloudinary...");
        const uploadRes = await cloudinary.uploader.upload(photo, {
          folder: "dating_profiles",
          transformation: [{ width: 500, height: 500, crop: "limit" }],
        });
        finalImageUrl = uploadRes.secure_url;
      }

      // 3. Create User
      user = await User.create({
        name,
        email,
        firebaseUid,
        photo: finalImageUrl,
        // Handle Missing Age for Google Users
        age: age ? Number(age) : null,
        state: state || "",
        phone: phone || "",
      });
      console.log("✅ User created successfully:", user._id);
    } else {
      console.log("🟡 User already exists, logging in...");
    }

    // 4. Set Cookie
    const appToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" },
    );

    // 5. Set Cookie with YOUR JWT (not Firebase token)
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
      { status: 201 },
    );
  } catch (error: any) {
    console.error("🔴 Signup API Critical Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
