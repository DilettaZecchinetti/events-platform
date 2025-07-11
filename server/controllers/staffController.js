import { Event } from "../models/Event.js";
import { v4 as uuidv4 } from "uuid";

export const createEvent = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: user not found on request" });
    }

    const {
      startDate,
      endDate,
      externalId,
      source = "manual",
      city,
      ...rest
    } = req.body;

    const finalExternalId =
      externalId || (source === "manual" ? uuidv4() : undefined);

    if (!finalExternalId) {
      return res.status(400).json({ message: "externalId is required" });
    }

    if (source !== "manual") {
      const existingEvent = await Event.findOne({
        externalId: finalExternalId,
      });
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
      source,
      externalId: finalExternalId,
      location: city ? { city } : undefined,
      ...rest,
    };

    const newEvent = await Event.create(newEventData);
    res.status(201).json(newEvent);
  } catch (err) {
    console.error("Create event error:", err);
    res.status(400).json({
      message: "Failed to save event",
      error: err.message,
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
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
    console.error(err);
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
