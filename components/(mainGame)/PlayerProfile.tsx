"use client";
import { useAuth } from "@/context/AuthContext";

export default function PlayerProfile({ isMyTurn }: { isMyTurn: boolean }) {
  const { user } = useAuth();
  const name = user?.name || "You";
  const photo = user?.photo || "/downloade.png";

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-3 rounded-[24px] transition-all duration-500 w-[110px] border 
      ${
        isMyTurn
          ? "bg-white/90 border-white shadow-xl scale-105 z-20"
          : "bg-white/10 border-white/5 opacity-50 scale-90"
      }`}
    >
      {/* Aura Effect */}
      {isMyTurn && (
        <div className="absolute inset-0 bg-indigo-400/20 blur-2xl rounded-full animate-pulse" />
      )}

      <div className="relative mb-2 z-10">
        <img
          src={photo}
          className={`w-12 h-12 rounded-full object-cover border-2 shadow-md transition-colors ${
            isMyTurn ? "border-indigo-500" : "border-white"
          }`}
          alt={name}
        />

        {/* Level/Status Badge - Matching Opponent Badge Size */}
        <div
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm border border-white transition-colors ${
            isMyTurn ? "bg-indigo-500" : "bg-slate-600"
          }`}
        >
          <span className="text-white text-[8px] font-bold">LV1</span>
        </div>

        {isMyTurn && (
          <div className="absolute inset-0 border-2 border-indigo-400 rounded-full animate-ping opacity-30" />
        )}
      </div>

      <span
        className={`text-[8px] font-bold uppercase tracking-tighter ${
          isMyTurn ? "text-indigo-600" : "text-white/40"
        }`}
      >
        {isMyTurn ? "Your Turn" : "Waiting"}
      </span>
      <span
        className={`font-bold text-xs truncate w-full text-center ${
          isMyTurn ? "text-slate-900" : "text-white/60"
        }`}
      >
        {name}
      </span>
    </div>
  );
}
