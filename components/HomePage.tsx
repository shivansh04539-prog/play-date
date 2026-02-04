"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Swords, ShieldCheck, Timer } from "lucide-react";
import { toast } from "sonner";
import StickyNote from "./StickyNote";
import GuestPopup from "./GuestPopup";
import { useSocket } from "@/context/SocketContext";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  // const [recentOpponent, setRecentOpponent] = useState<any>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [showGuestPopup, setShowGuestPopup] = useState(false);

  const { getChannel, isConnected, pusher, onlineCount, recentOpponent } =
    useSocket();
  // const [onlineCount, setOnlineCount] = useState(0);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const checkStatusRef = useRef<NodeJS.Timeout | null>(null);
  const currentChannelRef = useRef<any>(null);
  const isRedirecting = useRef(false);
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/social/heartbeat", { method: "POST" });
  }, [user]);

  // useEffect(() => {
  //   if (loading || !user || !pusher || subscribedRef.current) return;

  //   console.log("📡 [FRONTEND] Subscribing to presence-online...");
  //   const channel = pusher.subscribe("presence-online");
  //   subscribedRef.current = true;

  //   channel.bind("pusher:subscription_succeeded", (members: any) => {
  //     console.log(
  //       `✅ [FRONTEND] Presence sync. Online count: ${members.count}`,
  //     );
  //     setOnlineCount(members.count);
  //     let found = null;
  //     members.each((member: any) => {
  //       if (member.id !== String(user._id))
  //         found = { id: member.id, ...member.info };
  //     });
  //     if (found) setRecentOpponent(found);
  //   });

  //   channel.bind("pusher:member_added", (member: any) => {
  //     setOnlineCount((prev) => prev + 1);
  //     setRecentOpponent((prev: any) => prev || member.info);
  //     toast.info(`${member.info.name} came online!`);
  //   });

  //   channel.bind("pusher:member_removed", (member: any) => {
  //     setOnlineCount((prev) => Math.max(0, prev - 1));
  //     setRecentOpponent((prev: any) => (prev?.id === member.id ? null : prev));
  //   });
  // }, [user?._id, pusher, loading]);

  const stopMatchingLogic = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (checkStatusRef.current) clearInterval(checkStatusRef.current);

    // Use pusher from useSocket() directly
    if (currentChannelRef.current && pusher) {
      try {
        currentChannelRef.current.channel.unbind_all();
        pusher.unsubscribe(currentChannelRef.current.name);
      } catch (err) {
        console.warn("Cleanup error:", err);
      }
      currentChannelRef.current = null;
    }
  };

  const handleMatchAccepted = (matchId: string) => {
    if (isRedirecting.current) return;
    isRedirecting.current = true;
    console.log(`🎊 [FRONTEND] Match ${matchId} was accepted! Redirecting...`);
    stopMatchingLogic();
    toast.success("Match Accepted! Entering arena...");
    router.replace(`/play/live/${matchId}`);
  };

  const startLiveMatch = async () => {
    if (!user) {
      setShowGuestPopup(true);
      setTimeout(() => router.push("/play"), 3000);
      return;
    }

    console.log("⚡ [FRONTEND] User clicked Match Live. Calling API...");
    setIsMatching(true);
    setCountdown(30);

    try {
      const res = await fetch("/api/match/create", { method: "POST" });
      const data = await res.json();

      // CHANGE STARTS HERE: If no one is online/available, redirect to /play immediately
      if (!res.ok || !data.matchId) {
        console.log("⚠️ [FRONTEND] No one online. Redirecting to Bot...");
        setIsMatching(false);
        toast.info("No one online. Playing with Bot.");
        router.push("/play"); // Immediate redirect
        return;
      }
      // CHANGE ENDS HERE

      console.log(
        `🔗 [FRONTEND] Match created: ${data.matchId}. Listening for acceptance...`,
      );
      const matchId = data.matchId;
      const myChannelName = `user-${user._id}`;
      const channel = getChannel(myChannelName);

      if (!channel) {
        toast.error("Connection not ready. Try again.");
        setIsMatching(false);
        return;
      }
      currentChannelRef.current = { channel, name: myChannelName };

      channel.bind("match-accepted", (payload: any) => {
        if (payload.matchId === matchId) {
          handleMatchAccepted(matchId);
        }
      });

      if (!isConnected) {
        checkStatusRef.current = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/challenge?id=${matchId}`);
            const matchData = await statusRes.json();
            if (matchData.status === "accepted") {
              handleMatchAccepted(matchId);
            }
          } catch {}
        }, 5000);
      }

      const startTime = Date.now();
      countdownTimerRef.current = setInterval(() => {
        const secondsPassed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = 30 - secondsPassed;
        setCountdown(remaining > 0 ? remaining : 0);

        if (secondsPassed >= 30) {
          stopMatchingLogic();
          setIsMatching(false);
          toast.info("No one joined. Playing with Bot.");
          router.push("/play");
        }
      }, 1000);

      toast.success("Challenge sent! Waiting for her...");
    } catch (err) {
      console.error("❌ [FRONTEND] Error starting match:", err);
      setIsMatching(false);
      // Fallback redirect if API fails entirely
      router.push("/play");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(253,242,248)]">
        <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-[rgb(253,242,248)] px-4 py-10 md:py-20 font-sans">
      <div className="absolute top-6 right-6 z-50 flex items-center gap-1 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full border border-pink-100 shadow-sm">
        <span className="text-sm font-bold text-gray-700">1,000</span>
        <span className="text-base" role="img" aria-label="gold coin">
          💰
        </span>
      </div>

      <GuestPopup isOpen={showGuestPopup} />

      <div className="max-w-4xl mx-auto text-center mb-14">
        <div className="flex justify-center gap-3 mb-6 animate-bounce">
          <span className="text-pink-500 text-3xl">👊</span>
          <span className="text-purple-400 text-3xl">✋</span>
          <span className="text-blue-500 text-3xl">✌️</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent leading-tight">
          Rock Paper Scissors <br /> A Fun Dating Experience
        </h1>

        <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto font-semibold">
          Why <span className="text-pink-500 font-bold">swipe</span> when you
          can play? <span className="text-pink-500 font-bold">Defeat</span> her
          in game and <span className="text-pink-500 font-bold">win</span> her
          in life 💖
        </p>
        <StickyNote text="Everything is private" />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
        <div className="flex justify-center">
          <div className="relative w-full max-w-[300px] aspect-[4/5] rounded-3xl overflow-hidden shadow-xl bg-white hover:scale-105 transition border-4 border-white">
            <Image
              src={user?.photo || "/downloade.png"}
              alt="User"
              sizes="(max-width: 768px) 100vw, 300px"
              fill
              className="object-cover"
              priority
            />
            {user && (
              <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-4 py-1 rounded-full text-white text-xs font-bold flex items-center gap-2">
                <ShieldCheck size={14} className="text-blue-300" />
                {user.name} (You)
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <div className="relative bg-white p-7 rounded-[42px] shadow-2xl border-8 border-white w-full max-w-[300px] flex flex-col items-center before:absolute before:inset-0 before:rounded-[42px] before:bg-gradient-to-r before:from-pink-500 before:to-blue-500 before:blur-xl before:opacity-30">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 z-10">
              {isMatching ? "Searching Arena..." : "Challenge Now"}
            </p>

            <h2 className="text-xl font-black text-gray-800 mb-6 text-center z-10 leading-tight">
              {isMatching ? "FINDING\nOPPONENT" : "ROCK\nPAPER\nSCISSORS"}
            </h2>

            <div className="relative h-24 w-full flex justify-center items-center mb-8 z-10">
              {isMatching ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <Swords
                      size={48}
                      className="text-pink-500 animate-spin-slow"
                    />
                    <div className="absolute inset-0 animate-ping bg-pink-500/20 rounded-full" />
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 font-bold text-sm">
                    <Timer size={14} /> <span>{countdown}s</span>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-5xl absolute -rotate-12 -translate-x-10 animate-pulse">
                    👊
                  </span>
                  <span className="text-6xl absolute z-10 animate-bounce">
                    ✋
                  </span>
                  <span className="text-5xl absolute rotate-12 translate-x-10 animate-pulse">
                    ✌️
                  </span>
                </>
              )}
            </div>

            <button
              onClick={startLiveMatch}
              disabled={isMatching}
              className={`w-full py-4 rounded-2xl text-white font-extrabold text-lg transition-all shadow-xl z-10 flex items-center justify-center gap-2 ${
                isMatching
                  ? "bg-slate-800 scale-95 opacity-80"
                  : "bg-gradient-to-r from-pink-500 to-blue-500 hover:scale-105 active:scale-95 shadow-pink-300"
              }`}
            >
              {isMatching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Matching...
                </>
              ) : (
                "▶ Match Live"
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="relative w-full max-w-[300px] aspect-[4/5] rounded-3xl overflow-hidden shadow-xl hover:scale-105 transition border-4 border-white bg-slate-200">
            <Image
              src={recentOpponent?.photo || "/downloadm.png"}
              alt="Opponent"
              sizes="(max-width: 768px) 100vw, 300px"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-4 right-4 bg-green-500 h-4 w-4 rounded-full border-2 border-white animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
            <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-4 py-1 rounded-full text-white text-xs font-bold">
              {recentOpponent ? recentOpponent.name : "Finding Online..."}
            </div>
            <div className="absolute top-4 left-4 bg-green-500/20 backdrop-blur-md px-3 py-1 rounded-full text-green-700 text-[10px] font-black uppercase tracking-tighter">
              Live
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
