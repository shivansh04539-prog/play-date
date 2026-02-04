"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function ActiveTracker() {
  const pathname = usePathname();
  const [isIdle, setIsIdle] = useState(false);

  const lastHeartbeatRef = useRef<number>(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- 1. IDLE DETECTION LOGIC ---
  const handleActivity = () => {
    // If the user was idle and comes back, stop being idle
    if (isIdle) {
      setIsIdle(false);
      console.log("☀️ User is active again.");
    }

    // Reset the 15-minute countdown every time they move/type
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    idleTimerRef.current = setTimeout(
      () => {
        setIsIdle(true);
        console.log("🌙 User is idle (15m). Heartbeat paused.");
      },
      15 * 60 * 1000,
    ); // 15 Minutes
  };

  useEffect(() => {
    // Track mouse, keyboard, and touch (for mobile users)
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keypress", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("scroll", handleActivity);

    // Initial start
    handleActivity();

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keypress", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isIdle]);

  // --- 2. HEARTBEAT LOGIC ---
  useEffect(() => {
    // STOP heartbeat if user is idle (away from computer)
    if (isIdle) return;

    // Clear previous debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Throttle: Only send heartbeat if last one was > 5 seconds ago
    const now = Date.now();
    const timeSinceLastHeartbeat = now - lastHeartbeatRef.current;

    if (timeSinceLastHeartbeat < 5000) {
      return;
    }

    // Debounce: Wait 2 seconds after navigation before sending
    debounceRef.current = setTimeout(() => {
      fetch("/api/social/heartbeat", { method: "POST" })
        .then((res) => {
          if (res.ok) {
            lastHeartbeatRef.current = Date.now();
          }
        })
        .catch((err) => {
          console.warn("Heartbeat failed:", err);
        });
    }, 2000);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [pathname, isIdle]); // Runs when page changes OR when user returns from idle

  return null;
}
