"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Heart, Swords, Flame } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useSocket } from "@/context/SocketContext";

// --- HELPERS ---
const formatTime = (date: any) => {
  if (!date) return "now";
  const now = new Date().getTime();
  const past = new Date(date).getTime();
  const diff = Math.floor((now - past) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// --- COMPONENTS ---

// New LikeCard Component
export function LikeCard({ lk }: { lk: any }) {
  return (
    <div className="bg-white p-4 rounded-[24px] border border-slate-100 flex items-center justify-between shadow-sm border-l-4 border-l-pink-500">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 border border-pink-100">
          <Heart size={18} fill="currentColor" />
        </div>
        <div>
          <p className="font-black text-slate-800 text-sm">
            {lk.senderId?.name || "Someone"} liked you
          </p>
          <p className="text-[10px] text-pink-600 font-black uppercase italic tracking-tighter">
            Wants to challenge you!
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[9px] font-bold text-slate-300 uppercase">
          {formatTime(lk.createdAt)}
        </span>
      </div>
    </div>
  );
}
export function ChallengeCard({
  ch,
  onAccept,
}: {
  ch: any;
  onAccept: (id: string) => void;
}) {
  const router = useRouter();
  const isLive = ch.mode === "live";
  const documentId = ch._id || ch.id;

  // --- AUTO-REMOVE LOGIC (30 SECONDS) ---
  useEffect(() => {
    if (!isLive) return;

    const createdAt = new Date(ch.createdAt).getTime();
    const expiryTime = createdAt + 30000; // 30 seconds
    const remaining = expiryTime - Date.now();

    if (remaining <= 0) {
      onAccept(documentId); // Remove if already expired
      return;
    }

    // Set a timer to remove it exactly when it hits 30s
    const timer = setTimeout(() => {
      console.log("⏲️ [AUTO-REMOVE] Live match expired after 30s");
      onAccept(documentId);
    }, remaining);

    return () => clearTimeout(timer);
  }, [isLive, ch.createdAt, documentId, onAccept]);

  const handleAccept = () => {
    const challengerId = ch.challengerId?._id || ch.challengerId;

    onAccept(documentId);

    if (isLive) {
      router.push(`/play/live/${documentId}`);

      // Fire and forget update
      fetch("/api/challenge", {
        method: "PATCH",
        body: JSON.stringify({ challengeId: documentId, status: "accepted" }),
      }).catch((err) => console.error("Failed to sync acceptance", err));
    } else {
      router.push(`/play/activeChallenge/${challengerId}?id=${documentId}`);
    }
  };

  return (
    <div
      className={`p-4 rounded-[24px] border flex items-center justify-between shadow-sm transition-all duration-500 ${
        isLive
          ? "bg-red-50 border-red-500 animate-pulse scale-[1.02]"
          : "bg-white border-slate-100"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
            isLive
              ? "bg-red-100 text-red-500 border-red-200"
              : "bg-orange-50 text-orange-500 border-orange-100"
          }`}
        >
          {isLive ? <Swords size={18} /> : <Flame size={18} />}
        </div>
        <div>
          <p className="font-black text-slate-800 text-sm">
            {ch.challengerId?.name || "Someone"}{" "}
            {isLive ? "is INVITING YOU" : "challenged you"}
          </p>
          <p
            className={`text-[10px] font-black uppercase italic ${
              isLive ? "text-red-600" : "text-orange-600"
            }`}
          >
            {isLive
              ? "LIVE MATCH • JOIN NOW"
              : ch.task || "Rock Paper Scissors"}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-[9px] font-bold text-slate-300 uppercase">
          {formatTime(ch.createdAt)}
        </span>
        <button
          onClick={handleAccept}
          className={`${
            isLive ? "bg-red-600 shadow-red-200" : "bg-slate-900 shadow-md"
          } text-white text-[9px] font-black px-3 py-1.5 rounded-lg active:scale-95`}
        >
          {isLive ? "JOIN LIVE" : "ACCEPT"}
        </button>
      </div>
    </div>
  );
}

export default function ActivityTab() {
  const [realChallenges, setRealChallenges] = useState<any[]>([]);
  const [realLikes, setRealLikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const { pusher } = useSocket();

  const fetchActivity = useCallback(async () => {
    if (!user?._id) return;
    try {
      const [resPending, resLikes] = await Promise.all([
        fetch(
          `/api/challenge?userId=${user._id}&status=pending&t=${Date.now()}`,
        ),
        fetch(`/api/received?userId=${user._id}&t=${Date.now()}`),
      ]);

      const pendingData = await resPending.json();
      const likesData = await resLikes.json();

      if (Array.isArray(pendingData)) {
        // Double check: Filter out any challenge where I am the challenger
        const onlyIncoming = pendingData.filter(
          (ch) => (ch.challengerId?._id || ch.challengerId) !== user._id,
        );
        setRealChallenges(onlyIncoming);
      }

      if (Array.isArray(likesData)) setRealLikes(likesData);
    } catch (err) {
      console.error("Full Error Details:", err);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    // Initial load when the page first opens
    console.log("🔄 [INIT] Fetching initial activity...");
    fetchActivity();

    // 1. Pusher Listener (Instant Speed)
    if (user?._id && pusher) {
      const channelName = `user-${user._id}`;
      const channel = pusher.subscribe(channelName);

      console.log(
        `📡 [PUSHER] Subscribed to ${channelName}. Listening for events...`,
      );

      channel.bind("new-challenge", () => {
        console.log(
          "⚡ [SPEED BOOST] New challenge received via Pusher! Updating UI...",
        );
        fetchActivity();
      });

      return () => {
        console.log("🛑 [PUSHER] Unsubscribing from channel...");
        pusher.unsubscribe(channelName);
      };
    }

    // 2. Smart Polling (The Safety Net)
    const interval = setInterval(() => {
      const isPusherBroken = !pusher || pusher.connection.state !== "connected";
      const isVisible = document.visibilityState === "visible";

      if (isVisible) {
        if (isPusherBroken) {
          console.warn(
            "⚠️ [BACKUP] Pusher is disconnected. Running Polling fetch...",
          );
          fetchActivity();
        } else {
          // This log helps you see that Polling is "sleeping" and not wasting resources
          console.log(
            "😴 [POLLING] Pusher is healthy. Polling skipped to save speed.",
          );
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchActivity, user?._id, pusher]);

  const handleFastRemove = (id: string) => {
    setRealChallenges((prev) =>
      prev.filter((item) => (item._id || item.id) !== id),
    );
  };

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse text-slate-300 font-black italic">
        FETCHING...
      </div>
    );

  return (
    <div className="space-y-8">
      {/* LIKES SECTION */}
      {realLikes.length > 0 && (
        <div>
          <h3 className="text-[10px] font-black text-slate-400 flex items-center gap-2 tracking-[0.2em] uppercase mb-4">
            <Heart size={12} className="text-pink-500" fill="currentColor" />{" "}
            New Likes
          </h3>
          <div className="space-y-3">
            {realLikes.map((lk: any) => (
              <LikeCard key={lk._id} lk={lk} />
            ))}
          </div>
        </div>
      )}

      {/* CHALLENGES SECTION */}
      <div>
        <h3 className="text-[10px] font-black text-slate-400 flex items-center gap-2 tracking-[0.2em] uppercase mb-4">
          <Swords size={12} className="text-orange-500" /> Pending Challenges
        </h3>
        <div className="space-y-3">
          {realChallenges.length === 0 && realLikes.length === 0 ? (
            <p className="text-xs text-slate-300 italic font-bold p-4">
              No new activity
            </p>
          ) : (
            realChallenges.map((ch: any) => (
              <ChallengeCard key={ch._id} ch={ch} onAccept={handleFastRemove} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
