import React from "react";
import Image from "next/image";

const Batches = () => {
  return (
    <section className="relative py-16 bg-[#FDF2F8] overflow-hidden border-y-4 border-black/5">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-pink-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-300 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* 🔥 Modernized Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-[1000] text-gray-900 uppercase italic tracking-tighter leading-none mb-4">
            The Ultimate <br />
            <span className="text-pink-600">Status </span>
            Check
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs md:text-sm">
            Will they rise as a leader or fall as a donkey?
          </p>
        </div>

        {/* 🐴 VS 🫏 - Interactive Comparison */}
        <div className="flex flex-row items-center justify-center gap-4 md:gap-12">
          {/* Winner: Horse */}
          <div className="flex flex-col items-center group flex-1 max-w-[160px]">
            <div className="relative w-24 h-24 md:w-36 md:h-36 rounded-2xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(34,197,94,1)] flex items-center justify-center group-hover:-rotate-3 transition-all duration-300">
              <Image
                src="/horse.avif"
                alt="Winner Horse"
                width={150}
                height={150}
                quality={75}
                className="object-contain p-2"
                priority
              />
              <div className="absolute -top-3 -right-3 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded border-2 border-black rotate-12">
                ELITE
              </div>
            </div>

            <div className="mt-6 text-center">
              <span className="inline-block bg-green-100 text-green-700 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full mb-2 border border-green-200">
                Champion
              </span>
              <h4 className="text-xl md:text-2xl font-black text-gray-800 uppercase italic">
                Horse
              </h4>
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-black rounded-full flex items-center justify-center border-4 border-white shadow-lg rotate-12">
              <span className="text-white font-black italic text-sm md:text-xl">
                VS
              </span>
            </div>
          </div>

          {/* Loser: Donkey */}
          <div className="flex flex-col items-center group flex-1 max-w-[160px]">
            <div className="relative w-24 h-24 md:w-36 md:h-36 rounded-2xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(239,68,68,1)] flex items-center justify-center group-hover:rotate-3 transition-all duration-300">
              <Image
                src="/donk.avif"
                alt="Loser Donkey"
                width={150}
                height={150}
                quality={75}
                className="object-contain p-2 grayscale group-hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded border-2 border-black -rotate-12">
                LOSER
              </div>
            </div>

            <div className="mt-6 text-center">
              <span className="inline-block bg-red-100 text-red-700 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full mb-2 border border-red-200">
                Disgrace
              </span>
              <h4 className="text-xl md:text-2xl font-black text-gray-800 uppercase italic">
                Donkey
              </h4>
            </div>
          </div>
        </div>

        {/* 📜 Rules Card - Mobile Responsive */}
        <div className="mt-16 max-w-lg mx-auto">
          <div className="relative group">
            {/* Background Shadow Layer */}
            <div className="absolute inset-0 bg-black rounded-3xl translate-x-2 translate-y-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-all"></div>

            <div className="relative bg-white rounded-3xl border-4 border-black p-6 md:p-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-2 w-2 bg-pink-500 rounded-full animate-ping"></div>
                <h5 className="text-lg md:text-xl font-black uppercase tracking-tighter text-gray-900">
                  The Loser's Fate
                </h5>
                <div className="h-2 w-2 bg-pink-500 rounded-full animate-ping"></div>
              </div>

              <p className="text-center text-sm md:text-lg font-bold text-gray-700 leading-relaxed">
                If they fail the challenge, they are officially a
                <span className="text-red-500 underline decoration-4 underline-offset-4 ml-1">
                  DONKEY
                </span>
                . They must face the
                <span className="text-pink-500 italic"> Truth</span> or accept
                the
                <span className="text-blue-500 italic"> Dare</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Batches;
