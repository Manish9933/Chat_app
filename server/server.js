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

// Middlewares
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// intialize socket.io
export const io = new Server(server, {
  cors: {origin: "*"}
})
// store online users
export const userSocketMap = {}; //{ userId: socketId}

// socket.io socket connections handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected:", userId);

  if(userId) { userSocketMap[userId] = socket.id;
  



  // emit online user to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", ()=>{
      console.log("User Disconnected", userId);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
  }
})

// socket.io socket connections handler





// Routes
app.use("/api/staus",(req, res)=> res.send("server is live"))
app.use("/api/auth", userRouter);

app.use("/api/messages", messageRouter);

// Connect database
await connectDb();






// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log("Server running on port " + PORT)
);
