import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../lib/cloudinary.js";
import { CLOUDINARY_FOLDERS, JWT_EXPIRY } from "../config/constants.js";

const generateToken = (id) =>
  jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });

// SIGNUP
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, bio } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ success: false, message: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hash,
      bio,
      profilePic: ""
    });

    res.status(201).json({
      success: true,
      message: "Account created",
      token: generateToken(user._id),
      userData: user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    res.json({
      success: true,
      message: "Login success",
      token: generateToken(user._id),
      userData: user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CHECK AUTH
export const checkAuth = (req, res) =>
  res.status(200).json({ success: true, user: req.user });

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, profilePic } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (bio !== undefined) updateData.bio = bio; 
    if (profilePic) {
      try {
        const uploaded = await cloudinary.uploader.upload(profilePic, {
          resource_type: "image",
          folder: CLOUDINARY_FOLDERS.PROFILES,
          transformation: [{ width: 500, height: 500, crop: "fill", quality: "auto" }],
        });
        updateData.profilePic = uploaded.secure_url;
      } catch (uploadErr) {
        return res.status(500).json({ success: false, message: "Profile image upload failed. Try a smaller image." });
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select("-password");

    res.status(200).json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET USER BY ID
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.json({ success: false, message: "Both fields are required" });
    }
    if (newPassword.length < 6) {
      return res.json({ success: false, message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.json({ success: false, message: "User not found" });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.json({ success: false, message: "Current password is incorrect" });

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// UPDATE PRIVACY SETTINGS
export const updatePrivacy = async (req, res) => {
  try {
    const { lastSeenVisible, profilePhotoVisible, readReceipts, onlineStatus } = req.body;

    const updateData = {};
    if (lastSeenVisible !== undefined) updateData["privacy.lastSeenVisible"] = lastSeenVisible;
    if (profilePhotoVisible !== undefined) updateData["privacy.profilePhotoVisible"] = profilePhotoVisible;
    if (readReceipts !== undefined) updateData["privacy.readReceipts"] = readReceipts;
    if (onlineStatus !== undefined) updateData["privacy.onlineStatus"] = onlineStatus;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    res.json({ success: true, user: updated });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// DELETE ACCOUNT
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.json({ success: false, message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.json({ success: false, message: "Password is incorrect" });

    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true, message: "Account deleted permanently" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
