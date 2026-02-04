"use client";

import { useState } from "react";
import { Edit3, Mic, ShieldCheck, MapPin, User } from "lucide-react";
import ActivityTab from "./ActivityTab";
import { GamingHistoryTab } from "./GamingHistoryTab";
import EditProfileModal from "../(ProfileEdit)/ProfileEditor";
import VoiceRecorderModal from "../(ProfileEdit)/VoiceRecorder";

import NextImage from "next/image";

export default function ProfileView({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("activity");
  const [userData, setUserData] = useState(user);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const activityData = {
    challenges: [
      {
        id: 1,
        name: "Rahul",
        time: "2:00 PM",
        task: "Truth or Dare?",
        type: "Challenge",
      },
      {
        id: 2,
        name: "Sneha",
        time: "5:30 PM",
        task: "Voice Note Battle",
        type: "Challenge",
      },
    ],
    likes: [
      {
        id: 1,
        name: "Priya",
        time: "Just now",
        msg: "Liked your profile",
        type: "Like",
      },
      {
        id: 2,
        name: "Ananya",
        time: "2h ago",
        msg: "Interested in a match",
        type: "Like",
      },
    ],
    history: [
      {
        id: 1,
        opponent: "Sarah Jenkins",
        game: "Truth or Dare",
        date: "Jan 12, 2024",
        result: "WON",
      },
      {
        id: 2,
        opponent: "Mike Ross",
        game: "Trivia Blitz",
        date: "Jan 10, 2024",
        result: "DRAW",
      },
    ],
  };

  const handleVoiceUpload = async (base64: string) => {
    try {
      const res = await fetch("/api/voice-upload", {
        method: "POST", // Using POST for creation/upload
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voiceBase64: base64 }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state so the button changes to "Update Voice" immediately
        setUserData(data.user);
      }
    } catch (err) {
      console.error("Voice upload failed", err);
    }
  };
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* 1. TOP HEADER */}
      <div className="bg-white px-6 pt-12 pb-6 rounded-b-[40px] shadow-sm border-b border-slate-100 relative">
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="absolute top-6 right-6 p-2.5 bg-slate-50 rounded-xl text-slate-600 border border-slate-100 active:scale-95 transition-all"
        >
          <Edit3 size={18} />
        </button>

        {isEditModalOpen && (
          <EditProfileModal
            user={userData}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={(newData) => setUserData({ ...userData, ...newData })}
          />
        )}

        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-[32px] bg-slate-100 border-4 border-white shadow-xl overflow-hidden">
              {user.photo ? (
                <NextImage
                  src={user.photo}
                  alt="Profile"
                  width={96}
                  height={96}
                  priority
                  className="object-cover w-full h-full"
                />
              ) : (
                <User className="w-10 h-10 text-slate-300" />
              )}
            </div>
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full border-4 border-white shadow-md">
                <ShieldCheck size={14} fill="currentColor" />
              </div>
            )}
          </div>

          <div className="text-center mt-4">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {user.name}, {user.age}
            </h2>
            <p className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
              <MapPin size={12} className="text-pink-500" />{" "}
              {user.district || "Saharanpur"}
            </p>
          </div>

          <div className="mt-6 flex gap-3 w-full max-w-xs">
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className={`flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 font-black text-xs shadow-sm active:scale-95 transition-all ${
                userData.voiceIntro
                  ? "bg-white text-slate-800 border-2 border-slate-100"
                  : "bg-slate-900 text-white"
              }`}
            >
              <Mic
                size={16}
                className={userData.voiceIntro ? "text-pink-500" : ""}
              />
              {userData.voiceIntro ? "Update Voice" : "Voice Intro"}
            </button>

            {/* Add the Modal at the bottom of the component */}
            {isVoiceModalOpen && (
              <VoiceRecorderModal
                onClose={() => setIsVoiceModalOpen(false)}
                onUpload={handleVoiceUpload}
              />
            )}

            <button className="flex-1 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center gap-2 font-black text-xs border border-blue-100 active:scale-95 transition-all">
              <ShieldCheck size={16} /> Verify
            </button>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC TABS */}
      <div className="px-5 mt-6">
        <div className="flex gap-8 border-b border-slate-200">
          {["activity", "gaming"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs font-black uppercase tracking-wider transition-all relative ${
                activeTab === tab ? "text-blue-600" : "text-slate-400"
              }`}
            >
              {tab === "activity" ? "Activity" : "Gaming History"}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CONDITIONAL CONTENT */}
      <div className="px-5 mt-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === "activity" ? (
          <ActivityTab
          // Removed Likes/Challenges props as ActivityTab now fetches its own data
          />
        ) : (
          <GamingHistoryTab currentUserId={user._id} />
        )}
      </div>
    </div>
  );
}
