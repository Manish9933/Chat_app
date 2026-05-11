import { Server } from "socket.io";
import Message from "../models/Message.js";

let io;
const userSocketMap = {}; // userId -> Set of socketIds

export const initSocket = (server, corsOptions) => {
  io = new Server(server, {
    cors: corsOptions,
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId && userId !== "undefined") {
      if (!userSocketMap[userId]) userSocketMap[userId] = new Set();
      userSocketMap[userId].add(socket.id);
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }

    socket.on("markAsSeen", async ({ senderId, receiverId }) => {
      try {
        await Message.updateMany({ senderId, receiverId }, { seen: true });
        const senderSocketIds = userSocketMap[senderId];
        if (senderSocketIds) {
          senderSocketIds.forEach((id) =>
            io.to(id).emit("messagesSeen", { by: receiverId })
          );
        }
      } catch (err) {
        // Silent error for seen status
      }
    });

    socket.on("profileUpdate", (data) => {
      socket.broadcast.emit("profileUpdated", data);
    });

    // -------- CALL EVENTS --------
    socket.on("call-user", (data) => {
      const socketIds = userSocketMap[data.to];
      if (socketIds) {
        socketIds.forEach((id) => {
          io.to(id).emit("incoming-call", {
            ...data,
            from: userId,
          });
        });
      }
    });

    socket.on("answer-call", (data) => {
      const socketIds = userSocketMap[data.to];
      if (socketIds) {
        socketIds.forEach((id) => io.to(id).emit("call-answered", data));
      }
    });

    socket.on("end-call", ({ to }) => {
      const socketIds = userSocketMap[to];
      if (socketIds) {
        socketIds.forEach((id) => io.to(id).emit("end-call"));
      }
    });

    socket.on("reject-call", ({ to }) => {
      const socketIds = userSocketMap[to];
      if (socketIds) {
        socketIds.forEach((id) => io.to(id).emit("call-rejected"));
      }
    });

    socket.on("webrtc-candidate", (data) => {
      const socketIds = userSocketMap[data.to];
      if (socketIds) {
        socketIds.forEach((id) => io.to(id).emit("webrtc-candidate", data));
      }
    });

    socket.on("typing", ({ to }) => {
      const socketIds = userSocketMap[to];
      if (socketIds)
        socketIds.forEach((id) => io.to(id).emit("userTyping", { userId }));
    });

    socket.on("stopTyping", ({ to }) => {
      const socketIds = userSocketMap[to];
      if (socketIds)
        socketIds.forEach((id) => io.to(id).emit("userStopTyping", { userId }));
    });

    socket.on("disconnect", () => {
      if (userId && userSocketMap[userId]) {
        userSocketMap[userId].delete(socket.id);
        if (userSocketMap[userId].size === 0) {
          delete userSocketMap[userId];
        }
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
};

export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

export { io, userSocketMap };
