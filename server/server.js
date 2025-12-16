import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDb } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// MIDDLEWARE
app.use(express.json({ limit: "10mb" }));
app.use(cors());

// SOCKET INIT
export const io = new Server(server, {
  cors: { origin: "*" },
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

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// ROUTES
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
app.get("/api/status", (req, res) => res.send("Server online ✔️"));

// CONNECT DB
await connectDb();

// START SERVER
if(process.env.NODE_ENV === 'production'){
  const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
}
// export server for vercel
export default server;

