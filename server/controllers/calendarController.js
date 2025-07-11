import { calendarService } from "../utils/calendarService.js";
import { google } from "googleapis";
import { Event } from "../models/Event.js";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

const redirectUri = process.env.GOOGLE_REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
);

export const initiateOAuth = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const userId = req.user._id;

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

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    return res.send(`
      <html>
        <body>
          <script>
            const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    
            if (isMobile) {
              document.write("<p>Google Calendar connected! You can close this tab.</p>");
              setTimeout(() => window.close(), 3000);
            } else {
              window.opener.postMessage('oauth-success', "${frontendUrl}");
              window.close();
            }
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("OAuth error:", err);
    return res.status(500).send("Failed to connect calendar.");
  }
};

export const addEventToCalendar = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId || typeof eventId !== "string") {
      return res.status(400).json({ msg: "Missing or invalid eventId" });
    }

    if (!req.user) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    const userTokens = req.user.googleTokens;
    if (!userTokens) {
      return res.status(401).json({
        msg: "User has not authorized Google Calendar",
      });
    }

    oauth2Client.setCredentials(userTokens);

    const event = await Event.findById(eventId);
    if (!event) {
      console.warn(`Event with externalId ${eventId} not found`);
      return res.status(404).json({ msg: "Event not found in database" });
    }

    const startDate = new Date(event.startDate);
    const endDate = event.endDate
      ? new Date(event.endDate)
      : new Date(startDate.getTime() + 60 * 60 * 1000);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ msg: "Invalid event date(s)" });
    }

    const calendarEvent = {
      summary: event.title,
      description: event.description || "",
      start: {
        dateTime: startDate.toISOString(),
        timeZone: "Europe/London",
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: "Europe/London",
      },
      location: event.location?.venue || "",
    };

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: calendarEvent,
    });

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
