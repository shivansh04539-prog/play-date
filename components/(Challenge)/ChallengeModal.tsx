// components/ChallengeModal.tsx
import React from "react";
import Image from "next/image";

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string) => void;
  playerName: string;
}

export const ChallengeModal = ({
  isOpen,
  onClose,
  onConfirm,
  playerName,
}: ChallengeModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-[#0f172a] border border-white/10 p-8 rounded-[40px] w-full max-w-sm text-center shadow-2xl relative overflow-hidden">
        {/* Decorative Background Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-pink-500/10 blur-[80px]" />

        <h2 className="text-white font-black text-2xl mb-2 italic uppercase">
          Challenge {playerName}
        </h2>
        <p className="text-white/40 text-[10px] mb-8 uppercase tracking-[0.2em]">
          Winner gets the Horse, Loser gets the Donkey
        </p>

        <div className="flex justify-center items-center gap-6 mb-8">
          {/* Horse Preview */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-20 h-20 rounded-full border-2 border-orange-500 bg-white shadow-[0_0_20px_rgba(249,115,22,0.2)] overflow-hidden">
              <Image
                src="/horse.avif"
                alt="Horse"
                sizes="100px"
                fill
                className="object-contain p-2"
              />
            </div>
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
              Victory
            </span>
          </div>

          <div className="text-white/20 font-black italic text-xl">VS</div>

          {/* Donkey Preview */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-20 h-20 rounded-full border-2 border-slate-500 bg-white shadow-[0_0_20px_rgba(100,116,139,0.2)] overflow-hidden">
              <Image
                src="/donk.avif"
                alt="Donkey"
                fill
                className="object-contain p-2"
              />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Defeat
            </span>
          </div>
        </div>

        <button
          onClick={() => onConfirm("Horse vs Donkey")}
          className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg shadow-pink-500/20 uppercase tracking-widest"
        >
          Start Challenge
        </button>

        <button
          onClick={onClose}
          className="mt-6 text-white/30 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};
