import express from "express";
import {
  getEvents,
  getEventById,
  signupForEvent,
  createEvent,
  getUserEvents,
} from "../controllers/eventsController.js";
import {
  authenticateUser,
  isAuthenticated,
  isStaff,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/", authenticateUser, isAuthenticated, createEvent);
router.post("/:id/signup", authenticateUser, isAuthenticated, signupForEvent);
router.get("/my-events", authenticateUser, isStaff, getUserEvents);

export default router;
