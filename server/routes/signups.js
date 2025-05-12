import express from "express";
import { signupForEvents } from "../controllers/signupsController.js";

const router = express.Router();

router.post("/", signupForEvents);

export default router;
