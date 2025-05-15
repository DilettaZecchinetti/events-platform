import { fetchEventById, fetchEvents } from "../utils/ticketmaster.js";
import Signup from "../models/Signup.js";

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
  try {
    const { id: eventId } = req.params;
    const { userId } = req.user;

    const alreadySignedUp = await Signup.findOne({ userId, eventId });
    if (alreadySignedUp) {
      return res.status(400).json({ msg: "Already sign up for this event" });
    }

    const signup = await Signup.create({ userId, eventId });
    res.status(201).json({ msg: "Successfully signed up", signup });
  } catch (err) {
    res.status(500).json({ msg: "Signup failed" });
  }
};
