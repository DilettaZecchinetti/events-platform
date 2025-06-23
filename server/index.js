import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import { MONGO_URI, JWT_SECRET, PORT } from "./config.js";

import eventsRouter from "./routes/events.js";
import authRouter from "./routes/auth.js";
import staffRouter from "./routes/staff.js";
import calendarRouter from "./routes/calendarRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://dz-events-platform.netlify.app"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Events platform API is running!");
});

app.use("/api/events", eventsRouter);
app.use("/api/auth", authRouter);
app.use("/api/staff/events", staffRouter);
app.use("/api/calendar", calendarRouter);

app.use(errorHandler);

app.get("/favicon.ico", (req, res) => res.status(204).end());

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {});
  })
  .catch((err) => console.error("MongoDB connection error:", err));
