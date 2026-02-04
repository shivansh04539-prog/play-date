"use client";
import { Mic } from "lucide-react";

interface OpponentProps {
  name: string;
  avatar: string;
  micStatus: "idle" | "speaking";
}

export default function OpponentProfile({
  name,
  avatar,
  micStatus,
}: OpponentProps) {
  const isSpeaking = micStatus === "speaking";

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-3 rounded-[24px] transition-all duration-500 w-[110px] border 
      ${
        isSpeaking
          ? "bg-white/90 border-white shadow-xl scale-105 z-20"
          : "bg-white/10 border-white/5 opacity-50 scale-90"
      }`}
    >
      {/* Aura Effect for Sarah when she is "thinking" */}
      {isSpeaking && (
        <div className="absolute inset-0 bg-pink-400/20 blur-2xl rounded-full animate-pulse" />
      )}

      <div className="relative mb-2 z-10">
        <img
          src={avatar}
          className={`w-12 h-12 rounded-full object-cover border-2 shadow-md transition-colors ${
            isSpeaking ? "border-pink-500" : "border-white"
          }`}
          alt={name}
        />

        {/* Mic Indicator Icon */}
        <div
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm border border-white transition-colors ${
            isSpeaking ? "bg-pink-500" : "bg-slate-600"
          }`}
        >
          <Mic size={10} className="text-white" />
        </div>

        {isSpeaking && (
          <div className="absolute inset-0 border-2 border-pink-400 rounded-full animate-ping opacity-30" />
        )}
      </div>

      <span
        className={`text-[8px] font-bold uppercase tracking-tighter ${
          isSpeaking ? "text-pink-600" : "text-white/40"
        }`}
      >
        {isSpeaking ? "Thinking..." : "Waiting"}
      </span>
      <span
        className={`font-bold text-xs truncate w-full text-center ${
          isSpeaking ? "text-slate-900" : "text-white/60"
        }`}
      >
        {name}
      </span>
    </div>
  );
}
