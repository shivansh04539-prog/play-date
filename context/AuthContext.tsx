"use client";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({
  user: null,
  loading: true,
  onlineUsers: [],
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // 1. Function to check the current user session (updates our lastActive)
  const checkUser = async () => {
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error("❌ AUTH: Session check failed", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Function to fetch EVERYONE who is online
  const fetchOnlineUsers = async () => {
    try {
      const res = await fetch("/api/online");
      const data = await res.json();
      setOnlineUsers(data.users || []);
    } catch (err) {
      console.error("❌ AUTH: Could not fetch online users", err);
    }
  };

  useEffect(() => {
    // RUN IMMEDIATELY ON START
    checkUser();
    fetchOnlineUsers();

    // HEARTBEAT: Every 3 minutes update my status & refresh the online list
    const heartbeat = setInterval(() => {
      checkUser();
      fetchOnlineUsers();
    }, 180000); // 3 Minutes

    return () => clearInterval(heartbeat);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, onlineUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
