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

router.use((req, res, next) => {
  console.log(`Incoming request to calendar API: ${req.method} ${req.url}`);
  next();
});

router.get("/oauth", authenticateToken, initiateOAuth);
router.get("/auth/google/callback", handleOAuthCallback);
router.post("/add-event", authenticateUser, addEventToCalendar);

export default router;
