import mongoose from "mongoose";

const msgSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: String,
    image: String,
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Message", msgSchema);
