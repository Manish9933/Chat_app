import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../lib/cloudinary.js";

const generateToken = (id) =>
  jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// SIGNUP
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, bio } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.json({ success: false, message: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hash,
      bio,
      profilePic: ""
    });

    res.json({
      success: true,
      message: "Account created",
      token: generateToken(user._id),
      userData: user
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.json({ success: false, message: "Invalid credentials" });

    res.json({
      success: true,
      message: "Login success",
      token: generateToken(user._id),
      userData: user
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// CHECK AUTH
export const checkAuth = (req, res) =>
  res.json({ success: true, user: req.user });

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, profilePic } = req.body;

    let pic = undefined;

    if (profilePic) {
      const uploaded = await cloudinary.uploader.upload(profilePic);
      pic = uploaded.secure_url;
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        fullName,
        bio,
        ...(pic && { profilePic: pic })
      },
      { new: true }
    ).select("-password");

    res.json({ success: true, user: updated });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
