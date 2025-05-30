import express from "express";
import {
  getEvents,
  getEventById,
  signupForEvent,
  createEvent,
} from "../controllers/eventsController.js";
import {
  authenticateUser,
  isAuthenticated,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/", authenticateUser, isAuthenticated, createEvent);
router.post("/:id/signup", authenticateUser, isAuthenticated, signupForEvent);

export default router;
