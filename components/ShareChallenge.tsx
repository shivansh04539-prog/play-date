"use client";

import React, { useState } from "react";
import {
  Send,
  AlertCircle,
  Instagram,
  Facebook,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

export const ShareChallenge = () => {
  const [showError, setShowError] = useState(false);

  const handleCopy = () => {
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  };

  return (
    <section className="relative py-20 md:py-32 bg-[#F0F4FF] overflow-hidden flex flex-col items-center px-4 min-h-screen">
      {/* 🎨 Abstract Background Elements */}
      <div className="absolute top-20 left-[10%] w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-[10%] w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="max-w-5xl w-full text-center relative z-10 flex flex-col items-center">
        {/* 🔥 Floating Badge */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-black text-yellow-400 rounded-full font-black text-xs uppercase tracking-widest shadow-xl transform -rotate-1 hover:rotate-0 transition-transform cursor-default">
          <Sparkles size={16} />
          Challenge Mode Active
        </div>

        {/* 🏆 The Main Stage: Heading & Donkey */}
        <div className="flex flex-col items-center mb-12 relative">
          {/* DONKEY IMAGE - Now positioned as a "Sticker" that doesn't block text */}
          <div className="mb-6 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative w-32 h-32 md:w-44 md:h-44 bg-white border-4 border-black rounded-full p-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <Image
                src="/donk.avif"
                alt="Donkey"
                fill
                className="object-contain p-4 transition-transform group-hover:scale-110 duration-300"
              />
            </div>
            {/* Rank Tag */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 border-2 border-black px-4 py-1 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap">
              <span className="text-black font-black text-sm uppercase">
                Rank: Ultimate Loser
              </span>
            </div>
          </div>

          {/* HEADING - Clean, Massive, and Clear */}
          <h2 className="text-5xl md:text-8xl font-[1000] text-gray-900 leading-none tracking-tighter uppercase">
            Prove your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600">
              Friend is a
            </span>
            <br />
            <span className="relative inline-block mt-2">
              <span className="relative z-10 text-black px-4 italic">
                DONKEY
              </span>
              <div className="absolute inset-x-0 bottom-2 h-6 md:h-10 bg-yellow-300 -z-10 -rotate-1"></div>
            </span>
          </h2>
        </div>

        <p className="text-lg md:text-2xl font-bold text-gray-600 mb-8 max-w-lg mx-auto leading-tight">
          Think they're smart?{" "}
          <span className="text-pink-600">Send the challenge</span> and let the
          world see the truth.
        </p>

        {/* 📱 SOCIAL MEDIA ICONS */}
        <div className="flex gap-6 mb-12">
          {[
            { Icon: Instagram, color: "bg-[#E1306C]", label: "Instagram" },
            { Icon: MessageCircle, color: "bg-[#25D366]", label: "WhatsApp" },
            { Icon: Facebook, color: "bg-[#1877F2]", label: "Facebook" },
          ].map((social, idx) => (
            <button
              key={idx}
              onClick={handleCopy}
              className={`${social.color} group relative p-4 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all`}
            >
              <social.Icon size={32} className="text-white" strokeWidth={3} />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {social.label}
              </span>
            </button>
          ))}
        </div>

        {/* 🔗 Link Sharing Area */}
        <div className="w-full max-w-xl relative">
          {showError && (
            <div className="absolute -top-14 left-0 right-0 flex justify-center z-50 animate-bounce">
              <div className="bg-black text-white text-xs font-black py-2 px-4 rounded-full border-2 border-white flex items-center gap-2">
                <AlertCircle size={14} className="text-yellow-400" />
                WE'RE UPDATING! FOR NOW YOU CAN'T USE THISE LINK
              </div>
            </div>
          )}

          <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-2 md:p-3 rounded-3xl flex flex-col md:flex-row items-center gap-3">
            <div className="flex-1 w-full bg-gray-100 rounded-2xl px-6 py-4 flex items-center gap-3 border-2 border-transparent focus-within:border-black transition-all">
              <span className="text-gray-400 font-bold hidden sm:inline text-xs">
                URL
              </span>
              <input
                readOnly
                value="donkey-game.io/v8291"
                className="bg-transparent w-full font-black text-gray-800 outline-none text-lg"
              />
            </div>
            <button
              onClick={handleCopy}
              className="w-full md:w-auto bg-indigo-600 text-white font-black py-4 px-10 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-2 uppercase tracking-tighter"
            >
              Copy Link <Send size={18} />
            </button>
          </div>
          <p className="mt-6 font-black text-gray-400 uppercase tracking-widest text-[11px] flex items-center justify-center gap-2">
            <span className="w-8 h-[2px] bg-gray-200"></span>
            Spread the fun
            <span className="w-8 h-[2px] bg-gray-200"></span>
          </p>
        </div>
      </div>
    </section>
  );
};
