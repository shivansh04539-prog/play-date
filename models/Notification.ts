  import mongoose from "mongoose";

  const NotificationSchema = new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      type: {
        type: String,
        enum: ["CHALLENGE", "LIKE"],
        required: true,
      },

      challengeId: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge" }, // Removed required: true in case of Likes
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      seen: { type: Boolean, default: false },
    },
    { timestamps: true },
  );

  export default mongoose.models.Notification ||
    mongoose.model("Notification", NotificationSchema);
