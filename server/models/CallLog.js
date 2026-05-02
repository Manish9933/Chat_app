import mongoose from "mongoose";

/**
 * 🔐 Call Log Schema — Encrypted at Rest
 * 
 * Fields `type` and `status` are stored as AES-256-GCM encrypted strings.
 * They are decrypted server-side before being sent to clients.
 * 
 * In the database, these fields look like:
 *   "a1b2c3...:d4e5f6...:7a8b9c..."  (iv:authTag:ciphertext)
 * 
 * But the API always returns plaintext values like "audio", "video", "ended", etc.
 */
const callSchema = new mongoose.Schema(
  {
    callerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // 🔐 Stored as encrypted ciphertext (no enum validation — encrypted values won't match)
    type: { type: String, required: true },
    status: { type: String, default: "ended" },

    duration: { type: Number, default: 0 }, // seconds
  },
  { timestamps: true }
);

export default mongoose.model("CallLog", callSchema);
