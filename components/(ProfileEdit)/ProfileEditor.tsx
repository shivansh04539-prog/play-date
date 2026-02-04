"use client";

import { useState, useRef } from "react";
import { X, Camera, Loader2, User } from "lucide-react";

export default function EditProfileModal({
  user,
  onClose,
  onUpdate,
}: {
  user: any;
  onClose: () => void;
  onUpdate: (updatedData: any) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    age: user?.age || "",
    bio: user?.bio || "",
    district: user?.district || "",
    state: user?.state || "",
    photo: user?.photo || null,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        onUpdate(data.user);
        onClose();
      }
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-black text-slate-800">Edit Profile</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSave}
          className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
        >
          {/* Avatar Edit Section */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-[28px] bg-slate-100 overflow-hidden border-4 border-slate-50 shadow-inner">
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    className="w-full h-full object-cover"
                    alt="Profile"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="text-slate-300" size={32} />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-pink-500 text-white p-2 rounded-xl shadow-lg border-2 border-white hover:bg-pink-600 transition-colors"
              >
                <Camera size={16} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">
                Display Name
              </label>
              <input
                className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-none outline-pink-400 text-slate-800 font-medium"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">
                  Age
                </label>
                <input
                  type="number"
                  className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-none outline-pink-400 text-slate-800 font-medium"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">
                  Location
                </label>
                <input
                  className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-none outline-pink-400 text-slate-800 font-medium"
                  value={formData.district}
                  onChange={(e) =>
                    setFormData({ ...formData, district: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">
                About Me (Bio)
              </label>
              <textarea
                placeholder="Tell others what you like..."
                rows={3}
                className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-pink-400 text-slate-800 font-medium resize-none"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
              />
            </div>
          </div>

          <button
            disabled={isSaving}
            type="submit"
            className="w-full h-14 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-black rounded-2xl shadow-lg shadow-pink-100 flex items-center justify-center gap-2 active:scale-95 transition-all mt-4"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
