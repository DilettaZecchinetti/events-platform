import dotenv from "dotenv";
const result = dotenv.config();
if (result.error) {
  console.error("Error loading .env file:", result.error);
} else {
  console.log("Environment variables loaded successfully");
}

import { PORT } from "./config.js";
import authRoutes from "./routes/auth.js";
import express from "express";
import cors from "cors";

import eventsRouter from "./routes/events.js";
import signupsRoutes from "./routes/signups.js";

import { google } from "googleapis";
import path from "path";
import session from "express-session";

const app = express();
app.use(express.json());
// const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/events", eventsRouter);
app.use("/api/signups", signupsRoutes);
app.use("/api/auth", authRoutes);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

// Set up OAuth2 client with Google
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

app.get("/auth/google", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar"],
  });
  res.redirect(authUrl);
});

app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    req.session.tokens = tokens;
    res.redirect("/");
  } catch (error) {
    console.error("Error during Google OAuth callback:", error);
    res.status(500).send("Error during authentication");
  }
});

app.post("/add-to-calendar", async (req, res) => {
  const { tokens } = req.session;
  if (!tokens) {
    return res.status(401).send("Unauthorized: No tokens found");
  }

  oauth2Client.setCredentials(tokens);

  // Sample event details
  const event = {
    summary: "Sample Event",
    location: "Somewhere",
    description: "A test event",
    start: {
      dateTime: "2025-05-12T10:00:00-07:00",
      timeZone: "America/Los_Angeles",
    },
    end: {
      dateTime: "2025-05-12T11:00:00-07:00",
      timeZone: "America/Los_Angeles",
    },
    attendees: [{ email: "sample-user@example.com" }],
  };

  try {
    const calendarResponse = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });
    res.status(200).send("Event added to calendar!");
  } catch (error) {
    console.error("Error adding event to calendar:", error);
    res.status(500).send("Error adding event to calendar");
  }
});

app.get("/", (req, res) => {
  res.send("Events Platform Backend is running...");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

//middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});
