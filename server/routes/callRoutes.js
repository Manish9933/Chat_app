import express from "express";
import { saveCallLog, getCallLogs } from "../controllers/callController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.post("/log", protectRoute, saveCallLog);
router.get("/logs", protectRoute, getCallLogs);

export default router;
