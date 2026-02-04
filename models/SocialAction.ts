import mongoose, { Schema, model, models } from "mongoose";

const SocialActionSchema = new Schema({
  // Who performed the action (You)
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  // Who received the action (The person you liked)
  receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  // Type of action: 'LIKE', 'CHALLENGE', 'FOLLOW'
  type: { type: String, enum: ["LIKE", "CHALLENGE", "VIEW"], default: "LIKE" }, // Added VIEW
  // Status for challenges: 'PENDING', 'ACCEPTED', 'DECLINED'
  status: { type: String, default: "PENDING" },
  createdAt: { type: Date, default: Date.now },
});

// Optimization: Indexing makes searching for notifications very fast
SocialActionSchema.index({ receiverId: 1, type: 1, createdAt: -1 });

const SocialAction =
  models.SocialAction || model("SocialAction", SocialActionSchema);
export default SocialAction;
