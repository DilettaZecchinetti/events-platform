import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import dotenv from "dotenv";
dotenv.config();

import eventsRouter from "./routes/events.js";
import authRouter from "./routes/auth.js";
import staffRouter from "./routes/staff.js";
import calendarRouter from "./routes/calendarRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Events platform API is running!");
});
app.use("/api/events", eventsRouter);
app.use("/api/auth", authRouter);
app.use("/api/staff/events", staffRouter);
app.use("/api/calendar", calendarRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully.");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
