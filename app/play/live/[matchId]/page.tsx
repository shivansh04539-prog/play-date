"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Ghost, Loader2 } from "lucide-react";
import Link from "next/link";

import VoiceHandler from "@/components/(mainGame)/VoiceHandler";
import PlayerProfile from "@/components/(mainGame)/PlayerProfile";
import OpponentProfile from "@/components/(mainGame)/OpponentProfile";
import { determineWinner, Move } from "@/components/(mainGame)/gameLogic";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import GameControls from "@/components/(mainGame)/GameControls";
import GameBoard from "@/components/(mainGame)/GameBoard";

function LiveMatchComponent() {
  const params = useParams();
  const matchId = params.matchId || params.id;
  const router = useRouter();
  const { pusher } = useSocket();
  const { user } = useAuth();

  const channelRef = useRef<any>(null);
  const isFinishedRef = useRef(false);
  const resolveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscribedMatchIdRef = useRef<string | null>(null);

  // 🎯 GAME STATE
  const [round, setRound] = useState(1);
  const [playerMove, setPlayerMove] = useState<Move | null>(null);
  const [opponentMove, setOpponentMove] = useState<Move | null>(null);
  const [roundEndTime, setRoundEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [scores, setScores] = useState({ player: 0, opponent: 0 });
  const [opponentId, setOpponentId] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(true);

  // 🔥 FIX: Use refs to track current state for callbacks
  const roundRef = useRef(round);
  const playerMoveRef = useRef(playerMove);
  const opponentMoveRef = useRef(opponentMove);
  const showResultRef = useRef(showResult);
  const scoresRef = useRef(scores);
  const matchIdRef = useRef(matchId);
  const userRef = useRef(user);

  // Add this useEffect at the top of your LiveMatchComponent function:
  useEffect(() => {
    const initAudio = () => {
      if (typeof window !== "undefined" && window.AudioContext) {
        const audioContext = new AudioContext();
        if (audioContext.state === "suspended") {
          audioContext.resume();
        }
      }
    };
    initAudio();
    document.addEventListener("click", initAudio);
    return () => document.removeEventListener("click", initAudio);
  }, []);

  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  useEffect(() => {
    playerMoveRef.current = playerMove;
  }, [playerMove]);

  useEffect(() => {
    opponentMoveRef.current = opponentMove;
  }, [opponentMove]);

  useEffect(() => {
    showResultRef.current = showResult;
  }, [showResult]);

  useEffect(() => {
    scoresRef.current = scores;
  }, [scores]);

  useEffect(() => {
    matchIdRef.current = matchId;
  }, [matchId]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // 🎯 INITIAL SYNC & RECONNECT
  useEffect(() => {
    const initMatch = async () => {
      if (!matchId || !user?._id) return;
      try {
        const response = await fetch(`/api/match/${matchId}`);
        const data = await response.json();

        const myId = String(user._id);
        const oppId =
          String(data.player1Id) === myId
            ? String(data.player2Id)
            : String(data.player1Id);
        setOpponentId(oppId);

        if (data.roundEndsAt) {
          setRound(data.currentRound || 1);
          setRoundEndTime(data.roundEndsAt);
        } else {
          startNewRound(1);
        }

        if (data.scores) {
          setScores({
            player:
              myId === data.player1Id
                ? data.scores.player1
                : data.scores.player2,
            opponent:
              myId === data.player1Id
                ? data.scores.player2
                : data.scores.player1,
          });
        }
      } catch (err) {
        console.error("Init Error:", err);
      } finally {
        setIsSyncing(false);
      }
    };

    initMatch();

    return () => {
      if (resolveTimeoutRef.current) clearTimeout(resolveTimeoutRef.current);
    };
  }, [matchId, user?._id]);

  const startNewRound = useCallback(
    (roundNum: number, existingEndTime?: number) => {
      // Logic to prevent going back in time or weird jumps if not needed
      // But primarily we trust the input here.

      const newEndTime = existingEndTime || Date.now() + 16000;

      setRound(roundNum);
      setRoundEndTime(newEndTime);
      setPlayerMove(null);
      setOpponentMove(null);
      setShowResult(false);

      // Only trigger sync if we generated the time (meaning we initiated the round change)
      if (!existingEndTime && channelRef.current) {
        channelRef.current.trigger("client-sync-round", {
          round: roundNum,
          roundEndTime: newEndTime,
          senderId: String(userRef.current?._id), // Include senderId here
        });
      }
    },
    [],
  );

  // Timer - optimized with useMemo
  useEffect(() => {
    if (!roundEndTime) return;

    const tick = () => {
      const newTimeLeft = Math.max(
        0,
        Math.ceil((roundEndTime - Date.now()) / 1000),
      );
      if (newTimeLeft !== timeLeft) {
        setTimeLeft(newTimeLeft);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [roundEndTime]); // Removed timeLeft dependency

  const completeMatch = useCallback(
    async (pScore: number, oScore: number) => {
      if (isFinishedRef.current) return;
      isFinishedRef.current = true;

      console.log("🏁 Completing match with scores:", pScore, oScore);

      const status =
        pScore > oScore ? "win" : pScore < oScore ? "lose" : "draw";

      try {
        await fetch(`/api/match/${matchIdRef.current}/finish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            pScore,
            oScore,
            userId: userRef.current?._id,
          }),
        });
      } catch (e) {
        console.error("Final save failed:", e);
      }

      router.push(
        `/result?matchId=${matchIdRef.current}&status=${status}&wins=${pScore}&losses=${oScore}`,
      );
    },
    [router],
  );

  const resolveRound = useCallback(() => {
    const currentPlayerMove = playerMoveRef.current;
    const currentOpponentMove = opponentMoveRef.current;
    const currentShowResult = showResultRef.current;

    if (!currentPlayerMove || !currentOpponentMove || currentShowResult) {
      return;
    }

    console.log("🎯 Resolving round with:", {
      currentPlayerMove,
      currentOpponentMove,
    });
    setShowResult(true);

    const result = determineWinner(currentPlayerMove, currentOpponentMove);

    setScores((prev) => {
      const newScores = {
        player: result === "win" ? prev.player + 1 : prev.player,
        opponent: result === "lose" ? prev.opponent + 1 : prev.opponent,
      };

      if (resolveTimeoutRef.current) {
        clearTimeout(resolveTimeoutRef.current);
      }

      // 🔥 VITAL FIX: Calculate the NEXT round number NOW, not inside the timeout.
      // This prevents the "current + 1" logic from jumping if the round updates meanwhile.
      const currentRound = roundRef.current;
      const nextRound = currentRound + 1;

      resolveTimeoutRef.current = setTimeout(() => {
        if (currentRound >= 6) {
          completeMatch(newScores.player, newScores.opponent);
        } else {
          // Use the locked-in 'nextRound' variable
          startNewRound(nextRound);
        }
      }, 3000);

      return newScores;
    });
  }, [startNewRound, completeMatch]);

  // Auto-resolve when both moves are available
  useEffect(() => {
    if (playerMove && opponentMove && !showResult) {
      console.log("🤖 Both moves available, resolving...");
      resolveRound();
    }
  }, [playerMove, opponentMove, showResult, resolveRound]);

  // 🎯 SOCKET BINDINGS
  useEffect(() => {
    if (!pusher || !matchId || !user?._id) return;
    if (subscribedMatchIdRef.current === matchId) return;

    const channelName = `presence-match-${matchId}`;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;
    subscribedMatchIdRef.current = matchId as string;

    const currentUserId = String(user._id);

    console.log("🔌 Connected to match channel:", channelName);

    const handleBeforeUnload = () => {
      if (channelRef.current) {
        channelRef.current.trigger("client-player-left", {
          userId: currentUserId,
          timestamp: Date.now(),
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    channel.bind("client-opponent-move", (data: any) => {
      console.log("📢 Opponent move received:", data);
      if (String(data.senderId) === currentUserId) return;

      setOpponentMove(data.move);

      const shouldResolve = playerMoveRef.current && !showResultRef.current;
      if (shouldResolve) {
        resolveRound();
      }
    });

    channel.bind("client-sync-round", (data: any) => {
      console.log("🔄 Sync round received:", data);

      // 🔥 VITAL FIX: If we receive a sync command from opponent,
      // CANCEL our local timeout so we don't trigger a double-jump
      if (resolveTimeoutRef.current) {
        clearTimeout(resolveTimeoutRef.current);
        resolveTimeoutRef.current = null;
      }

      if (String(data.senderId) !== currentUserId) {
        startNewRound(data.round, data.roundEndTime);
      }
    });

    channel.bind("pusher:member_removed", (member: any) => {
      if (String(member.id) === currentUserId) return;
      const goHome = window.confirm("🎉 Opponent left the match! You win!");
      if (goHome) router.push("/");
    });

    channel.bind("client-player-left", (data: any) => {
      if (String(data.userId) === currentUserId) return;
      setTimeout(() => {
        alert("🎉 Opponent left the match! You win!");
        router.push("/");
      }, 500);
    });

    channel.bind("pusher:subscription_succeeded", () => {
      console.log("✅ Successfully subscribed to match channel");
    });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      subscribedMatchIdRef.current = null;
    };
  }, [pusher, matchId, user?._id, startNewRound, resolveRound, router]);

  const handleMove = useCallback(
    (move: Move) => {
      console.log("🎮 Player clicked:", move);

      if (playerMoveRef.current) return;
      if (showResultRef.current) return;
      if (isFinishedRef.current) return;

      setPlayerMove(move);

      channelRef.current?.trigger("client-opponent-move", {
        move,
        senderId: String(userRef.current?._id),
      });

      if (opponentMoveRef.current && !showResultRef.current) {
        resolveRound();
      }
    },
    [resolveRound],
  );

  if (isSyncing) {
    return (
      <div className="min-h-screen bg-[#060908] text-white flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060908] text-white flex flex-col relative font-sans overflow-hidden">
      <button
        onClick={() => {
          if (typeof AudioContext !== "undefined") {
            const audioContext = new AudioContext();
            if (audioContext.state === "suspended") {
              audioContext.resume();
            }
          }
        }}
        className="hidden"
        aria-label="Initialize audio"
      >
        Init Audio
      </button>

      {opponentId && (
        <VoiceHandler
          matchId={matchId as string}
          userId={user?._id as string}
          onConnected={() => console.log("🎤 Voice Active")}
        />
      )}

      <header className="p-6 flex justify-between items-center z-10">
        <Link href="/">
          <ArrowLeft className="w-6 h-6 text-white/50" />
        </Link>
        <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md">
          <span className="text-emerald-400 font-black text-sm uppercase">
            ROUND {Math.min(round, 6)} / 6
          </span>
        </div>
        <div className="w-6" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-between p-6 z-10">
        <div className="flex justify-between items-center w-full max-w-md">
          <PlayerProfile isMyTurn={!playerMove} />
          <div className="text-xl font-black italic text-white/10">VS</div>
          <OpponentProfile
            name="Opponent"
            avatar="/downloadm.png"
            micStatus="speaking"
          />
        </div>

        <GameBoard
          playerMove={playerMove}
          opponentMove={opponentMove}
          showResult={showResult}
        />

        <div className="text-center">
          <div className="flex gap-8 justify-center items-center bg-white/5 py-2 px-6 rounded-full border border-white/10">
            <div className="flex items-center gap-2">
              <Crown size={14} className="text-emerald-400" />
              <span className="font-bold">{scores.player}</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="font-bold">{scores.opponent}</span>
              <Ghost size={14} className="text-red-400" />
            </div>
          </div>
          <p className="text-white/20 uppercase text-[10px] mt-4 mb-2">
            Time Left
          </p>
          <motion.p
            key={timeLeft}
            className={`text-6xl font-black ${timeLeft < 5 ? "text-red-500" : "text-white"}`}
          >
            {timeLeft}s
          </motion.p>
        </div>

        <GameControls
          onMove={handleMove}
          playerMove={playerMove}
          disabled={showResult}
        />
      </main>
    </div>
  );
}

const LiveMatch = memo(LiveMatchComponent);
export default LiveMatch;
