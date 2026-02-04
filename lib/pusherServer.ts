import Pusher from "pusher";

export const pusherServer = new Pusher({
  appId: (process.env.PUSHER_APP_ID || "").trim(),
  key: (process.env.NEXT_PUBLIC_PUSHER_KEY || "").trim(),
  secret: (process.env.PUSHER_SECRET || "").trim(),
  cluster: (process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "").trim(),
  useTLS: true,
});

export async function testPusherConnection() {
  try {
    await pusherServer.trigger("test-channel", "test-event", {
      message: "test",
    });
    console.log("✅ Pusher Server Connection: OK");
    return true;
  } catch (error: any) {
    console.error("❌ Pusher Server Connection Failed:", error.message);
    console.error("Full Error:", error);
    return false;
  }
}
