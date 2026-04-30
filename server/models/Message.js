import mongoose from "mongoose";

const msgSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: String,
    file: String,
    fileName: String,
    fileType: { type: String, enum: ["text", "image", "video", "audio", "file", "document", "poll", "location"], default: "text" },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Message", msgSchema);
