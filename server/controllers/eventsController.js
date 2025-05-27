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

export const signupForEvent = (req, res) => {
  console.log("Signup controller hit!");
  res.status(200).json({ msg: "Test passed" });
};
