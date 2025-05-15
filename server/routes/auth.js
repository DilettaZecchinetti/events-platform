import express from "express";

import {
  loginUser,
  registerUser,
  getCurrentUser,
  googleAuth,
} from "../controllers/authController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.get("/me", authenticateUser, getCurrentUser);

export default router;
