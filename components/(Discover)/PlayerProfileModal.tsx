"use client";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Quote, ShieldCheck, User as UserIcon } from "lucide-react";

// Use the @ alias to avoid path errors
import { StatusBadge } from "@/components/(Challenge)/StatusBadge";

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: any;
  currentUserId?: string;
}

export const PlayerProfileModal = ({
  isOpen,
  onClose,
  player,
  currentUserId,
}: PlayerProfileModalProps) => {
  useEffect(() => {
    // Only log if it's a real player and we have a user
    if (isOpen && player && currentUserId && !player.id?.includes("dummy")) {
      const receiverId = player._id || player.id;
      fetch("/api/social/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: receiverId,
          type: "VIEW",
        }),
      }).catch((err) => console.error("View log failed", err));
    }
  }, [isOpen, player, currentUserId]);

  if (!player) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-10 p-2 bg-black/40 hover:bg-white/10 rounded-full text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative h-64 w-full">
              <img
                src={player.img || player.photo}
                className="w-full h-full object-cover"
                alt={player.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-8">
                {/* Fixed the status check here */}
                <StatusBadge
                  status={player.statusBadge || player.StatusBadge || "HORSE"}
                  size="md"
                />
              </div>
            </div>

            <div className="p-8 pt-4 space-y-6">
              <div>
                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                  {player.name}, {player.age}
                </h2>
                <div className="flex items-center gap-2 text-pink-500 mt-1 font-bold">
                  <MapPin className="w-4 h-4" />
                  <span className="uppercase text-sm tracking-widest">
                    {player.city || player.district || "Player"},{" "}
                    {player.state || "India"}
                  </span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative">
                <Quote className="absolute -top-3 -left-1 w-8 h-8 text-white/10" />
                <p className="text-slate-300 italic leading-relaxed">
                  {player.bio ||
                    "This player prefers to let their game do the talking."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
                  <ShieldCheck className="text-[#00FFAB] w-5 h-5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      Status
                    </span>
                    <span className="text-white text-sm font-bold uppercase">
                      {player.statusBadge || "ACTIVE"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
                  <UserIcon className="text-pink-500 w-5 h-5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      District
                    </span>
                    <span className="text-white text-sm font-bold uppercase">
                      {player.district || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95"
              >
                Close Profile
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
