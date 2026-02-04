"use client";

import ProfileView from "@/components/(profile)/ProfileView";
import SignupPage from "@/components/(profile)/Signupform";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <Loader2 className="animate-spin text-pink-500 w-10 h-10" />
        <p className="mt-4 font-bold text-slate-400">Loading your profile...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {user ? <ProfileView user={user} /> : <SignupPage />}
    </main>
  );
}
