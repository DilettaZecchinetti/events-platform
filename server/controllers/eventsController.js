import axios from "axios";
import { fetchEventById, fetchEvents } from "../utils/ticketmaster.js";
import { Event } from "../models/Event.js";

export const getEvents = async (req, res) => {
  try {
    const keyword = req.query.keyword || "music";
    const city = req.query.city || null;
    const events = await fetchEvents(keyword, city);
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await fetchEventById(req.params.id);
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch event by id" });
  }
};

export const signupForEvent = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  try {
    let event = await Event.findOne({ externalId: eventId });

    if (!event) {
      const response = await axios.get(
        `https://app.ticketmaster.com/discovery/v2/events/${eventId}.json?apikey=${process.env.TICKETMASTER_API_KEY}`
      );
      const data = response.data;

      const startDate = data.dates?.start?.dateTime
        ? new Date(data.dates.start.dateTime).toISOString()
        : null;

      const endDate = startDate
        ? new Date(
            new Date(startDate).getTime() + 2 * 60 * 60 * 1000
          ).toISOString()
        : null;

      event = new Event({
        externalId: eventId,
        title: data.name || "Untitled Event",
        createdBy: userId,
        startDate,
        endDate,
        location: {
          venue: data._embedded?.venues?.[0]?.name || "Unknown venue",
          city: data._embedded?.venues?.[0]?.city?.name || "Unknown city",
        },
        url: data.url || "",
        image: data.images?.[0]?.url || "",
        attendees: [],
      });

      await event.save();
    }

    if (!event.attendees.includes(userId)) {
      event.attendees.push(userId);
      await event.save();
    }

    res.status(200).json(event);
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Failed to sign up for event" });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { externalId, startDate, endDate, ...rest } = req.body;

    if (externalId) {
      const existingEvent = await Event.findOne({ externalId });
      if (existingEvent) {
        return res.status(200).json(existingEvent);
      }
    }

    const resolvedStartDate = startDate || new Date().toISOString();
    const resolvedEndDate =
      endDate ||
      new Date(
        new Date(resolvedStartDate).getTime() + 2 * 60 * 60 * 1000
      ).toISOString();

    const newEventData = {
      startDate: resolvedStartDate,
      endDate: resolvedEndDate,
      createdBy: req.user._id,
      ...rest,
    };

    if (externalId) {
      newEventData.externalId = externalId;
    }

    const newEvent = await Event.create(newEventData);

    res.status(201).json(newEvent);
  } catch (err) {
    console.error("Create event error:", err.message);
    res
      .status(400)
      .json({ message: "Failed to save event", error: err.message });
  }
};

export const getUserEvents = async (req, res) => {
  console.log("Authentication middleware hit");

  try {
    if (!req.user) {
      console.log("No user found in request");
      return res.status(401).json({ message: "Unauthorized: No user info" });
    }

    const userId = req.user._id;
    console.log("Fetching events for user:", userId);

    const events = await Event.find({ createdBy: userId }).exec();

    console.log(`Found ${events.length} events for user ${userId}`);
    res.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
