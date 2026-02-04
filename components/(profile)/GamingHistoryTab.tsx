"use client";
import { Gamepad2 } from "lucide-react";
import React, { useEffect, useState } from "react";

export function HistoryItem({ game, isLast, currentUserId }: any) {
  const myId = currentUserId.toString();
  const challengerId = (
    game.challengerId?._id || game.challengerId
  )?.toString();

  const winnerId = game.result?.winnerId?.toString();
  const isWinner = winnerId === myId;
  const isDraw = game.result?.winnerId === "DRAW";
  const resultText = isDraw ? "DRAW" : isWinner ? "WON" : "LOST";

  const opponent = challengerId === myId ? game.receiverId : game.challengerId;
  const oppName = opponent?.name || "Deleted User";

  // Get first two letters for the "Photo" circle
  const initials = oppName.substring(0, 2).toUpperCase();

  const scores = game.result?.finalScore;
  const myScore =
    challengerId === myId ? (scores?.opponent ?? 0) : (scores?.player ?? 0);
  const oppScore =
    challengerId === myId ? (scores?.player ?? 0) : (scores?.opponent ?? 0);

  return (
    <div
      className={`p-4 flex items-center justify-between ${!isLast ? "border-b border-slate-50" : ""}`}
    >
      <div className="flex items-center gap-3">
        {/* LIGHTWEIGHT INITIALS CIRCLE (No Image Load) */}
        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-black text-white border border-slate-800 shadow-sm">
          {initials}
        </div>
        <div>
          <p className="font-black text-slate-800 text-sm leading-none">
            {oppName}
          </p>
          <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
            {game.task || "Match"} •{" "}
            {new Date(game.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[11px] font-black text-slate-500 tabular-nums">
          {myScore}—{oppScore}
        </span>
        <div
          className={`text-[9px] font-black px-2.5 py-1 rounded-lg ${
            resultText === "WON"
              ? "bg-emerald-100 text-emerald-700"
              : resultText === "DRAW"
                ? "bg-orange-100 text-orange-700"
                : "bg-pink-100 text-pink-700"
          }`}
        >
          {resultText}
        </div>
      </div>
    </div>
  );
}

export function GamingHistoryTab({ currentUserId }: { currentUserId: string }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Session Cache: Load instantly if user already clicked this tab
    const cached = sessionStorage.getItem(`hist_${currentUserId}`);
    if (cached) {
      setHistory(JSON.parse(cached));
      setLoading(false);
    }

    async function fetchHistory() {
      try {
        const res = await fetch(
          `/api/challenge?userId=${currentUserId}&status=completed&t=${Date.now()}`,
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setHistory(data);
          sessionStorage.setItem(`hist_${currentUserId}`, JSON.stringify(data));
        }
      } catch (e) {
        console.error("History fetch failed");
      } finally {
        setLoading(false);
      }
    }
    if (currentUserId) fetchHistory();
  }, [currentUserId]);

  if (loading && history.length === 0)
    return (
      <div className="p-10 text-center animate-pulse text-slate-300 font-bold italic text-xs">
        LOADING RECORDS...
      </div>
    );

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black text-slate-400 flex items-center gap-2 tracking-[0.2em] uppercase mb-2">
        <Gamepad2 size={12} className="text-blue-500" /> History
      </h3>
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        {history.map((game, idx) => (
          <HistoryItem
            key={game._id}
            game={game}
            currentUserId={currentUserId}
            isLast={idx === history.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
