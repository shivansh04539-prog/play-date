import { NextResponse } from "next/server";
import User from "@/models/User";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/db";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PUT(req: Request) {
  try {
    await dbConnect();

    // 1. Authenticate User via Cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    // 2. Parse Body
    const body = await req.json();
    const { name, age, bio, district, state, photo } = body;

    // 3. Handle Image Update (Only if a NEW base64 image is sent)
    let imageUrl = photo;
    if (photo && photo.startsWith("data:image")) {
      const uploadRes = await cloudinary.uploader.upload(photo, {
        folder: "dating_profiles",
      });
      imageUrl = uploadRes.secure_url;
    }

    // 4. Update the User in Database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name,
          age,
          bio,
          district,
          state,
          photo: imageUrl,
        },
      },
      { new: true }, // Returns the updated document
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
