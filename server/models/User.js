import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "" },
    bio: { type: String, default: "" },

    lastSeen: { type: Date, default: Date.now },

    // Privacy Settings
    privacy: {
      lastSeenVisible: { type: String, enum: ["everyone", "contacts", "nobody"], default: "everyone" },
      profilePhotoVisible: { type: String, enum: ["everyone", "contacts", "nobody"], default: "everyone" },
      readReceipts: { type: Boolean, default: true },
      onlineStatus: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
