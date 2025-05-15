import { Event } from "../models/Event.js";

export const createEvent = async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ msg: "Failed to create event" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ msg: "Event not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: "Failed to update event" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Event not found" });
    res.json({ msg: "Event deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete event" });
  }
};
