"use client";
import React, { useEffect, useState } from "react";
import { Swords, Heart, Play, Volume2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ChallengeModal } from "../(Challenge)/ChallengeModal";
import { StatusBadge } from "../(Challenge)/StatusBadge";
import { PlayerProfileModal } from "./PlayerProfileModal";
import GuestPopup from "../GuestPopup";

import { getActivePlayers } from "@/actions/(explore)/playerActions";
import { logViewAction } from '@/actions/(social)/ViewAcction';
import { toggleLikeAction } from "@/actions/(social)/LikeAction";

const viewedIds = new Set();

const ActiveChallengers = ({
  setLikeCount,
  setViewers,
  initialPlayers,
}: {
  setLikeCount: (n: number) => void;
  setViewers: (viewers: any[]) => void;
  initialPlayers: any[];
}) => {
  const { user } = useAuth();
  const [realPlayers, setRealPlayers] = useState(initialPlayers || []); // Start with server data
  const [likedPlayers, setLikedPlayers] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const [modal, setModal] = useState({ open: false, id: "", name: "" });
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!initialPlayers); // Only load if we have no initial data
  const [profileModal, setProfileModal] = useState({ open: false, player: null });
  const [showGuestPopup, setShowGuestPopup] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // If we already have server data and no user is logged in, don't bother re-fetching
      if (initialPlayers && !user?._id) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getActivePlayers(user?._id || "");
        setRealPlayers(data.users || []);
        setLikeCount(data.receivedLikesCount || 0);

        if (data.recentViewers) {
          setViewers(data.recentViewers);
        }

        const likesMap: Record<string, boolean> = {};
        data.likedIds?.forEach((id: string) => {
          likesMap[id] = true;
        });
        setLikedPlayers(likesMap);
      } catch (err) {
        console.error("❌ [FETCH] Failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user?._id, setLikeCount, setViewers, initialPlayers]);

  const toggleLike = async (receiverId: string) => {
    if (!user) return toast.error("Login Required");
    const isCurrentlyLiked = likedPlayers[receiverId];
    setLikedPlayers((prev) => ({ ...prev, [receiverId]: !isCurrentlyLiked }));

    try {
      const res = await toggleLikeAction(user._id, receiverId);
      if (res?.error) throw new Error(res.error);
      setLikedPlayers((prev) => ({ ...prev, [receiverId]: !!res.isLiked }));
    } catch (err) {
      setLikedPlayers((prev) => ({ ...prev, [receiverId]: isCurrentlyLiked }));
      toast.error("Action failed. Try again.");
    }
  };

  const logProfileView = async (receiverId: string, receiverName: string) => {
    if (!user?._id || viewedIds.has(receiverId)) return;
    try {
      viewedIds.add(receiverId);
      await logViewAction(user._id, receiverId);
    } catch (err) {
      viewedIds.delete(receiverId);
    }
  };

  // 1. LOADING UI (Must be outside the main return)
  if (isLoading && realPlayers.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 p-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="w-full max-w-[420px] mx-auto aspect-[4/5] rounded-[48px] bg-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

  // 2. MAIN UI
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 p-2">
      {realPlayers.map((player: any) => {
        const playerId = player.id || player._id;
        const isLiked = likedPlayers[playerId];
        const voiceUrl = player.voiceIntro || player.voice;

        return (
          <div key={playerId} className="flex flex-col gap-5 group w-full max-w-[420px] mx-auto">
            <div
              onClick={() => {
                if (!user) return toast.error("Login required");
                setProfileModal({ open: true, player: player });
                logProfileView(playerId, player.name);
              }}
              className="relative aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl border-[4px] border-white bg-slate-100 cursor-pointer transition-all duration-500 group-hover:scale-[1.02]"
            >
              <img
                src={player.img || player.photo}
                alt={player.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />

              <div className="absolute top-6 left-6" onClick={(e) => e.stopPropagation()}>
                <StatusBadge status={player.statusBadge || "DONKEY"} size="sm" />
              </div>

              {voiceUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const audio = new Audio(voiceUrl);
                    setPlayingId(playerId);
                    audio.play();
                    audio.onended = () => setPlayingId(null);
                  }}
                  className={`absolute bottom-24 right-6 p-4 rounded-full backdrop-blur-xl transition-all shadow-2xl z-10 border-2 ${
                    playingId === playerId ? "bg-pink-500 border-white text-white animate-pulse" : "bg-black/60 border-white/60 text-white"
                  }`}
                >
                  {playingId === playerId ? <Volume2 className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(playerId);
                }}
                className="absolute top-6 right-6 p-4 bg-black/20 backdrop-blur-xl rounded-full hover:bg-black/40 transition-colors z-10"
              >
                <Heart className={`w-6 h-6 ${isLiked ? "text-pink-500 fill-pink-500" : "text-white"}`} />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                <h3 className="text-white text-2xl font-black italic uppercase tracking-tight">
                  {player.name}, {player.age}
                </h3>
              </div>
            </div>

            <button
              onMouseEnter={() => router.prefetch(`/play/record/${playerId}`)}
              onClick={() => {
                if (!user) {
                  setShowGuestPopup(true);
                  return;
                }
                setModal({ open: true, id: playerId, name: player.name });
              }}
              className="w-full py-5 bg-[#0f172a] hover:bg-pink-600 text-white rounded-[32px] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-xl"
            >
              <Swords className="w-6 h-6 text-[#00FFAB]" />
              <span className="text-base font-black uppercase tracking-[0.2em]">Challenge</span>
            </button>
          </div>
        );
      })}

      {/* MODALS */}
      <GuestPopup
        isOpen={showGuestPopup}
        title="Login Required"
        message="You can't challenge because you are not logged in."
      />
      <PlayerProfileModal
        isOpen={profileModal.open}
        onClose={() => setProfileModal({ ...profileModal, open: false })}
        player={profileModal.player}
      />
      <ChallengeModal
        isOpen={modal.open}
        onClose={() => setModal({ ...modal, open: false })}
        onConfirm={(name: string) => {
          setModal({ ...modal, open: false });
          router.push(`/play/record/${modal.id}?donkeyName=${encodeURIComponent(name)}`);
        }}
        currentUserId={user?._id}
        playerName={modal.name}
      />
    </div>
  );
};

export default ActiveChallengers;