import { JWT_SECRET } from "../config.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.js";

// const JWT_SECRET = process.env.JWT_SECRET;

const bcrypt = require("bcrypt");

app.post(
  "/signup",
  express.urlencoded({ extended: true }),
  async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!["user", "staff"].includes(role))
      return res.status(400).send("Invalid role");

    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).send("Email already exists");

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
      });

      req.session.user = {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      };

      res.redirect("/");
    } catch (err) {
      console.error(err);
      res.status(500).send("Signup failed");
    }
  }
);

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
