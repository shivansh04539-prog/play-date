"use client";
import { motion } from "framer-motion";
import { Lock, Zap } from "lucide-react";
import StickyNote from "../StickyNote";

const MOVES_DATA = [
  { id: "ROCK", icon: "/rock.svg", label: "Rock" },
  { id: "PAPER", icon: "/paper.svg", label: "Paper" },
  { id: "SCISSORS", icon: "/scissors.svg", label: "Scissors" },
];

export default function GameControls({ onMove, playerMove, disabled }: any) {
  return (
    <div className="w-full max-w-md pb-10 px-4 flex flex-col items-center">
      {/* Game Moves Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full">
        {MOVES_DATA.map((m) => {
          const isSelected = playerMove === m.id;
          return (
            <motion.button
              key={m.id}
              whileTap={{ scale: 0.9 }}
              disabled={disabled || !!playerMove}
              onClick={() => onMove(m.id)}
              className={`relative aspect-square flex flex-col items-center justify-center transition-all duration-500 group
                ${isSelected ? "brightness-125 scale-110" : "brightness-75 hover:brightness-100"}
                ${disabled && !isSelected ? "opacity-20 grayscale" : "opacity-100"}
              `}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={m.icon}
                  alt={m.label}
                  className={`w-[95%] h-[95%] object-contain transition-all duration-500 z-10 invert drop-shadow-2xl
                    ${isSelected ? `drop-shadow-[0_0_25px_rgba(255,255,255,0.6)]` : ""}
                  `}
                />
                {isSelected && (
                  <motion.div
                    layoutId="glow"
                    className="absolute inset-0 rounded-full blur-3xl opacity-30 bg-white"
                  />
                )}
              </div>
              <span
                className={`mt-2 text-[10px] font-black tracking-[0.3em] uppercase transition-all
                ${isSelected ? "text-white opacity-100" : "text-white/20 group-hover:text-white/50"}`}
              >
                {m.label}
              </span>
            </motion.button>
          );
        })}

        {/* Snake Lock */}
        <div className="relative aspect-square flex flex-col items-center justify-center opacity-20 grayscale cursor-not-allowed group">
          <img
            src="/snake-tongue.svg"
            alt="Locked"
            className="w-[90%] h-[90%] object-contain invert opacity-40"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <Lock size={24} className="text-white/60 mb-1" />
            <span className="text-[7px] font-black tracking-widest text-white/40">
              SNAKE
            </span>
          </div>
        </div>
      </div>

      {/* --- AI COACH BUTTON WITH STICKY NOTE --- */}
      <div className="mt-12 w-full flex justify-center relative">
        <div className="relative group">
          <button
            disabled
            className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 px-6 py-3 rounded-2xl cursor-not-allowed opacity-60"
          >
            <div className="bg-emerald-500/20 p-1.5 rounded-lg">
              <Zap size={14} className="text-emerald-400 fill-emerald-400" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-black text-emerald-400 tracking-wider">
                AI COACH
              </span>
              <span className="text-[8px] font-medium text-white/40">
                Help talk to girls
              </span>
            </div>
            <div className="ml-2 w-1.5 h-1.5 rounded-full bg-emerald-500/30" />
          </button>

          {/* The Sticky Note positioned over the corner */}
          <div className="absolute -top-7 -right-14 z-20 pointer-events-none scale-50">
            <StickyNote text="Feature not available" />
          </div>
        </div>
      </div>
    </div>
  );
}
