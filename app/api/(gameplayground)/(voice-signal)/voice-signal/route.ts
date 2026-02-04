// // app/api/voice-signal/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import Pusher from "pusher";

// // Initialize Pusher with your credentials
// const pusher = new Pusher({
//   appId: process.env.PUSHER_APP_ID!,
//   key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
//   secret: process.env.PUSHER_SECRET!,
//   cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
//   useTLS: true,
// });

// export async function POST(req: NextRequest) {
//   try {
//     console.log("🔔 Voice signal API called");

//     const body = await req.json();
//     const { matchId, senderId, signal } = body;

//     console.log("📦 Received payload:", {
//       matchId,
//       senderId,
//       signalType: signal.sdp?.type || "candidate",
//     });

//     if (!matchId || !senderId || !signal) {
//       console.error("❌ Missing required fields:", {
//         matchId,
//         senderId,
//         signal: !!signal,
//       });
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 },
//       );
//     }

//     // CRITICAL: Broadcast to all clients on this match channel
//     console.log(`📡 Broadcasting to channel: match-${matchId}`);
//     console.log(`   Event: voice-signal`);
//     console.log(`   From sender: ${senderId}`);

//     const pusherResponse = await pusher.trigger(
//       `match-${matchId}`,
//       "voice-signal",
//       {
//         senderId,
//         signal,
//       },
//     );

//     console.log("✅ Pusher broadcast result:", pusherResponse);
//     console.log("========================================");

//     return NextResponse.json({
//       success: true,
//       pusherResponse,
//     });
//   } catch (error) {
//     console.error("❌ Voice signal API error:", error);
//     return NextResponse.json(
//       { error: "Internal server error", details: error.message },
//       { status: 500 },
//     );
//   }
// }
