import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  deleteMessage,
  votePoll,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.delete("/:id", protectRoute, deleteMessage);
router.post("/vote/:id", protectRoute, votePoll);

export default router;
