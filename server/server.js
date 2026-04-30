import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

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
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://chat-app-roan-eta.vercel.app" // Your main production URL
];

if (process.env.CLIENT_URL) {
  const clientUrl = process.env.CLIENT_URL.replace(/\/$/, "");
  if (!allowedOrigins.includes(clientUrl)) allowedOrigins.push(clientUrl);
}

app.use(cors({
  origin: (origin, callback) => {
    // 1. Allow if no origin (like mobile apps or curl)
    // 2. Allow if in the allowed list
    // 3. Allow ANY Vercel preview URL (ends with .vercel.app)
    // 4. Allow all in development
    if (
      !origin || 
      allowedOrigins.includes(origin) || 
      origin.endsWith(".vercel.app") || 
      process.env.NODE_ENV !== "production"
    ) {
      callback(null, true);
    } else {
      console.log("CORS Blocked for:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// SOCKET INIT
export const io = new Server(server, {
  cors: { 
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"]
  },
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
        from: userId, // ✅ VERY IMPORTANT FIX
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
app.get("/", (req, res) => res.send("🚀 Chat App Backend is Running!"));
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

