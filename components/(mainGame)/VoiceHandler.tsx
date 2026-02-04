"use client";

import { useEffect, useState, useRef } from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";

interface VoiceProps {
  matchId: string;
  userId: string;
  onConnected: () => void;
}

export default function VoiceHandler({
  matchId,
  userId,
  onConnected,
}: VoiceProps) {
  const [token, setToken] = useState<string>("");
  const [error, setError] = useState<string>("");
  const hasConnectedRef = useRef(false);
  const tokenFetchedRef = useRef(false);

  useEffect(() => {
    if (tokenFetchedRef.current) return;

    const getToken = async () => {
      try {
        console.log("🎤 Voice: Fetching token for", { matchId, userId });
        tokenFetchedRef.current = true;

        const resp = await fetch(
          `/api/livekit/token?room=${matchId}&identity=${userId}`,
        );

        console.log("🎤 Voice: Response status:", resp.status);

        const data = await resp.json();
        console.log("🎤 Voice: Response data:", data);

        if (data.token) {
          console.log("✅ Voice: Token received");
          setToken(data.token);
          setError("");
        } else {
          console.error("❌ Voice: No token in response:", data);
          setError(data.error || "No token received");
        }
      } catch (e: any) {
        console.error("❌ Voice: Failed to get token", e);
        setError(e.message || "Failed to fetch token");
        tokenFetchedRef.current = false;
      }
    };

    getToken();
  }, [matchId, userId]);

  const handleConnected = () => {
    if (hasConnectedRef.current) return;
    hasConnectedRef.current = true;
    console.log("🎤 Voice: Connected successfully");
    onConnected();
  };

  if (error) {
    console.error("🎤 Voice Error:", error);
    // Don't render anything on error - voice just won't work
    return null;
  }

  if (!token) {
    console.log("🎤 Voice: Waiting for token...");
    return null;
  }

  console.log(
    "🎤 Voice: Connecting with token, server:",
    process.env.NEXT_PUBLIC_LIVEKIT_URL,
  );

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={token}
      connect={true}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      onConnected={handleConnected}
      onDisconnected={() => {
        console.log("🎤 Voice: Disconnected");
        hasConnectedRef.current = false;
      }}
      onError={(error: Error) => {
        console.error("🎤 Voice: Connection error:", error);
      }}
      options={{
        audioCaptureDefaults: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
        adaptiveStream: false,
      }}
    >
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
