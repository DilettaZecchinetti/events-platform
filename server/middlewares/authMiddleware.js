import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

/**
 * Middleware to verify JWT and set req.user
 */
export const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Authorization token missing or malformed" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user; // user object should contain at least userId and role
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Middleware to check if user is authenticated
 */
export const isAuthenticated = (req, res, next) => {
  if (req.user) {
    return next();
  }
  return res
    .status(401)
    .json({ error: "You must be logged in to access this resource." });
};

/**
 * Middleware to check if user is staff
 */
export const isStaff = (req, res, next) => {
  if (req.user && req.user.role === "staff") {
    return next();
  }
  return res.status(403).json({ error: "Access denied. Staff only." });
};
