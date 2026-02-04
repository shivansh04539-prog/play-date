"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { determineWinner, Move } from "@/components/(mainGame)/gameLogic";
import { Loader2 } from "lucide-react";
import OpponentProfile from "@/components/(mainGame)/OpponentProfile";
import PlayerProfile from "@/components/(mainGame)/PlayerProfile";
import GameBoard from "@/components/(mainGame)/GameBoard";
import GameControls from "@/components/(mainGame)/GameControls";

export default function MatchGame() {
  const router = useRouter();
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("id");
  const { user } = useAuth();

  const [opponentSavedMoves, setOpponentSavedMoves] = useState<Move[]>([]);
  const [loading, setLoading] = useState(true);
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState({ player: 0, opponent: 0 });
  const [playerMove, setPlayerMove] = useState<Move>(null);
  const [opponentMove, setOpponentMove] = useState<Move>(null);
  const [showResult, setShowResult] = useState(false);

  const isFinishedRef = useRef(false);

  useEffect(() => {
    async function fetchChallengeData() {
      try {
        const res = await fetch(`/api/challenge?id=${challengeId}`);
        const data = await res.json();
        if (data && data.challengerMoves && data.challengerMoves.length > 0) {
          setOpponentSavedMoves(data.challengerMoves);
        } else {
          console.error("No moves found for this challenge!");
          // Optional: router.push('/dashboard') if no moves exist
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (challengeId) fetchChallengeData();
  }, [challengeId]);

  useEffect(() => {
    return () => {
      // Logic: If user leaves before round 6 is done
      if (!isFinishedRef.current && !loading && opponentSavedMoves.length > 0) {
        fetch("/api/challenge", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            challengeId: challengeId,
            winnerId: slug,
            // Penalty score updated to reflect 6 rounds
            finalScore: { player: 0, opponent: 6 },
          }),
          keepalive: true,
        });
      }
    };
  }, [loading, opponentSavedMoves, challengeId, slug]);

  const completeChallenge = async (pScore: number, oScore: number) => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;

    let winnerId = pScore > oScore ? user?._id : slug;
    if (pScore === oScore) winnerId = "DRAW";

    try {
      await fetch("/api/challenge", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challengeId,
          winnerId: winnerId,
          finalScore: { player: pScore, opponent: oScore },
        }),
        keepalive: true,
      });
    } catch (error) {
      console.error("Patch Error:", error);
    }

    router.push(
      `/result?wins=${pScore}&losses=${oScore}&status=${pScore > oScore ? "win" : "lose"}`,
    );
  };

  const handleMove = (move: Move) => {
    if (playerMove || showResult || loading) return;

    const oMove = opponentSavedMoves[round - 1] || "ROCK";
    setPlayerMove(move);
    setOpponentMove(oMove);

    setTimeout(() => {
      setShowResult(true);
      const result = determineWinner(move, oMove);

      let pScore = scores.player;
      let oScore = scores.opponent;
      if (result === "win") pScore++;
      if (result === "lose") oScore++;

      setScores({ player: pScore, opponent: oScore });

      setTimeout(() => {
        // UPDATED: Check for Round 6 instead of 4
        if (round >= 6) {
          completeChallenge(pScore, oScore);
        } else {
          setRound((r) => r + 1);
          setPlayerMove(null);
          setOpponentMove(null);
          setShowResult(false);
        }
      }, 2000);
    }, 500);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#060908] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#060908] text-white flex flex-col p-6 items-center">
      <div className="bg-white/5 px-6 py-2 rounded-full border border-white/10 mb-8">
        <span className="text-emerald-400 font-black tracking-widest uppercase text-xs">
          {/* UI UPDATED TO 6 */}
          Match Game Round {round} / 6
        </span>
      </div>

      <div className="flex justify-between items-center w-full max-w-md mb-12">
        <PlayerProfile name={user?.name || "You"} isMyTurn={true} />
        <div className="text-xl font-black italic text-white/10">VS</div>
        <OpponentProfile
          name={`Challenger`}
          avatar="/downloadm.png"
          micStatus="muted"
        />
      </div>

      <GameBoard
        playerMove={playerMove}
        opponentMove={opponentMove}
        showResult={showResult}
      />

      <GameControls
        onMove={handleMove}
        playerMove={playerMove}
        disabled={showResult}
      />
    </div>
  );
}
