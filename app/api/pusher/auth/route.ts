// /api/pusher/auth/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { pusherServer } from "@/lib/pusherServer";
import User from "@/models/User";
import { dbConnect } from "@/lib/db";

// Cache user info for 30 seconds
const userCache = new Map<string, { data: any; timestamp: number }>();
const USER_CACHE_TTL = 30000;

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);
    const socketId = params.get("socket_id");
    const channel = params.get("channel_name");

    if (!socketId || !channel) {
      return new NextResponse("Missing params", { status: 400 });
    }

    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = String(decoded.userId || decoded.id || decoded._id);

    let authResponse;

    if (channel.startsWith("presence-") || channel.startsWith("voice-")) {
      // Check cache first
      let userData = userCache.get(userId);

      if (!userData || Date.now() - userData.timestamp > USER_CACHE_TTL) {
        await dbConnect();
        const user = await User.findById(userId).select("name photo").lean();

        if (!user) {
          return new NextResponse("User not found", { status: 404 });
        }

        userData = { data: user, timestamp: Date.now() };
        userCache.set(userId, userData);
      }

      if (channel.startsWith("presence-")) {
        authResponse = pusherServer.authorizeChannel(socketId, channel, {
          user_id: userId,
          user_info: {
            name: userData.data.name,
            photo: userData.data.photo,
          },
        });
      } else {
        authResponse = pusherServer.authorizeChannel(socketId, channel, {
          user_id: userId,
          user_info: { name: userData.data.name },
        });
      }
    } else {
      // Fast path - no DB needed
      authResponse = pusherServer.authorizeChannel(socketId, channel, {
        user_id: userId,
      });
    }

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("❌ PUSHER AUTH ERROR:", error);
    return new NextResponse("Forbidden", { status: 403 });
  }
}
