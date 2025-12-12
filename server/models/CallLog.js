import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    callerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["audio", "video"], required: true },

    status: { type: String, enum: ["missed", "incoming", "outgoing", "ended"], default: "ended" },

    duration: { type: Number, default: 0 }, // seconds
  },
  { timestamps: true }
);

export default mongoose.model("CallLog", callSchema);
