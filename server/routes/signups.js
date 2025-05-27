import express from "express";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { signupForEvents } from "../controllers/signupsController.js";

const router = express.Router();

router.post("/:id/signup", authenticateUser, signupForEvents);

export default router;
