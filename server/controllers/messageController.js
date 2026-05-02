import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";
import mongoose from "mongoose";

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

    res.json({ success: true, messages: msgs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load conversation" });
  }
};

/**
 * 🚀 PRODUCTION CLEAN: Optimized sending with media handling
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
        const up = await cloudinary.uploader.upload(file, {
          resource_type: "auto",
          folder: "signature_chat_assets"
        });
        fileUrl = up.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError.message);
        return res.status(500).json({ success: false, message: "Media engine upload failed" });
      }
    }
 
    const msg = await Message.create({
      senderId,
      receiverId,
      text,
      file: fileUrl,
      fileName,
      replyTo,
      fileType: fileType || (file ? (file.startsWith("data:video") ? "video" : "image") : "text"),
    });

    // Populate reply info before emitting to socket
    const populatedMsg = await Message.findById(msg._id).populate("replyTo", "text file fileType");
 
    const receiverSocketIds = userSocketMap[receiverId];
    if (receiverSocketIds) {
      receiverSocketIds.forEach(id => io.to(id).emit("newMessage", populatedMsg));
    }
 
    res.status(201).json({ success: true, newMessage: populatedMsg });
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
        const publicId = `signature_chat_assets/${parts[parts.length - 1].split(".")[0]}`;
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
