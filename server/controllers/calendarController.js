import { calendarService } from "../utils/calendarService.js";
import { google } from "googleapis";
import { Event } from "../models/Event.js";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/api/calendar/auth/google/callback"
);

export const initiateOAuth = (req, res) => {
  const userId = req.user.id;

  const state = Buffer.from(JSON.stringify({ userId })).toString("base64");

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    state,
  });

  res.json({ url: authUrl });
};

export const handleOAuthCallback = async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).send("Missing code or state");
  }

  let userId;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64").toString());
    userId = decoded.userId;
  } catch (error) {
    console.error("Failed to decode state:", error);
    return res.status(400).send("Invalid state format");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    await User.findByIdAndUpdate(userId, {
      googleTokens: tokens,
    });

    return res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage('oauth-success','http://localhost:5173');
            window.close();
          </script>
          <p>Google Calendar connected successfully! You can close this window.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("OAuth error:", err);
    return res.status(500).send("Failed to connect calendar.");
  }
};

export const addEventToCalendar = async (req, res) => {
  console.log("req.user:", req.user);

  try {
    console.log("addEventToCalendar called");
    console.log("➡️ Request body:", req.body);

    const { eventId } = req.body;

    if (!eventId || typeof eventId !== "string") {
      console.log("missing or invalid eventId");
      return res.status(400).json({ msg: "Missing or invalid eventId" });
    }

    if (!req.user) {
      console.log("no user found in request");
      return res.status(401).json({ msg: "User not authenticated" });
    }

    const userTokens = req.user.googleTokens;
    if (!userTokens) {
      console.log("Google tokens not found for user", req.user._id);
      return res.status(401).json({
        msg: "User has not authorized Google Calendar",
      });
    }

    oauth2Client.setCredentials(userTokens);

    const event = await Event.findById(eventId);
    if (!event) {
      console.log("event not found in database:", eventId);
      return res.status(404).json({ msg: "Event not found in database" });
    }

    console.log("event fetched from DB:", event);

    const safeParseDate = (input) => {
      if (!input) return null;
      const date = new Date(input);
      return isNaN(date.getTime()) ? null : date;
    };

    // Log all possible date fields for debugging
    console.log("Raw date fields:");
    console.log("event.startDate:", event.startDate);
    console.log("event.endDate:", event.endDate);
    console.log("event.date:", event.date);

    const startDate =
      safeParseDate(event.startDate) || safeParseDate(event.date) || new Date();

    const endDate =
      safeParseDate(event.endDate) ||
      safeParseDate(event.date) ||
      new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour default

    console.log("Parsed startDate:", startDate);
    console.log("Parsed endDate:", endDate);

    if (!startDate || !endDate) {
      return res.status(400).json({ msg: "Invalid event date(s)" });
    }

    const googleEvent = {
      summary: event.title,
      description: event.description || "",
      start: {
        dateTime: startDate.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: "UTC",
      },
      location: event.venue || "",
    };

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: googleEvent,
    });

    console.log("Google Calendar event added:", response.data);

    return res.status(200).json({
      msg: "Event successfully added to Google Calendar",
      calendarEventId: response.data.id,
    });
  } catch (err) {
    console.error("add event failed:", err);
    if (err.response?.data) {
      console.error("Server response error:", err.response.data);
    }
    return res
      .status(500)
      .json({ msg: "Failed to add event to Google Calendar" });
  }
};
