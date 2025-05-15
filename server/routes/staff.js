import express from "express";
import {
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/staffController.js";
import { authenticateUser, isStaff } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateUser, isStaff, createEvent);
router.put("/:id", authenticateUser, isStaff, updateEvent);
router.delete("/:id", authenticateUser, isStaff, deleteEvent);

export default router;
