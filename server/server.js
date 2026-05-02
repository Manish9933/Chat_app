import express from "express";
import "dotenv/config";
import path from "path";

import cors from "cors";
import http from "http";
import { connectDb } from "./lib/db.js";

import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import callRouter from "./routes/callRoutes.js";
import { Server } from "socket.io";
import Message from "./models/Message.js";

const app = express();
const server = http.createServer(app);

// MIDDLEWARE
app.use(express.json({ limit: "70mb" }));
app.use(express.urlencoded({ limit: "70mb", extended: true }));

// 💎 ELITE CORS POLICY
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://chat-app-roan-eta.vercel.app" // Main Production URL
];

if (process.env.CLIENT_URL) {
  const clientUrl = process.env.CLIENT_URL.replace(/\/$/, "");
  if (!allowedOrigins.includes(clientUrl)) allowedOrigins.push(clientUrl);
}

// Unified CORS Checker Function
const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow if no origin (server-to-server or mobile)
    // 2. Allow if in the signature list
    // 3. Allow ANY Vercel deployment (ends with .vercel.app)
    // 4. Allow all in dev mode
    if (
      !origin || 
      allowedOrigins.includes(origin) || 
      origin.endsWith(".vercel.app") || 
      process.env.NODE_ENV !== "production"
    ) {
      callback(null, true);
    } else {
      console.log("Elite CORS Blocked for:", origin);
      callback(new Error("Not allowed by Signature Security"));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// 🚀 HARDENED SOCKET.IO (Using the same Elite CORS Policy)
export const io = new Server(server, {
  cors: corsOptions,
});

// STORE USER SOCKETS
export const userSocketMap = {}; // userId -> Set of socketIds

// 🔥 SOCKET EVENTS
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected:", userId);

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
        senderSocketIds.forEach(id => io.to(id).emit("messagesSeen", { by: receiverId }));
      }
    } catch (err) {
      console.log("Error marking as seen:", err);
    }
  });

  socket.on("profileUpdate", (data) => {
    socket.broadcast.emit("profileUpdated", data);
  });

  // -------- CALL EVENTS --------
  socket.on("call-user", (data) => {
    const socketIds = userSocketMap[data.to];
    if (socketIds) {
      // Send to all active sessions for that user
      socketIds.forEach(id => {
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
      socketIds.forEach(id => io.to(id).emit("call-answered", data));
    }
  });

  socket.on("end-call", ({ to }) => {
    const socketIds = userSocketMap[to];
    if (socketIds) {
      socketIds.forEach(id => io.to(id).emit("end-call"));
    }
  });

  socket.on("reject-call", ({ to }) => {
    const socketIds = userSocketMap[to];
    if (socketIds) {
      socketIds.forEach(id => io.to(id).emit("call-rejected"));
    }
  });

  socket.on("webrtc-candidate", (data) => {
    const socketIds = userSocketMap[data.to];
    if (socketIds) {
      socketIds.forEach(id => io.to(id).emit("webrtc-candidate", data));
    }
  });

  socket.on("typing", ({ to }) => {
    const socketIds = userSocketMap[to];
    if (socketIds) socketIds.forEach(id => io.to(id).emit("userTyping", { userId }));
  });

  socket.on("stopTyping", ({ to }) => {
    const socketIds = userSocketMap[to];
    if (socketIds) socketIds.forEach(id => io.to(id).emit("userStopTyping", { userId }));
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
    if (userId && userSocketMap[userId]) {
      userSocketMap[userId].delete(socket.id);
      if (userSocketMap[userId].size === 0) {
        delete userSocketMap[userId];
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// ROUTES
app.get("/", (req, res) => res.send("🚀 Signature Chat Backend is Running!"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/calls", callRouter);
app.get("/api/status", (req, res) => res.send("Server online ✔️"));

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// CONNECT DB
await connectDb();

// START SERVER
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

// export server for vercel
export default server;
