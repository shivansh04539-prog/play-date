"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Swords } from "lucide-react";

export default function GlobalNotificationHandler() {
  const { user } = useAuth();
  const { pusher } = useSocket();
  const router = useRouter();
  const subscribedRef = useRef<string | null>(null);
  const shownChallenges = useRef<Set<string>>(new Set());

  // Ref to track if we have checked offline
  const hasCheckedOffline = useRef(false);

  // 1. Toast Handler (Visuals)
  const handleNewChallenge = async (
    data: any,
    source: string,
    notificationId?: string,
  ) => {
    const challengeId = data.challengeId?.toString() || data.challengeId;

    if (shownChallenges.current.has(challengeId)) {
      console.log(`🚫 [${source}] Duplicate prevented:`, challengeId);
      return;
    }

    shownChallenges.current.add(challengeId);
    console.log(`⚔️ [${source}] Displaying Toast for:`, data.senderName);

    const isLive = data.mode === "live";

    toast.custom(
      (t) => (
        <div
          onClick={async () => {
            toast.dismiss(t);
            if (notificationId) {
              try {
                await fetch("/api/notifications", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ notificationId }),
                });
              } catch (err) {
                console.error("❌ Failed to delete:", err);
              }
            }
            router.push("/profile");
          }}
          className={`p-4 rounded-[24px] shadow-2xl flex items-center gap-4 w-full max-w-sm border cursor-pointer hover:scale-[1.02] transition-all bg-slate-900 ${
            isLive
              ? "border-red-500 ring-2 ring-red-500/20"
              : "border-slate-700"
          }`}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br from-orange-400 to-pink-600">
            <Swords size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-0.5">
              {isLive ? "Live Match" : "New Challenge"}
            </h3>
            <p className="text-sm font-bold text-white">
              <span className="text-pink-400">{data.senderName}</span> wants to
              play!
            </p>
          </div>
        </div>
      ),
      { duration: 10000 },
    );
  };

  // 2. Main Logic
  useEffect(() => {
    // >>> DEBUG 1: Check if this effect even runs
    console.log(
      "➡️ [DEBUG 1] Effect Triggered. User:",
      user?._id,
      "Pusher:",
      !!pusher,
    );

    if (!user?._id || !pusher) {
      console.log("⏳ [DEBUG] Waiting for User or Pusher...");
      return;
    }

    if (subscribedRef.current === user._id) {
      console.log("✅ [DEBUG] Already subscribed, skipping.");
      return;
    }

    const channelName = `user-${user._id}`;
    const channel = pusher.subscribe(channelName);
    subscribedRef.current = user._id;

    channel.bind("new-challenge", (data: any) => {
      console.log("🔥 [PUSHER] Event Received:", data);
      handleNewChallenge(data, "PUSHER");
    });

    // >>> DEBUG 2: When subscription succeeds
    channel.bind("pusher:subscription_succeeded", () => {
      console.log("✅ [DEBUG 2] Pusher Subscription Succeeded!");

      console.log(
        "❓ [DEBUG 3] Checking 'hasCheckedOffline' status:",
        hasCheckedOffline.current,
      );

      if (!hasCheckedOffline.current) {
        console.log(
          "🚀 [DEBUG 4] Preparing to call checkOfflineNotifications...",
        );

        // Removed setTimeout for testing to ensure it runs immediately
        checkOfflineNotifications(user._id);
      } else {
        console.log("🛑 [DEBUG] Skipped offline check (Already done).");
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      subscribedRef.current = null;
      // Note: We do NOT reset hasCheckedOffline here to prevent double-fetch on re-renders
    };
  }, [user?._id, pusher]);

  // 3. The Offline Fetcher
  const checkOfflineNotifications = async (currentUserId: string) => {
    hasCheckedOffline.current = true;

    try {
      // Note: We don't strictly need ?userId= in the URL anymore because of cookies,
      // but keeping it doesn't hurt.
      const res = await fetch(
        `/api/notifications?userId=${currentUserId}&t=${Date.now()}`,
      );

      if (!res.ok) return;

      const data = await res.json();

      // 1. Handle Challenges (Game Invites)
      const challenges = data.challenges || [];
      if (challenges.length > 0) {
        for (const n of challenges) {
          await handleNewChallenge(
            {
              senderName: n.senderId?.name || "Player",
              challengeId: n.challengeId?._id || n.challengeId,
              mode: "recorded",
            },
            "DATABASE",
            n._id,
          );
        }
      }

      // 2. Handle Likes (New Feature!)
      const likes = data.likes || [];
      // We only want to show recent likes, or maybe store "seen" likes in local storage
      // so we don't spam them every refresh. For now, let's just log them.
      if (likes.length > 0) {
        console.log("❤️ [Offline Check] Found new likes:", likes.length);
        // You can add a toast.message here if you want:
        // toast.success(`You received ${likes.length} new likes while offline!`);
      }
    } catch (err) {
      console.error("❌ [DEBUG] Fetch Error:", err);
    }
  };

  return null;
}
