import { google } from "googleapis";
import { oauth2Client } from "../config/calendar.js";

const calendarService = {
  generateAuthUrl: () => {
    const scopes = ["https://www.googleapis.com/auth/calendar.events"];

    return oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: scopes,
    });
  },

  getAccessToken: async (code) => {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  },

  addEventToCalendar: async (tokens, eventData) => {
    try {
      oauth2Client.setCredentials(tokens);

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      const calendarEvent = {
        summary: eventData.name,
        location: `${eventData.venue}, ${eventData.city}`,
        description: eventData.description || "",
        start: {
          dateTime: new Date(
            `${eventData.date}T${eventData.time || "12:00:00"}`
          ).toISOString(),
          timeZone: "Europe/London",
        },
        end: {
          dateTime: new Date(
            new Date(
              `${eventData.date}T${eventData.time || "12:00:00"}`
            ).getTime() +
              60 * 60 * 1000
          ).toISOString(),
          timeZone: "Europe/London",
        },
        reminders: {
          useDefault: true,
        },
      };

      const response = await calendar.events.insert({
        calendarId: "primary",
        resource: calendarEvent,
      });

      return response.data;
    } catch (error) {
      console.error("Error adding event to Google Calendar:", error.message);
      throw new Error("Failed to add event to calendar");
    }
  },
};

export { calendarService };
