import express from "express";
const router = express.Router();
import {
  initiateOAuth,
  handleOAuthCallback,
  addEventToCalendar,
} from "../controllers/calendarController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

router.get("/oauth", authenticateUser, initiateOAuth);
router.get("/callback", handleOAuthCallback);
router.post("/add-event", authenticateUser, addEventToCalendar);

export default router;
