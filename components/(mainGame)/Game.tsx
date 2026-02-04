"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Info, Crown, Ghost } from "lucide-react"; // Added icons
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { getComputerMove, determineWinner, Move } from "./gameLogic";
import PlayerProfile from "./PlayerProfile";
import OpponentProfile from "./OpponentProfile";
import GameBoard from "./GameBoard";
import GameControls from "./GameControls";
import ExVoiceHandler from "./emampleVoicehandler";

type GameState = "waiting" | "revealing" | "transitioning";

export default function Game() {
  const router = useRouter();
  const { slug } = useParams();

  const [round, setRound] = useState(1);
  const [scores, setScores] = useState({ player: 0, opponent: 0 });
  const [playerMove, setPlayerMove] = useState<Move>(null);
  const [opponentMove, setOpponentMove] = useState<Move>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showTutorial, setShowTutorial] = useState(true);
  const [gameState, setGameState] = useState<GameState>("waiting");

  const opponentTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowTutorial(false), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (gameState !== "waiting") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!playerMove) handleMove("ROCK");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, round]);

  useEffect(() => {
    if (gameState !== "revealing") return;

    const t = setTimeout(() => {
      const result = determineWinner(playerMove, opponentMove);

      setScores((prev) => ({
        player: prev.player + (result === "win" ? 1 : 0),
        opponent: prev.opponent + (result === "lose" ? 1 : 0),
      }));

      setGameState("transitioning");
    }, 500);

    return () => clearTimeout(t);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "transitioning") return;

    const t = setTimeout(() => {
      if (round >= 6) {
        const finalStatus = scores.player >= scores.opponent ? "win" : "lose";
        router.push(
          `/result?status=${finalStatus}&wins=${scores.player}&losses=${scores.opponent}`,
        );
      } else {
        setRound((r) => r + 1);
        setPlayerMove(null);
        setOpponentMove(null);
        setTimeLeft(15);

        if (opponentTimerRef.current) {
          clearTimeout(opponentTimerRef.current);
          opponentTimerRef.current = null;
        }

        setGameState("waiting");
      }
    }, 3000);

    return () => clearTimeout(t);
  }, [gameState, round, scores, router]);

  useEffect(() => {
    return () => {
      if (opponentTimerRef.current) {
        clearTimeout(opponentTimerRef.current);
      }
    };
  }, []);

  const handleMove = (move: Move) => {
    if (gameState !== "waiting") return;

    setPlayerMove(move);

    let delay: number;
    if (timeLeft > 8) {
      delay = Math.random() * 3000 + 3000;
    } else if (timeLeft > 4) {
      delay = Math.random() * 2000 + 2000;
    } else {
      delay = Math.random() * 1000 + 500;
    }

    if (opponentTimerRef.current) {
      clearTimeout(opponentTimerRef.current);
    }

    opponentTimerRef.current = setTimeout(() => {
      const cpuMove = getComputerMove();
      setOpponentMove(cpuMove);
      setGameState("revealing");
    }, delay);
  };

  return (
    <div className="min-h-screen bg-[#060908] text-white flex flex-col relative overflow-hidden font-sans">
      <ExVoiceHandler />

      <header className="p-6 flex justify-between items-center">
        <Link href="/">
          <ArrowLeft className="w-6 h-6 text-white/50" />
        </Link>
        <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md">
          <span className="text-emerald-400 font-black text-xs tracking-widest uppercase">
            Round {round} / 6
          </span>
        </div>
        <div className="w-6" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-between p-6">
        <AnimatePresence>
          {showTutorial && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-24 bg-emerald-500/20 border border-emerald-500/20 px-4 py-2 rounded-full text-[10px] font-bold tracking-tighter flex items-center gap-2"
            >
              <Info size={12} className="text-emerald-400" /> VOICE CONNECTED
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center w-full max-w-md">
          <PlayerProfile isMyTurn={gameState === "waiting"} />
          <div className="text-white/5 font-black italic text-2xl tracking-tighter">
            VS
          </div>
          <OpponentProfile name={slug} avatar="/downloadm.png" />
        </div>

        <GameBoard
          playerMove={playerMove}
          opponentMove={opponentMove}
          showResult={gameState !== "waiting"}
        />

        <div className="text-center">
          {/* IMPROVED SCOREBOARD */}
          <ScoreDisplay player={scores.player} opponent={scores.opponent} />

          <p className="text-white/20 uppercase text-[10px] font-bold mt-4 mb-1 tracking-widest">
            Time Remaining
          </p>
          <motion.p
            key={timeLeft}
            className={`text-6xl font-black tabular-nums ${timeLeft < 5 ? "text-red-500" : "text-white"}`}
          >
            {timeLeft}s
          </motion.p>
        </div>

        <GameControls
          onMove={handleMove}
          playerMove={playerMove}
          disabled={gameState !== "waiting"}
        />
      </main>
    </div>
  );
}

/* ---------------- MODERN SCOREBOARD COMPONENT ---------------- */
function ScoreDisplay({ player, opponent }: any) {
  return (
    <div className="inline-flex items-center gap-6 bg-gradient-to-b from-white/10 to-transparent p-1 rounded-full border border-white/10 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center gap-4 px-6 py-2 rounded-full bg-[#0a0f0e]">
        {/* Player Score */}
        <div className="flex items-center gap-2">
          <Crown size={14} className="text-emerald-400" />
          <motion.span
            key={player}
            initial={{ scale: 1.5, color: "#34d399" }}
            animate={{ scale: 1, color: "#fff" }}
            className="text-xl font-black"
          >
            {player}
          </motion.span>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-white/10" />

        {/* Opponent Score */}
        <div className="flex items-center gap-2">
          <motion.span
            key={opponent}
            initial={{ scale: 1.5, color: "#f87171" }}
            animate={{ scale: 1, color: "#fff" }}
            className="text-xl font-black"
          >
            {opponent}
          </motion.span>
          <Ghost size={14} className="text-red-400" />
        </div>
      </div>
    </div>
  );
}
