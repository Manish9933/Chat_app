import express from "express";
import { signup, login, checkAuth, updateProfile, getUser } from "../controllers/authController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/check", protectRoute, checkAuth);
router.get("/user/:id", protectRoute, getUser);
router.put("/update-profile", protectRoute, updateProfile);

export default router;
