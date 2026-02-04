import { NextResponse } from "next/server";
import User from "@/models/User";
import { v2 as cloudinary } from "cloudinary";
import { dbConnect } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    await dbConnect();

    // Auth Check
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const { voiceBase64 } = await req.json();

    if (!voiceBase64) {
      return NextResponse.json(
        { error: "No audio data provided" },
        { status: 400 },
      );
    }

    // 1. Upload to dedicated 'user_voices' folder
    const uploadRes = await cloudinary.uploader.upload(voiceBase64, {
      folder: "user_voices",
      resource_type: "video", // Cloudinary treats audio as video resource type
    });

    // 2. Update MongoDB for this specific user
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: { voiceIntro: uploadRes.secure_url } },
      { new: true },
    );

    return NextResponse.json({
      success: true,
      voiceUrl: uploadRes.secure_url,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Voice Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
