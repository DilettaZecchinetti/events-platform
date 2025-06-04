import axios from "axios";
import mongoose from "mongoose";
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
  const id = req.params.id;

  try {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({ error: "Event not found in database" });
      }
      return res.status(200).json(event);
    }

    if (!id) {
      return res.status(400).json({ error: "Missing event ID" });
    }

    const event = await fetchEventById(id);

    return res.status(200).json(event);
  } catch (err) {
    console.error("Error in getEventById:", err.message);

    if (err.response?.status === 404) {
      return res.status(404).json({ error: "Ticketmaster event not found" });
    }
    if (err.response?.status === 429) {
      return res.status(429).json({
        error: "Too many requests to Ticketmaster API, please try later",
      });
    }

    return res.status(500).json({ error: "Failed to fetch event by id" });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { startDate, endDate, externalId, ...rest } = req.body;

    if (!externalId) {
      return res.status(400).json({ message: "externalId is required" });
    }

    let existingEvent = await Event.findOne({ externalId });

    if (existingEvent) {
      return res.status(200).json(existingEvent);
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
      source: "manual",
      externalId,
      ...rest,
    };

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

const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;
const TICKETMASTER_BASE_URL =
  "https://app.ticketmaster.com/discovery/v2/events";

export const getManualEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res.status(404).json({ error: "Manual event not found" });
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch manual event by ID" });
  }
};

export const getTicketmasterEventById = async (req, res) => {
  const tmEventId = req.params.id;
  try {
    const response = await axios.get(
      `${TICKETMASTER_BASE_URL}/${tmEventId}.json`,
      {
        params: { apikey: TICKETMASTER_API_KEY },
      }
    );
    res.status(200).json(response.data);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ error: "Ticketmaster event not found" });
    }
    if (err.response && err.response.status === 429) {
      return res
        .status(429)
        .json({ error: "Ticketmaster API rate limit exceeded" });
    }
    res.status(500).json({ error: "Failed to fetch Ticketmaster event by ID" });
  }
};

export const getAllManualEvents = async (req, res) => {
  try {
    const manualEvents = await Event.find({ source: "manual" });
    res.json(manualEvents);
  } catch (err) {
    console.error("Error fetching manual events:", err);
    res.status(500).json({ message: "Failed to fetch manual events" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this event" });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Delete event error:", err.message);
    res.status(500).json({ message: "Failed to delete event" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this event" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json(updatedEvent);
  } catch (err) {
    console.error("Update event error:", err.message);
    res.status(500).json({ message: "Failed to update event" });
  }
};

const isManualEvent = (id) => /^[a-f\d]{24}$/i.test(id);

export const signupForEvent = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  console.log(
    "signupForEvent called with eventId:",
    eventId,
    "userId:",
    userId
  );

  try {
    let event;

    if (isManualEvent(eventId)) {
      console.log("Detected manual event signup");

      event = await Event.findById(eventId);
      if (!event) {
        console.log("Manual event not found in DB:", eventId);
        return res.status(404).json({ error: "Manual event not found" });
      }

      console.log("Manual event found:", event.title);
    } else {
      console.log("Detected Ticketmaster event signup");

      event = await Event.findOne({ externalId: eventId });
      if (!event) {
        console.log(
          "Ticketmaster event not in DB, fetching from API:",
          eventId
        );

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
        console.log("Ticketmaster event saved in DB:", event.title);
      } else {
        console.log("Ticketmaster event found in DB:", event.title);
      }
    }

    if (!event.attendees.includes(userId)) {
      console.log(
        `Adding user ${userId} to attendees for event ${event.title}`
      );
      event.attendees.push(userId);
      await event.save();
    } else {
      console.log(`User ${userId} already signed up for event ${event.title}`);
    }

    res.status(200).json(event);
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Failed to sign up for event" });
  }
};

export const getEventByExternalId = async (req, res) => {
  try {
    const event = await Event.findOne({ externalId: req.params.externalId });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (err) {
    console.error("Error fetching event by externalId:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
