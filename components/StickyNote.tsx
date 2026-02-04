// components/StickyNote.tsx
import React from "react";

interface StickyNoteProps {
  text: string;
}

const StickyNote = ({ text }: StickyNoteProps) => {
  return (
    /* We use inline-block so it only takes up as much space as the text needs */
    <div className="inline-block mt-4 select-none">
      <div
        className="relative bg-[#FFF740] px-4 py-2 shadow-md transform -rotate-3 hover:rotate-0 transition-all duration-300 border-l-4 border-black/5 min-w-[120px]"
        style={{
          clipPath: "polygon(0% 0%, 100% 0%, 100% 85%, 90% 100%, 0% 100%)",
        }}
      >
        {/* Smaller Tape/Pin */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 bg-white/60 backdrop-blur-[1px] rotate-6 border border-white/30 shadow-sm" />

        <p className="text-[#333] text-[13px] font-bold tracking-tight leading-none text-center">
          {text}
        </p>

        {/* Texture */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />
      </div>
    </div>
  );
};

export default StickyNote;
