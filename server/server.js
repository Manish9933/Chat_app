import express from "express";
import "dotenv/config";
import path from "path";

import cors from "cors";
import http from "http";
import { connectDb } from "./lib/db.js";

import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
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
export const userSocketMap = {};

// 🔥 SOCKET EVENTS
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  socket.on("markAsSeen", async ({ senderId, receiverId }) => {
    try {
      await Message.updateMany({ senderId, receiverId }, { seen: true });
      const senderSocket = userSocketMap[senderId];
      if (senderSocket) io.to(senderSocket).emit("messagesSeen", { by: receiverId });
    } catch (err) {
      console.log("Error marking as seen:", err);
    }
  });

  socket.on("profileUpdate", (data) => {
    socket.broadcast.emit("profileUpdated", data);
  });

  // -------- CALL EVENTS --------
  socket.on("call-user", (data) => {
    const socketId = userSocketMap[data.to];
    if (socketId) {
      io.to(socketId).emit("incoming-call", {
        ...data,
        from: userId,
      });
    }
  });

  socket.on("answer-call", (data) => {
    const socketId = userSocketMap[data.to];
    if (socketId) {
      io.to(socketId).emit("call-answered", data);
    }
  });

  socket.on("end-call", ({ to }) => {
    const socketId = userSocketMap[to];
    if (socketId) {
      io.to(socketId).emit("end-call");
    }
  });

  socket.on("reject-call", ({ to }) => {
    const socketId = userSocketMap[to];
    if (socketId) {
      io.to(socketId).emit("call-rejected");
    }
  });

  socket.on("webrtc-candidate", (data) => {
    const socketId = userSocketMap[data.to];
    if (socketId) {
      io.to(socketId).emit("webrtc-candidate", data);
    }
  });

  socket.on("typing", ({ to }) => {
    const socketId = userSocketMap[to];
    if (socketId) io.to(socketId).emit("userTyping", { userId });
  });

  socket.on("stopTyping", ({ to }) => {
    const socketId = userSocketMap[to];
    if (socketId) io.to(socketId).emit("userStopTyping", { userId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// ROUTES
app.get("/", (req, res) => res.send("🚀 Signature Chat Backend is Running!"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
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
