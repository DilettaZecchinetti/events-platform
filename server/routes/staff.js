import express from "express";
import multer from "multer";
import path from "path";
import { upload } from "../config/cloudinary.js";

import {
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/staffController.js";
import { authenticateUser, isStaff } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticateUser,
  isStaff,
  upload.single("image"),
  createEvent
);
router.put(
  "/:id",
  authenticateUser,
  isStaff,
  upload.single("image"),
  updateEvent
);
router.delete("/:id", authenticateUser, isStaff, deleteEvent);

export default router;
