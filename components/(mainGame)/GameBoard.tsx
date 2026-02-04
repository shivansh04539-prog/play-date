"use client";

import React, { memo } from "react"; // Use named import to fix red lines
import { motion, AnimatePresence } from "framer-motion";

const ICON_MAP: Record<string, string> = {
  ROCK: "/rock.svg",
  PAPER: "/paper.svg",
  SCISSORS: "/scissors.svg",
};

// 1. Define the component with a name first
const GameBoardComponent = ({ playerMove, opponentMove, showResult }: any) => {
  return (
    <div className="flex items-center justify-center gap-6 my-10 relative w-full max-w-md">
      {/* Player Side Card */}
      <div
        className={`relative w-32 h-44 rounded-[32px] border-2 flex flex-col items-center justify-center transition-all duration-500 ${
          playerMove
            ? "bg-emerald-500/10 border-emerald-500/50"
            : "bg-white/5 border-white/10"
        }`}
      >
        <AnimatePresence mode="wait">
          {playerMove ? (
            <motion.img
              key={playerMove}
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1.1, opacity: 1, rotate: 0 }}
              src={ICON_MAP[playerMove]}
              className="w-20 h-20 object-contain drop-shadow-2xl"
            />
          ) : (
            <span className="text-white/10 text-5xl font-black italic">?</span>
          )}
        </AnimatePresence>
        <span className="absolute bottom-4 text-[9px] font-black text-white/30 tracking-[3px]">
          YOU
        </span>
      </div>

      <div className="text-2xl font-black italic text-white/5">VS</div>

      {/* Opponent Side Card */}
      <div
        className={`relative w-32 h-44 rounded-[32px] border-2 flex flex-col items-center justify-center transition-all duration-500 ${
          showResult
            ? "bg-red-500/10 border-red-500/50"
            : "bg-white/5 border-white/10"
        }`}
      >
        <AnimatePresence mode="wait">
          {showResult ? (
            <motion.img
              key={opponentMove}
              initial={{ scale: 0.5, opacity: 0, rotate: 10 }}
              animate={{ scale: 1.1, opacity: 1, rotate: 0 }}
              src={ICON_MAP[opponentMove]}
              className="w-20 h-20 object-contain drop-shadow-2xl"
            />
          ) : opponentMove ? (
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-[10px] font-black text-emerald-400"
            >
              PICKING...
            </motion.div>
          ) : (
            <span className="text-white/10 text-5xl font-black italic">?</span>
          )}
        </AnimatePresence>
        <span className="absolute bottom-4 text-[9px] font-black text-white/30 tracking-[3px]">
          OPPONENT
        </span>
      </div>
    </div>
  );
};

// 2. Assign a Display Name for ESLint
GameBoardComponent.displayName = "GameBoard";

// 3. Export the memoized version
const GameBoard = memo(GameBoardComponent);
export default GameBoard;
