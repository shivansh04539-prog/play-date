import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  firebaseUid: { type: String, unique: true }, // Critical for linking
  password: { type: String },
  phone: { type: String },
  age: { type: Number },
  country: { type: String, default: "India" },
  state: { type: String },
  district: { type: String },
  city: { type: String },
  photo: { type: String },
  aadhaarCard: { type: String },
  voiceIntro: { type: String },
  bio: { type: String, default: "Hey! Let's play." },
  isVerified: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },

  // ADD NEW BATCHES
  statusBadge: {
    type: String,
    enum: ["HORSE", "DONKEY"],
    default: "HORSE", // New players start fast!
  },
  // donkeyTitle: { type: String, default: "" },
  cheetahCount: { type: Number, default: 0 },
});

// --- ADD THIS LINE RIGHT HERE ---
// This makes sorting by lastActive -1 (Newest First) lightning fast.
UserSchema.index({ lastActive: -1 });
// --------------------------------

const User = models.User || model("User", UserSchema);
export default User;
