import { NextResponse } from "next/server"   ;
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

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const body = await req.json();
    let updates: any = { ...body };

    // 1. Separate Audio Folder Logic
    if (body.voiceIntro?.startsWith("data:audio")) {
      const audioRes = await cloudinary.uploader.upload(body.voiceIntro, {
        resource_type: "video", // Required for audio files
        folder: "user_voice_introductions",
      });
      updates.voiceIntro = audioRes.secure_url;
    }

    // 2. Aadhaar / Verification Folder Logic
    if (body.aadhaarCard?.startsWith("data:image")) {
      const verifyRes = await cloudinary.uploader.upload(body.aadhaarCard, {
        folder: "user_aadhaar_docs",
      });
      updates.aadhaarCard = verifyRes.secure_url;
      updates.isVerified = true; // Automatically flag as verified for now
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: updates },
      { new: true }
    );

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
