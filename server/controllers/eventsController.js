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
  console.log("➡️ Signup controller hit!");

  const eventId = req.params.id;
  const userId = req.user.id;

  try {
    let event = await Event.findOne({ externalId: eventId });

    if (!event) {
      console.log("Event not in DB. Fetching from Ticketmaster...");

      const response = await axios.get(
        `https://app.ticketmaster.com/discovery/v2/events/${eventId}.json`,
        {
          params: { apikey: process.env.TICKETMASTER_API_KEY },
        }
      );

      const data = response.data;

      event = new Event({
        externalId: eventId,
        title: data.name,
        createdBy: userId,
        date: data.dates?.start?.dateTime,
        venue: data._embedded?.venues?.[0]?.name,
        attendees: [],
      });

      await event.save();
    }

    if (event.attendees.includes(userId)) {
      return res
        .status(400)
        .json({ error: "User already signed up for this event" });
    }

    event.attendees.push(userId);
    await event.save();

    res.json({ message: "Successfully signed up for the event!" });
  } catch (error) {
    console.error("Error fetching event from Ticketmaster:", error);
    res.status(500).json({ error: "Failed to sign up for event" });
  }
};

export const createEvent = async (req, res) => {
  try {
    const existingEvent = await Event.findOne({
      externalId: req.body.externalId,
    });

    if (existingEvent) {
      return res.status(200).json(existingEvent);
    }

    const eventData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const newEvent = await Event.create(eventData);
    res.status(201).json(newEvent);
  } catch (err) {
    console.error("Create event error:", err.message);
    res.status(400).json({ message: "Failed to save event", error: err });
  }
};
