"use client";
import { useEffect, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Crown, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/(Challenge)/StatusBadge";

function ResultContent() {
  const searchParams = useSearchParams();
  const params = useParams();

  const slug = params?.slug || "player";
  const status = searchParams.get("status");
  const winCount = searchParams.get("wins") || "0";
  const lossCount = searchParams.get("losses") || "0";

  const isWin = status === "win";

  useEffect(() => {
    const playDonkeySound = () => {
      if (!isWin) {
        const audio = new Audio("/donkey-mock.mp3");
        audio.volume = 0.7;
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise.catch(() => {
            const playOnInteraction = () => {
              audio.play();
              window.removeEventListener("click", playOnInteraction);
            };
            window.addEventListener("click", playOnInteraction);
          });
        }
      }
    };

    const timer = setTimeout(playDonkeySound, 300);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", () => {});
    };
  }, [isWin]);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden transition-colors duration-700 ${isWin ? "bg-[#0A0F0D]" : "bg-[#0F0A0A]"}`}
    >
      {/* 1. FINAL SCORE - Now clearly visible at the top */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-10 text-white/40 font-black tracking-[0.2em] text-sm border-b border-white/5 pb-2"
      >
        FINAL SCORE: <span className="text-white">{winCount}</span> -{" "}
        <span className="text-white">{lossCount}</span>
      </motion.div>

      <div className="flex items-center gap-6 mb-12">
        {/* PLAYER SECTION */}
        <div className="flex flex-col items-center gap-3">
          <div
            className={`relative p-1 rounded-2xl ${
              isWin
                ? "bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                : "bg-slate-800"
            }`}
          >
            <img
              src="/downloade.png"
              className="w-20 h-20 rounded-xl object-cover"
              alt="You"
            />

            {/* PLAYER BADGE - Positioned Top-Left */}
            <div className="absolute -top-8 -left-8">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                {isWin && (
                  <Crown className="absolute -top-4 left-1/2 -translate-x-1/2 text-yellow-500 w-6 h-6 fill-yellow-500 z-10 drop-shadow-md" />
                )}
                <StatusBadge status={isWin ? "HORSE" : "DONKEY"} size="sm" />
              </motion.div>
            </div>
          </div>
          <span
            className={`text-xs font-bold tracking-widest ${isWin ? "text-emerald-400" : "text-slate-500"}`}
          >
            {isWin ? "HORSE" : "DONKEY"}
          </span>
        </div>

        <div className="text-white/10 font-black italic text-xl px-2">VS</div>

        {/* OPPONENT SECTION */}
        <div className="flex flex-col items-center gap-3">
          <div
            className={`relative p-1 rounded-2xl ${
              !isWin
                ? "bg-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.4)]"
                : "bg-slate-800"
            }`}
          >
            <img
              src="/downloadm.png"
              className="w-20 h-20 rounded-xl object-cover"
              alt="Opponent"
            />

            {/* OPPONENT BADGE - Positioned Top-Right */}
            <div className="absolute -top-8 -right-8">
              <motion.div
                initial={{ scale: 0, rotate: 20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                {!isWin && (
                  <Crown className="absolute -top-4 left-1/2 -translate-x-1/2 text-yellow-500 w-6 h-6 fill-yellow-500 z-10 drop-shadow-md" />
                )}
                <StatusBadge status={!isWin ? "HORSE" : "DONKEY"} size="sm" />
              </motion.div>
            </div>
          </div>
          <span
            className={`text-xs font-bold tracking-widest ${!isWin ? "text-pink-500" : "text-slate-500"}`}
          >
            {!isWin ? "HORSE" : "DONKEY"}
          </span>
        </div>
      </div>

      {/* Result Text */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-12"
      >
        <h1
          className={`text-6xl font-black mb-2 tracking-tighter ${
            isWin ? "text-emerald-400" : "text-pink-500"
          }`}
        >
          {isWin ? "VICTORY!" : "DEFEATED!"}
        </h1>
        <p className="text-white/40 font-medium tracking-widest uppercase text-[10px]">
          {isWin
            ? "You crushed the competition"
            : `${slug} is laughing at you!`}
        </p>
      </motion.div>

      {/* Buttons */}
      <div className="flex flex-col w-full max-w-xs gap-4 z-20">
        <Link href={`/play`} className="w-full">
          <button className="w-full bg-emerald-500 text-black h-16 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-transform">
            <RotateCcw size={20} /> REMATCH
          </button>
        </Link>
        <Link href="/" className="w-full">
          <button className="w-full bg-white/5 text-white h-16 rounded-2xl font-bold flex items-center justify-center gap-3 border border-white/10">
            <Home size={20} /> QUIT GAME
          </button>
        </Link>
      </div>

      {!isWin && (
        <motion.div
          animate={{ x: [-1, 1, -1] }}
          transition={{ repeat: Infinity, duration: 0.1 }}
          className="mt-10 text-pink-500 font-bold italic text-sm opacity-80"
        >
          Dhahu Dhahu! 🔊
        </motion.div>
      )}
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center text-white">
          Loading Results...
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
