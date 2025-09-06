import express from "express";
import {
  getEvents,
  getEventById,
  signupForEvent,
  createEvent,
  getAllManualEvents,
  getManualEventById,
  getTicketmasterEventById,
  deleteEvent,
  updateEvent,
  getEventByExternalId,
  getBannerEvents,
  getMyEvents,
} from "../controllers/eventsController.js";
import {
  authenticateUser,
  isAuthenticated,
  isStaff,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getEvents);
router.get("/banner", getBannerEvents);
router.get("/manual", getAllManualEvents);
router.get("/manual/:id", getManualEventById);
router.get("/ticketmaster/:id", getTicketmasterEventById);
router.get("/external/:externalId", authenticateUser, getEventByExternalId);
router.get("/my-events", authenticateUser, getMyEvents);
router.get("/:id", getEventById);

router.post("/", authenticateUser, isAuthenticated, createEvent);
router.post("/:id/signup", authenticateUser, isAuthenticated, signupForEvent);

export default router;
