import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { io, userSocketMap } from "../server.js";

// CREATE CHAT BETWEEN TWO USERS
export const createChat = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.json({ success: false, message: "receiverId is required" });
    }

    // Check if chat already exists
    let existingChat = await Chat.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (existingChat) {
      return res.json({
        success: true,
        chat: existingChat,
        message: "Chat already exists",
      });
    }

    // Create new chat
    const newChat = await Chat.create({
      members: [senderId, receiverId],
    });

    return res.json({
      success: true,
      chat: newChat,
      message: "Chat created successfully",
    });
  } catch (error) {
    console.log("Create Chat Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// FETCH ALL CHATS FOR LOGGED-IN USER
export const userChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      members: { $in: [userId] },
    })
      .populate("members", "-password")
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      chats,
    });
  } catch (error) {
    console.log("User Chats Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// SEND MESSAGE IN A CHAT (Socket + DB Support)
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { chatId, text, image } = req.body;

    if (!chatId) {
      return res.json({ success: false, message: "chatId is required" });
    }

    // Save message in DB
    const msg = await Message.create({
      chatId,
      senderId,
      text,
      image,
    });

    // Update chat last updated timestamp
    await Chat.findByIdAndUpdate(chatId, { updatedAt: Date.now() });

    // Send to all connected users in the room
    io.to(chatId).emit("newMessage", msg);

    // Also notify receiver (optional)
    const chat = await Chat.findById(chatId);
    const receiverId = chat.members.find((id) => id.toString() !== senderId.toString());

    const receiverSocket = userSocketMap[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("messageNotification", {
        chatId,
        message: msg,
      });
    }

    res.json({
      success: true,
      message: msg,
    });
  } catch (error) {
    console.log("Send Message Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// GET MESSAGES OF A CHAT
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.log("Get Messages Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};
