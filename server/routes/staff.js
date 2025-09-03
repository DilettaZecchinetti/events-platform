import express from "express";
import multer from "multer";
import path from "path";
import {
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/staffController.js";
import { authenticateUser, isStaff } from "../middlewares/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

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
