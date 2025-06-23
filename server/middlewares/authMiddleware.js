import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { JWT_SECRET } from "../config.js";

export const protect = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) return res.status(401).json({ msg: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ msg: "Invalid token" });
  }
};

export const authenticateUser = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Authentication token not found" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const isAuthenticated = (req, res, next) => {
  if (req.user) {
    return next();
  }
  return res
    .status(401)
    .json({ error: "You must be logged in to access this resource." });
};

export const isStaff = (req, res, next) => {
  if (req.user && req.user.role === "staff") {
    return next();
  }
  return res.status(403).json({ error: "Access denied. Staff only." });
};

export const authenticateToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ msg: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    res.status(401).json({ msg: "Invalid token" });
  }
};
