"use client";
import React, { useState } from "react";
import { Heart, Zap } from "lucide-react";
import ActiveChallengers from "./ActiveChallengers";

const Discover = ({ initialPlayers }: { initialPlayers: any[] }) => {
  const [likeCount, setLikeCount] = useState(0);
  const [viewers, setViewers] = useState<any[]>([]);

  return (
    <main className="min-h-screen bg-[#F3F0F5] pb-24 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/50 shadow-sm h-11">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              <span className="text-sm font-bold text-slate-700 whitespace-nowrap">
                {likeCount} Likes
              </span>
            </div>

            {viewers.length > 0 && (
              <div className="flex items-center gap-3 bg-white/40 backdrop-blur-md px-3 py-2 rounded-full border border-white/50 shadow-sm h-11">
                <div className="flex -space-x-2.5">
                  {viewers.slice(0, 3).map((v, i) => (
                    <img
                      key={i}
                      src={v.img || v.photo}
                      className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-sm"
                      alt="viewer"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1 pr-1">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">
                    Seen
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform shrink-0">
            <span className="text-white text-xs font-bold">YOU</span>
          </div>
        </header>

        <div className="px-6 space-y-8">
          <section className="relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00DDAA] to-[#00BA99] opacity-90 rounded-[32px]" />
            <div className="relative p-6 md:p-10 flex justify-between items-center z-10">
              <div className="max-w-[70%] lg:max-w-[50%]">
                <h2 className="text-white font-black text-2xl md:text-3xl tracking-tight uppercase italic">
                  Live Seminar
                </h2>
                <p className="text-white/80 text-xs md:text-sm mt-1 font-medium">
                  Connect with our live dating coach.
                </p>
              </div>
              <button className="w-14 h-14 bg-black/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 transition-all shadow-xl">
                <Zap className="text-white fill-white w-6 h-6" />
              </button>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-end mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase">
                  Active Challengers
                </h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 bg-[#00FFAB] rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-[#00BA99] uppercase">
                    1,528 Online
                  </span>
                </div>
              </div>
            </div>

            <ActiveChallengers
              setLikeCount={setLikeCount}
              setViewers={setViewers}
              initialPlayers={initialPlayers}
            />
          </section>
        </div>
      </div>
    </main>
  );
};

export default Discover;