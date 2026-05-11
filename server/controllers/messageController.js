import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../lib/socket.js";
import mongoose from "mongoose";
import { encrypt, decrypt } from "../lib/encryption.js";
import { CLOUDINARY_FOLDERS } from "../config/constants.js";

/**
 * 🔐 ENCRYPTED FIELD CONSTANTS
 * These are the Message fields that get encrypted at rest
 */
const ENCRYPTED_MSG_FIELDS = ["text"];

/**
 * Decrypt a single message document for API response
 */
const decryptMessage = (msg) => {
  const obj = msg.toObject ? msg.toObject() : { ...msg };
  if (obj.text) obj.text = decrypt(obj.text);
  // Decrypt nested reply data too
  if (obj.replyTo && obj.replyTo.text) {
    obj.replyTo.text = decrypt(obj.replyTo.text);
  }
  return obj;
};

/**
 * 🚀 PRODUCTION OPTIMIZED: Get users with unseen counts in ONE query
 * Uses MongoDB Aggregation to avoid N+1 query performance issues
 */
export const getUsersForSidebar = async (req, res) => {
  try {
    const myId = req.user._id;

    // 1. Get all users except self
    const users = await User.find({ _id: { $ne: myId } }).select("-password");

    // 2. Aggregate unread counts in one pass
    const unreadCounts = await Message.aggregate([
      { 
        $match: { 
          receiverId: new mongoose.Types.ObjectId(myId), 
          seen: false 
        } 
      },
      { 
        $group: { 
          _id: "$senderId", 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Map counts to a clean object
    const unseen = {};
    unreadCounts.forEach(item => {
      unseen[item._id] = item.count;
    });

    res.json({ success: true, users, unseenMessages: unseen });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch contacts" });
  }
};

/**
 * 🚀 PRODUCTION READY: Fetch chat history with threaded replies
 * 🔐 All messages are decrypted before sending to client
 */
export const getMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    const otherId = req.params.id;

    const msgs = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherId },
        { senderId: otherId, receiverId: myId },
      ],
    })
    .sort({ createdAt: 1 })
    .populate("replyTo", "text file fileType"); // Deep-link replies for UI

    // Bulk update seen status
    await Message.updateMany(
      { senderId: otherId, receiverId: myId, seen: false },
      { seen: true }
    );

    // 🔐 Decrypt all messages before sending
    const decryptedMsgs = msgs.map(decryptMessage);

    res.json({ success: true, messages: decryptedMsgs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load conversation" });
  }
};

/**
 * 🚀 PRODUCTION CLEAN: Optimized sending with media handling
 * 🔐 Message text is encrypted before storage
 */
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;
    const { text, file, fileName, fileType, replyTo } = req.body;
 
    let fileUrl = null;
    // Skip upload for text-only message types (location, poll)
    if (file && fileType !== "location" && fileType !== "poll" && fileType !== "text") {
      try {
        // 🚀 PRO TIP: Cloudinary needs correct resource_type for different files
        // "image" for photos, "video" for audio/video (.webm), and "auto" for everything else (PDFs, docs)
        let resourceType = "auto";
        
        if (fileType === "image" || file.startsWith("data:image")) {
          resourceType = "image";
        } else if (fileType === "audio" || fileType === "video" || file.startsWith("data:audio") || file.startsWith("data:video")) {
          resourceType = "video";
        } else {
          // For documents (PDF, Docx), "auto" is safest as it detects the correct mime type
          resourceType = "auto";
        }
        
        console.log(`📤 Uploading ${fileType} to Cloudinary (Explicit Type: ${resourceType})...`);

        const up = await cloudinary.uploader.upload(file, {
          resource_type: resourceType,
          folder: CLOUDINARY_FOLDERS.ASSETS,
          timeout: 60000 // 60s timeout for mobile uploads
        });
        fileUrl = up.secure_url;
      } catch (uploadError) {
        console.error("❌ Cloudinary upload error:", uploadError.message || uploadError);
        const errorDetail = uploadError.message || "Unknown Cloudinary Error";
        return res.status(500).json({ 
          success: false, 
          message: `Media engine upload failed: ${errorDetail}` 
        });
      }
    }

    // 🔐 Encrypt message text before storing in database
    const encryptedText = text ? encrypt(text) : null;
 
    const msg = await Message.create({
      senderId,
      receiverId,
      text: encryptedText,
      file: fileUrl,
      fileName,
      replyTo,
      fileType: fileType || (file ? (file.startsWith("data:audio") ? "audio" : file.startsWith("data:video") ? "video" : "image") : "text"),
    });

    // Populate reply info before emitting to socket
    const populatedMsg = await Message.findById(msg._id).populate("replyTo", "text file fileType");

    // 🔐 Decrypt before sending to clients (they should never see encrypted data)
    const decryptedMsg = decryptMessage(populatedMsg);
 
    const receiverSocketIds = userSocketMap[receiverId];
    if (receiverSocketIds) {
      receiverSocketIds.forEach(id => io.to(id).emit("newMessage", decryptedMsg));
    }
 
    res.status(201).json({ success: true, newMessage: decryptedMsg });
  } catch (err) {
    res.status(500).json({ success: false, message: "Message delivery failed" });
  }
};
 
/**
 * 🚀 SECURE DELETE: Clean up both DB and Cloud Assets
 */
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const myId = req.user._id;

    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ success: false, message: "Message not found" });

    if (msg.senderId.toString() !== myId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized action" });
    }
 
    if (msg.file) {
      try {
        const parts = msg.file.split("/");
        const publicId = `${CLOUDINARY_FOLDERS.ASSETS}/${parts[parts.length - 1].split(".")[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        // Non-fatal, proceed to DB deletion
      }
    }
 
    await Message.findByIdAndDelete(id);
    res.json({ success: true, message: "Trace removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: "System error during deletion" });
  }
};

/**
 * 📊 EXCLUSIVE VOTING: Handle poll votes with user tracking
 * 🔐 Ensures one user per option with automatic deselection
 */
export const votePoll = async (req, res) => {
  try {
    const { id } = req.params;
    const { optionIndex } = req.body;
    const userId = req.user._id.toString();

    const msg = await Message.findById(id);
    if (!msg || msg.fileType !== "poll") {
      return res.status(404).json({ success: false, message: "Poll not found" });
    }

    // 🔐 Decrypt to modify the poll state
    let pollData;
    try {
      pollData = JSON.parse(decrypt(msg.text));
    } catch (e) {
      return res.status(500).json({ success: false, message: "Corrupted poll data" });
    }

    // Standardize structure to use voters array instead of just a count
    pollData.options = pollData.options.map(opt => ({
      text: opt.text,
      voters: opt.voters || []
    }));

    // 🚫 Radio-button behavior: Remove user from all previous options
    pollData.options.forEach(opt => {
      opt.voters = opt.voters.filter(vId => vId !== userId);
    });

    // ✅ Add user to the newly selected option
    if (pollData.options[optionIndex]) {
      pollData.options[optionIndex].voters.push(userId);
    }

    // 🔐 Re-encrypt the updated poll data for secure storage
    msg.text = encrypt(JSON.stringify(pollData));
    await msg.save();

    // 🔐 Prepare decrypted version for real-time broadcast
    const updatedMsg = decryptMessage(msg);

    // 🔥 Real-time sync across all clients
    io.emit("messageUpdated", updatedMsg);

    res.json({ success: true, message: updatedMsg });
  } catch (err) {
    console.error("Poll vote error:", err);
    res.status(500).json({ success: false, message: "Voting system failure" });
  }
};
