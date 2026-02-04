"use client";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Loader2, LockKeyhole } from "lucide-react";

interface GuestPopupProps {
  isOpen: boolean;
  title?: string; // Optional: To change the header
  message?: string; // Optional: To change the body text
}

export default function GuestPopup({
  isOpen,
  title,
  message,
}: GuestPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl border-4 border-pink-100 text-center"
          >
            <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-500 mb-4 mx-auto">
              {/* If a custom message exists, show a LOCK icon, otherwise show LOGIN icon */}
              {message ? <LockKeyhole size={32} /> : <LogIn size={32} />}
            </div>

            <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase">
              {title || "Not Logged In"}
            </h2>

            <p className="text-slate-500 font-bold mb-6 leading-relaxed">
              {message ? (
                // CUSTOM MESSAGE (For ActiveChallengers)
                <span>{message}</span>
              ) : (
                // DEFAULT MESSAGE (For HomePage)
                <span>
                  You can't play <span className="text-pink-500">LIVE</span>{" "}
                  matches yet. Starting a practice game with our{" "}
                  <span className="text-blue-500">Agent</span> for you...
                </span>
              )}
            </p>

            <div className="flex items-center justify-center gap-2 text-pink-500 font-black italic animate-pulse">
              <Loader2 className="animate-spin" size={18} />
              REDIRECTING...
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
