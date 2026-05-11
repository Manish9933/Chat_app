import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDb } from "./lib/db.js";
import { initSocket } from "./lib/socket.js";
import { ALLOWED_ORIGINS } from "./config/constants.js";

import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import callRouter from "./routes/callRoutes.js";

const app = express();
const server = http.createServer(app);

// MIDDLEWARE
app.use(express.json({ limit: "70mb" }));
app.use(express.urlencoded({ limit: "70mb", extended: true }));

// 💎 ELITE CORS POLICY
const allowedOrigins = [...ALLOWED_ORIGINS];

if (process.env.CLIENT_URL) {
  const clientUrl = process.env.CLIENT_URL.replace(/\/$/, "");
  if (!allowedOrigins.includes(clientUrl)) allowedOrigins.push(clientUrl);
}

const corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin || 
      allowedOrigins.includes(origin) || 
      origin.endsWith(".vercel.app") || 
      process.env.NODE_ENV !== "production"
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by Signature Security"));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// 🚀 INIT SOCKET.IO
initSocket(server, corsOptions);

// ROUTES
app.get("/", (req, res) => res.send("🚀 Signature Chat Backend is Running!"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/calls", callRouter);
app.get("/api/status", (req, res) => res.status(200).json({ status: "online", version: "1.0.0" }));

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ 
    success: false, 
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });
});

// CONNECT DB & START SERVER
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDb();
    server.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default server;

