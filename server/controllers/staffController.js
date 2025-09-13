import { Event } from "../models/Event.js";
import { v4 as uuidv4 } from "uuid";

export const createEvent = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    const source = req.body.source || "manual";

    let locationObj;
    try {
      locationObj =
        typeof req.body.location === "string"
          ? JSON.parse(req.body.location)
          : req.body.location;
    } catch (err) {
      return res.status(400).json({ message: "Invalid location format" });
    }

    const { title, description, startDate, endDate, externalId, url } =
      req.body;
    const { venue, city } = locationObj || {};

    if (!title || !startDate || !endDate || !venue || !city) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (source === "manual" && !req.file) {
      return res
        .status(400)
        .json({ message: "Image is required for manual events" });
    }

    const finalExternalId =
      externalId || (source === "manual" ? uuidv4() : undefined);

    if (finalExternalId) {
      const existing = await Event.findOne({ externalId: finalExternalId });
      if (existing)
        return res.status(409).json({ message: "Event already exists" });
    }

    const newEvent = await Event.create({
      title,
      description: description || "",
      startDate,
      endDate,
      location: { venue, city },
      createdBy: req.user._id,
      source,
      externalId: finalExternalId,
      url: url || undefined,
      image: req.file?.path,
    });

    console.log("Event created:", newEvent);
    res.status(201).json(newEvent);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { city, venue, ...rest } = req.body;

    const updateData = {
      ...rest,
      location: { city, venue },
    };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      updateData,
      { new: true }
    );

    if (!event) {
      return res.status(403).json({
        error:
          "Access denied: you cannot update events created by other staff members.",
      });
    }

    res.json(event);
  } catch (err) {
    console.error("Update event error:", err);
    res.status(500).json({ msg: "Failed to update event" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!event) {
      return res.status(404).json({ msg: "Event not found or not authorized" });
    }

    res.json({ msg: "Event deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to delete event" });
  }
};
