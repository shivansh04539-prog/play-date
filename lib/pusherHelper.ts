import { pusherServer } from "./pusherServer";

/**
 * Check if a user is currently online by checking Pusher presence channel
 * @param userId - The user ID to check
 * @returns Promise<boolean> - true if user is online, false otherwise
 */
export async function isUserOnline(userId: string): Promise<boolean> {
  try {
    // Get the presence channel info
    const response = await pusherServer.get({
      path: "/channels/presence-online/users",
    });

    if (response.status !== 200) {
      console.warn("⚠️ [Pusher Check] Failed to get presence data");
      return false;
    }

    const data = await response.json();
    const users = data.users || [];

    // Check if userId exists in the presence channel
    const isOnline = users.some((user: any) => user.id === String(userId));

    console.log(
      `🔍 [Online Check] User ${userId} is ${isOnline ? "ONLINE" : "OFFLINE"}`,
    );

    return isOnline;
  } catch (error: any) {
    console.error("❌ [Online Check] Error:", error.message);
    // If we can't check, assume offline to be safe (will save to DB)
    return false;
  }
}
