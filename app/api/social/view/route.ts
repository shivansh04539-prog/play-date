import { NextResponse } from "next/server";
import SocialAction from "@/models/SocialAction";
import { dbConnect } from "@/lib/db";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { senderId, receiverId } = await req.json();

    if (!senderId || !receiverId) {
      return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
    }

    // Do not log if the user is looking at their own profile
    if (senderId === receiverId) {
      return NextResponse.json({ message: "Self view not logged" });
    }

    // OPTIMIZATION: Use findOneAndUpdate with "upsert"
    // This prevents duplicate view entries for the same person.
    // It will either update the 'createdAt' timestamp of an old view
    // or create a new one if it's the first time.
    await SocialAction.findOneAndUpdate(
      {
        senderId,
        receiverId,
        type: "VIEW",
      },
      {
        createdAt: new Date(), // Refresh the view time
      },
      {
        upsert: true, // Create if doesn't exist
        new: true,
      },
    );

    return NextResponse.json({ success: true, message: "View logged" });
  } catch (error) {
    console.error("View Log Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
