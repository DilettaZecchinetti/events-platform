import { JWT_SECRET } from "../config.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!["user", "staff"].includes(role)) {
    return res.status(400).json({ msg: "Invalid role" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    // const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password, role });
    const token = generateToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error("Error during user registration:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("No user found with email:", email);
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    //  inspect the password comparison
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("Password mismatch for:", email);
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.status(200).json({ token, user });
  } catch (err) {
    console.error("Server error during login:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

//signup and login with google
export const googleAuth = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: googleId, email, name } = ticket.getPayload();

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.create({ googleId, name, email });
    }

    const jwtToken = generateToken(user);
    res.status(200).json({ token: jwtToken, user });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(401).json({ msg: "Invalid Google token" });
  }
};
