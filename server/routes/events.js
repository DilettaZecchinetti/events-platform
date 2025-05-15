import express from "express";
import {
  getEvents,
  getEventById,
  signupForEvent,
} from "../controllers/eventsController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/:id/signup", authenticateUser, signupForEvent); //POST /api/events/:id/signup

export default router;
