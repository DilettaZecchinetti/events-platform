import { calendarService } from "../utils/calendarService.js";
import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/api/calendar/auth/google/callback"
);

export const initiateOAuth = (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
  });

  res.json({ url: authUrl });
};

export const handleOAuthCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Missing authorization code");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log("Tokens received from Google:", tokens);

    return res.send(
      "Google Calendar connected successfully! You can close this window."
    );
  } catch (err) {
    console.error("Error during token exchange:", err);
    return res.status(500).send("Failed to connect calendar.");
  }
};

export const addEventToCalendar = async (req, res) => {
  try {
    const eventDetails = req.body;
    const result = await calendarService.addEvent(req.user, eventDetails);
    res.status(200).json({ msg: "Event added to calendar", result });
  } catch (err) {
    res.status(500).json({ msg: "Failed to add to calendar" });
  }
};
