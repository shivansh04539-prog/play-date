"use client";
import {
  Gamepad2,
  MessageCircle,
  Sparkles,
  Heart,
  Trophy,
  Users,
} from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: Gamepad2,
      title: "Play Stone Paper Scissors",
      description: "Start a game and get matched with someone special",
      color: "bg-blue-600",
    },
    {
      icon: MessageCircle,
      title: "Chat & Connect",
      description: "Use voice messages and chat while playing",
      color: "bg-purple-500",
    },
    {
      icon: Sparkles,
      title: "AI Assistance",
      description: "Get smart suggestions for perfect conversations",
      color: "bg-pink-500",
    },
    {
      icon: Heart,
      title: "Find Your Match",
      description: "Win the game and boost your compatibility score",
      color: "bg-red-500",
    },
  ];

  const stats = [
    {
      icon: Trophy,
      value: "1500+",
      label: "Games Played",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      icon: Heart,
      value: "300+",
      label: "Happy Matches",
      color: "text-pink-500",
      bgColor: "bg-pink-50",
    },
    {
      icon: Users,
      value: "250+",
      label: "Active Players",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <section className="py-20 px-6 bg-[#fdf2f8]">
      {/* --- HOW IT WORKS SECTION --- */}
      <div className="max-w-7xl mx-auto text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          How It Works
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Connect through a classic game of strategy and luck. Our platform
          makes meeting new people fun and effortless.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group bg-white rounded-[32px] p-8 flex flex-col items-start text-left shadow-xl shadow-pink-200/20 border border-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-out"
            >
              <div
                className={`${step.color} p-4 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}
              >
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* --- STATS SECTION --- */}
      <div className="max-w-7xl mx-auto">
        {/* 1. Added 'flex overflow-x-auto' for swiping on mobile.
           2. Added inline style to hide the scrollbar visually while keeping the swipe function.
        */}
        <div
          className="flex overflow-x-auto pb-4 gap-6 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-8"
          style={{
            scrollbarWidth: "none" /* Firefox */,
            msOverflowStyle: "none" /* IE and Edge */,
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Webkit scrollbar hide for Chrome/Safari */}
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {stats.map((stat, index) => (
            <div
              key={index}
              className="min-w-[85%] sm:min-w-[45%] md:min-w-0 snap-center bg-white rounded-[35px] p-8 flex flex-col items-center shadow-lg shadow-pink-200/30 border border-white hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`${stat.bgColor} p-4 rounded-full mb-4`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div
                className={`text-4xl md:text-5xl font-black ${stat.color} mb-2 tracking-tight`}
              >
                {stat.value}
              </div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] md:text-xs text-center">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Subtle hint text */}
        <p className="text-center text-pink-400/40 text-[10px] font-medium mt-4 md:hidden">
          Slide to view more
        </p>
      </div>
    </section>
  );
}
