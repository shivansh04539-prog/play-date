import mongoose, { Schema, model, models } from "mongoose";

const ChallengeSchema = new Schema({
  challengerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  challengerMoves: { type: [String], default: [] },
  receiverMoves: { type: [String], default: [] },
  status: {
    type: String,
    enum: ["pending", "accepted", "completed"],
    default: "pending",
  },
  mode: { type: String, enum: ["recorded", "live"], default: "recorded" },

  // 🔥 ADD THESE 3 FIELDS BELOW
  roundEndsAt: { type: Number, default: null },
  currentRound: { type: Number, default: 1 },
  scores: {
    player1: { type: Number, default: 0 },
    player2: { type: Number, default: 0 },
  },

  result: {
    winnerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    finalScore: { player: Number, opponent: Number },
  },
  createdAt: { type: Date, default: Date.now, expires: 86400 },
});

ChallengeSchema.index({ challengerId: 1, status: 1 });
ChallengeSchema.index({ receiverId: 1, status: 1 });
ChallengeSchema.index({ status: 1, createdAt: -1 });

const Challenge = models.Challenge || model("Challenge", ChallengeSchema);
export default Challenge;
