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

      // Create new event document with required fields filled in
      event = new Event({
        externalId: eventId,
        title: data.name, // required field — map to Ticketmaster event name
        createdBy: userId, // required field — current user ID from JWT token
        date: data.dates?.start?.dateTime,
        venue: data._embedded?.venues?.[0]?.name,
        attendees: [],
      });

      await event.save();
    }

    // Now sign up the user if not already signed up
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
