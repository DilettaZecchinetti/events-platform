import express from "express";

import {
  loginUser,
  registerUser,
  getCurrentUser,
  googleAuth,
  logoutUser,
} from "../controllers/authController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.get("/me", authenticateUser, getCurrentUser);
router.post("/logout", logoutUser);

export default router;
