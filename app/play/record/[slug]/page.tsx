"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import PlayerProfile from "@/components/(mainGame)/PlayerProfile";
import { Move } from "@/components/(mainGame)/gameLogic";
import { toast } from "sonner";
import GameBoard from "@/components/(mainGame)/GameBoard";
import GameControls from "@/components/(mainGame)/GameControls";

export default function RecordGame() {
  const router = useRouter();
  const { slug } = useParams();
  const { user } = useAuth();

  const [round, setRound] = useState(1);
  const [playerMove, setPlayerMove] = useState<Move>(null);
  const [recordedMoves, setRecordedMoves] = useState<Move[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user && !isSaving) {
      router.push("/login");
    }
  }, [user, isSaving, router]);

  useEffect(() => {
    if (playerMove || isSaving) return;

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
  }, [round, playerMove, isSaving]);

  const saveChallenge = async (finalMoves: Move[]) => {
    if (!user?._id) return;
    setIsSaving(true);

    console.log("📤 SENDING CHALLENGE:");
    console.log("FROM (user._id):", user._id);
    console.log("TO (slug):", slug);

    try {
      const response = await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengerId: user._id,
          receiverId: slug,
          moves: finalMoves,
        }),
      });

      if (response.ok) {
        toast.success("Challenge Sent!");
        router.push("/");
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

    setTimeout(() => {
      // UPDATED: Check for Round 6 instead of 4
      if (round >= 6) {
        saveChallenge(newMoves);
      } else {
        setRound((r) => r + 1);
        setPlayerMove(null);
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
        <div className="flex justify-center items-center w-full max-w-md">
          <PlayerProfile name={user?.name} isMyTurn={true} />
        </div>

        <GameBoard
          playerMove={playerMove}
          opponentMove={null}
          showResult={false}
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
                {/* UI UPDATED TO 6 */}
                ROUND {round} / 6
              </div>
            </>
          )}
        </div>

        <GameControls
          onMove={handleMove}
          playerMove={playerMove}
          disabled={isSaving}
        />
      </main>
    </div>
  );
}
