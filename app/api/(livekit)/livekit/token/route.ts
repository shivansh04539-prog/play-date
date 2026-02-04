import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

const tokenCache = new Map<string, { token: string; exp: number }>();
const CACHE_DURATION = 8 * 60 * 1000; // 8 minutes

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room");
  const identity = req.nextUrl.searchParams.get("identity");

  if (!room || !identity) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Validate inputs - SIMPLIFY THIS
  const sanitizedRoom = room;
  const sanitizedIdentity = identity;

  // Check cache first
  const cacheKey = `${sanitizedRoom}-${sanitizedIdentity}`;
  const cached = tokenCache.get(cacheKey);

  if (cached && cached.exp > Date.now()) {
    console.log("🚀 [LiveKit] Token cache hit for:", sanitizedIdentity);
    return NextResponse.json({ token: cached.token });
  }

  try {
    // Validate environment variables
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
      console.error("❌ LiveKit credentials not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: sanitizedIdentity,
        ttl: "10m", // 10 minutes is enough
      },
    );

    // SIMPLIFY: Only add essential grants
    at.addGrant({
      roomJoin: true,
      room: sanitizedRoom,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    // Cache the token
    tokenCache.set(cacheKey, {
      token,
      exp: Date.now() + CACHE_DURATION,
    });

    console.log("✅ [LiveKit] New token generated for:", sanitizedIdentity);
    return NextResponse.json({ token });
  } catch (error: any) {
    console.error("❌ [LiveKit] Token generation failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate token" },
      { status: 500 },
    );
  }
}
