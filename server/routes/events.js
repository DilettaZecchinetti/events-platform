import express from "express";
import {
  getEvents,
  getEventById,
  signupForEvent,
  createEvent,
  getUserEvents,
  getAllManualEvents,
  getManualEventById,
  getTicketmasterEventById,
} from "../controllers/eventsController.js";
import {
  authenticateUser,
  isAuthenticated,
  isStaff,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getEvents);
router.get("/manual", getAllManualEvents);
router.get("/manual/:id", getManualEventById);
router.get("/ticketmaster/:id", getTicketmasterEventById);
router.get("/:id", getEventById);

router.post("/", authenticateUser, isAuthenticated, createEvent);
router.post("/:id/signup", authenticateUser, isAuthenticated, signupForEvent);

export default router;
