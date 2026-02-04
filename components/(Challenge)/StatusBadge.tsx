import React from "react";

// Import with an alias to avoid the "new Image()" conflict
import NextImage from "next/image";

interface StatusBadgeProps {
  status: "HORSE" | "DONKEY" | string;
  size?: "sm" | "md";
}

export const StatusBadge = ({ status, size = "sm" }: StatusBadgeProps) => {
  // Check if status is Cheetah (Horse)
  const isHorse = status?.toUpperCase() === "HORSE";

  const containerSize = size === "md" ? "w-20 h-20" : "w-12 h-12";
  const padding = size === "md" ? "p-2" : "p-1";

  return (
    <div className="flex flex-col items-center">
      <div
        className={`${containerSize} relative rounded-full border-2 border-white shadow-xl overflow-hidden bg-white transition-transform duration-300 hover:scale-110`}
      >
        <NextImage
          src={isHorse ? "/horse.avif" : "/donk.avif"}
          alt={isHorse ? "Horse" : "Donkey"}
          fill
          className={`object-contain ${padding}`}
          priority
          sizes="100px"
        />
      </div>
    </div>
  );
};
