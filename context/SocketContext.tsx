"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import Pusher from "pusher-js";
import { useAuth } from "./AuthContext";

const SocketContext = createContext<{
  pusher: Pusher | null;
  onlineCount: number;
  recentOpponent: any;
  getChannel: (name: string) => Pusher.Channel | null;
  isConnected: boolean;
}>({
  pusher: null,
  onlineCount: 0,
  recentOpponent: null,
  getChannel: () => null,
  isConnected: false,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [recentOpponent, setRecentOpponent] = useState<any>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const channelsRef = useRef<Record<string, Pusher.Channel>>({});
  const [isConnected, setIsConnected] = useState(false);

  const getChannel = (name: string) => {
    if (!pusherRef.current) return null;
    if (!channelsRef.current[name]) {
      console.log(`🔗 [SocketContext] Subscribing to: ${name}`);
      channelsRef.current[name] = pusherRef.current.subscribe(name);
    }
    return channelsRef.current[name];
  };

  useEffect(() => {
    // 1. If no user, or still loading, or already initialized, STOP.
    if (loading || !user || pusherRef.current) return;

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) return;

    // 2. Initialize Pusher
    const pusherInstance = new Pusher(key, {
      cluster: cluster,
      forceTLS: true,
      enabledTransports: ["ws", "wss"],
      channelAuthorization: {
        endpoint: "/api/pusher/auth",
        transport: "ajax",
      },
    });

    pusherInstance.connection.bind("connected", () => {
      console.log("✅ [SocketContext] Pusher connected!");
      setIsConnected(true);
    });

    pusherInstance.connection.bind("error", (err: any) => {
      // Don't log empty errors or refresh-based disconnects
      if (err?.error?.data?.code === 4004) return;
      console.warn(
        "⚠️ [SocketContext] Connection status:",
        err.message || "reconnecting",
      );
    });

    // 3. Presence Logic (For Live Mode)
    const presenceChannel = pusherInstance.subscribe("presence-online");

    presenceChannel.bind("pusher:subscription_succeeded", (members: any) => {
      setOnlineCount(members.count);
      members.each((member: any) => {
        if (member.id !== String(user._id)) {
          setRecentOpponent({ id: member.id, ...member.info });
        }
      });
    });

    presenceChannel.bind("pusher:member_added", (member: any) => {
      setOnlineCount((prev) => prev + 1);
      setRecentOpponent(member.info);
    });

    presenceChannel.bind("pusher:member_removed", () => {
      setOnlineCount((prev) => Math.max(0, prev - 1));
    });

    pusherRef.current = pusherInstance;
    setPusher(pusherInstance);

    return () => {
      if (pusherRef.current) {
        // Cleanup all channels
        Object.keys(channelsRef.current).forEach((name) => {
          pusherRef.current?.unsubscribe(name);
        });
        channelsRef.current = {};
        pusherRef.current.unsubscribe("presence-online");
        pusherInstance.disconnect();
        pusherRef.current = null;
        setPusher(null);
        setIsConnected(false);
      }
    };
  }, [user?._id, loading]); // Using user._id is safer for the dependency array

  return (
    <SocketContext.Provider
      value={{ pusher, onlineCount, recentOpponent, getChannel, isConnected }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
