import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// Get users list except self
export const getUsersForSidebar = async (req, res) => {
  const myId = req.user._id;

  const users = await User.find({ _id: { $ne: myId } }).select("-password");

  // unseen counts
  const unseen = {};

  for (let user of users) {
    unseen[user._id] = await Message.countDocuments({
      senderId: user._id,
      receiverId: myId,
      seen: false,
    });
  }

  res.json({ success: true, users, unseenMessages: unseen });
};

// Get chat messages
export const getMessages = async (req, res) => {
  const myId = req.user._id;
  const otherId = req.params.id;

  const msgs = await Message.find({
    $or: [
      { senderId: myId, receiverId: otherId },
      { senderId: otherId, receiverId: myId },
    ],
  }).sort({ createdAt: 1 });

  // mark seen
  await Message.updateMany(
    { senderId: otherId, receiverId: myId },
    { seen: true }
  );

  res.json({ success: true, messages: msgs });
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;
    const { text, image } = req.body;

    let imgUrl = null;
    if (image) {
      const up = await cloudinary.uploader.upload(image);
      imgUrl = up.secure_url;
    }

    const msg = await Message.create({
      senderId,
      receiverId,
      text,
      image: imgUrl,
    });

    // Send via websocket
    const receiverSocket = userSocketMap[receiverId];
    if (receiverSocket) io.to(receiverSocket).emit("newMessage", msg);

    res.json({ success: true, newMessage: msg });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
