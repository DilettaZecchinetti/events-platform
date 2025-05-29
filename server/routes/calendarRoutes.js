import express from "express";
const router = express.Router();
import {
  initiateOAuth,
  handleOAuthCallback,
  addEventToCalendar,
} from "../controllers/calendarController.js";
import {
  authenticateUser,
  authenticateToken,
} from "../middlewares/authMiddleware.js";

router.get("/oauth", authenticateToken, initiateOAuth);
router.get("/auth/google/callback", handleOAuthCallback);
router.post("/add-event", authenticateUser, addEventToCalendar);

export default router;
