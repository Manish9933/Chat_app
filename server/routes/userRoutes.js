import express from "express";
import { signup, login, checkAuth, updateProfile, getUser, changePassword, updatePrivacy, deleteAccount } from "../controllers/authController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/check", protectRoute, checkAuth);
router.get("/user/:id", protectRoute, getUser);
router.put("/update-profile", protectRoute, updateProfile);
router.put("/change-password", protectRoute, changePassword);
router.put("/update-privacy", protectRoute, updatePrivacy);
router.delete("/delete-account", protectRoute, deleteAccount);

export default router;
