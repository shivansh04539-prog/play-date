"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // 1. Import Auth
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import PlayerProfile from "../../PlayerProfile";
import OpponentProfile from "../../OpponentProfile";
import GameBoard from "../../GameBoard";
import { Move } from "../../gameLogic";
import { toast } from "sonner";

export default function RecordGame() {
  const router = useRouter();
  const { slug } = useParams(); // This is the OPPONENT'S ID from the URL
  const { user } = useAuth(); // 2. Get YOUR (Challenger) info

  const [round, setRound] = useState(1);
  const [playerMove, setPlayerMove] = useState<Move>(null);
  const [recordedMoves, setRecordedMoves] = useState<Move[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showResult, setShowResult] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Security Check: If user is not logged in, they shouldn't be here
  useEffect(() => {
    if (!user && !isSaving) {
      router.push("/login");
    }
  }, [user]);

  useEffect(() => {
    if (timeLeft > 0 && !playerMove) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !playerMove) {
      handleMove("ROCK");
    }
  }, [timeLeft, playerMove]);

  const saveChallenge = async (finalMoves: Move[]) => {
    if (!user?._id) return;
    setIsSaving(true);

    try {
      const response = await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengerId: user._id, // YOUR ID from AuthContext
          receiverId: slug, // Opponent ID from URL params
          moves: finalMoves,
        }),
      });

      if (response.ok) {
        toast.success("Challenge Sent!");
        router.push("/notified");
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast.error("Could not send challenge. Try again.");
      setIsSaving(false);
    }
  };

  const handleMove = (move: Move) => {
    if (playerMove || isSaving) return;
    setPlayerMove(move);
    const newMoves = [...recordedMoves, move];
    setRecordedMoves(newMoves);
    setShowResult(true);

    setTimeout(() => {
      if (round >= 4) {
        saveChallenge(newMoves);
      } else {
        setRound((r) => r + 1);
        setPlayerMove(null);
        setShowResult(false);
        setTimeLeft(15);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#060908] text-white flex flex-col relative">
      <header className="p-6 flex justify-between items-center z-10">
        <Link href="/explore">
          <ArrowLeft className="w-6 h-6 text-white/50" />
        </Link>
        <div className="bg-emerald-500/20 border border-emerald-500/30 px-4 py-1 rounded-full text-emerald-400 text-[10px] font-black uppercase">
          {isSaving ? "Uploading Moves..." : "Recording Mode"}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-between p-6">
        <div className="flex justify-between items-center w-full max-w-md">
          {/* Show YOUR profile */}
          <PlayerProfile name={user?.name} isMyTurn={true} />
          <div className="text-white/10 italic font-black">VS</div>
          {/* Show OPPONENT profile via slug/id */}
          <OpponentProfile
            name={`User_${slug?.toString().slice(0, 4)}`}
            avatar="/downloadm.png"
            micStatus="muted"
          />
        </div>

        <GameBoard
          playerMove={playerMove}
          opponentMove={null}
          showResult={showResult}
        />

        <div className="text-center">
          {isSaving ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
              <p className="text-emerald-500 text-xs font-bold animate-pulse">
                SAVING TO CLOUD...
              </p>
            </div>
          ) : (
            <>
              <div className="text-4xl font-black text-white mb-2">
                {timeLeft}s
              </div>
              <div className="flex items-center gap-2 text-emerald-500 font-bold justify-center bg-white/5 px-4 py-1 rounded-full border border-white/10">
                ROUND {round} / 4
              </div>
            </>
          )}
        </div>

        <div className="flex gap-4 w-full max-w-sm pb-10">
          {["ROCK", "PAPER", "SCISSORS"].map((m) => (
            <button
              key={m}
              disabled={!!playerMove || isSaving}
              onClick={() => handleMove(m as Move)}
              className={`flex-1 aspect-square rounded-[32px] text-3xl border transition-all active:scale-90 ${
                playerMove === m
                  ? "bg-emerald-500 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  : "bg-white/5 border-white/10"
              }`}
            >
              {m === "ROCK" ? "🪨" : m === "PAPER" ? "📄" : "✂️"}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
