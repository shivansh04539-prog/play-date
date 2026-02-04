"use client";
import { useEffect, useState, useRef } from "react";

export default function ExVoiceHandler() {
  const [isMicActive, setIsMicActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // No microphone permission, no getUserMedia
    setIsMicActive(true);

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  if (!isMicActive) return null;

  return (
    <div className="fixed top-20 right-6 z-[100] pointer-events-none">
      <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/40 px-4 py-2 rounded-2xl backdrop-blur-xl">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </div>
        <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest leading-none">
          Mic Live (Solo)
        </span>
      </div>
    </div>
  );
}
