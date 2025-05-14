import dotenv from "dotenv";
const result = dotenv.config();
import connectDB from "./config/db.js";

connectDB();

// ...rest of your server setup code

// if (result.error) {
//   console.error("Error loading .env file:", result.error);
// } else {
//   console.log("Environment variables loaded successfully");
// }

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

// google callback route
app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
    const { data: profile } = await oauth2.userinfo.get();

    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      req.session.user = {
        id: user._id,
        email: user.email,
        role: user.role,
      };
      return res.redirect(process.env.FRONTEND_URL);
    }

    req.session.tempUser = {
      googleId: profile.id,
      email: profile.email,
      name: profile.name,
    };

    res.redirect(`${process.env.FRONTEND_URL}/select-role`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Authentication error");
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

app.post("/api/set-role", express.json(), async (req, res) => {
  const { role } = req.body;
  const temp = req.session.tempUser;

  if (!temp || !["user", "staff"].includes(role)) {
    return res.status(400).json({ error: "Invalid role or session expired" });
  }

  const newUser = await User.create({
    googleId: temp.googleId,
    email: temp.email,
    name: temp.name,
    role,
  });

  req.session.user = {
    id: newUser._id,
    email: newUser.email,
    role: newUser.role,
  };

  delete req.session.tempUser;
  res.status(201).json({ message: "Role set and user created" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

//middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});
