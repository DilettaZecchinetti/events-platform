import axios from "axios";
import mongoose from "mongoose";
import { fetchEventById, fetchEvents } from "../utils/ticketmaster.js";
import { Event } from "../models/Event.js";
import { v4 as uuidv4 } from "uuid";

const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;
const BASE_URL = "https://app.ticketmaster.com/discovery/v2";

const mapLocation = (region) => {
  switch (region) {
    case "London":
      return "London";
    case "South":
      return "Brighton,Bristol,Southampton,Reading";
    case "Midlands & Central":
      return "Birmingham,Nottingham,Derby,Leicester";
    case "Wales & North West":
      return "Cardiff,Manchester,Liverpool,Chester";
    case "North & North East":
      return "Leeds,Sheffield,Newcastle,Manchester";
    case "Scotland":
      return "Glasgow,Edinburgh,Aberdeen,Inverness";
    case "Ireland":
      return "Dublin,Cork,Limerick,Galway";
    case "Northern Ireland":
      return "Belfast,Derry,Londonderry";
    default:
      return "";
  }
};

const formatDateForTicketmaster = (date, isStart = true) => {
  if (!date) return undefined;

  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return undefined;

  const d = new Date(Date.UTC(year, month - 1, day));
  if (isStart) d.setUTCHours(0, 0, 0, 0);
  else d.setUTCHours(23, 59, 59, 0);

  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
};

export const getEvents = async (req, res) => {
  try {
    const {
      keyword = "",
      location = "",
      startDate,
      endDate,
      page = 0,
      size = 20,
    } = req.query;

    if (!TICKETMASTER_API_KEY) {
      return res.status(500).json({ error: "Ticketmaster API key not set" });
    }

    const mappedLocation = mapLocation(location);

    const now = new Date();
    const startDateTime = startDate
      ? new Date(startDate).toISOString().split(".")[0] + "Z"
      : now.toISOString().split(".")[0] + "Z";

    const endDateTime = endDate
      ? new Date(endDate).toISOString().split(".")[0] + "Z"
      : undefined;

    const { events, page: ticketmasterPage } = await fetchEvents({
      keyword,
      city: mappedLocation,
      page: Number(page),
      size: Number(size),
      startDateTime,
      endDateTime,
    });

    res.status(200).json({ events, page: ticketmasterPage });
  } catch (err) {
    console.error("Error in getEvents:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

export const getBannerEvents = async (req, res) => {
  try {
    const params = {
      apikey: TICKETMASTER_API_KEY,
      countryCode: "GB",
      size: 10,
      sort: "date,asc",
      classificationName: "music",
      startDateTime: new Date().toISOString(),
    };

    const { data } = await axios.get(`${BASE_URL}/events.json`, { params });
    res.json(data._embedded?.events || []);
  } catch (err) {
    console.error(
      "Error fetching banner events:",
      err.response?.data || err.message
    );
    res.status(500).json({ error: "Failed to fetch banner events" });
  }
};

export const getEventById = async (req, res) => {
  const id = req.params.id;

  try {
    if (!id) {
      return res.status(400).json({ error: "Missing event ID" });
    }

    if (mongoose.Types.ObjectId.isValid(id)) {
      const event = await Event.findById(id).populate("attendees");
      if (!event) {
        return res.status(404).json({ error: "Event not found in database" });
      }
      return res.status(200).json(event);
    }

    const existingEvent = await Event.findOne({
      externalId: id,
      source: "ticketmaster",
    }).populate("attendees");

    if (existingEvent) {
      return res.status(200).json(existingEvent);
    }

    const externalEvent = await fetchEventById(id);

    const normalized = {
      id: externalEvent.id,
      externalId: externalEvent.id,
      title: externalEvent.name,
      url: externalEvent.url || "",
      image: externalEvent.images?.[0]?.url || "",
      startDate:
        externalEvent.dates?.start?.dateTime ||
        externalEvent.dates?.start?.localDate ||
        null,
      endDate: externalEvent.dates?.end?.dateTime || null,
      venue: externalEvent._embedded?.venues?.[0]?.name || "",
      city: externalEvent._embedded?.venues?.[0]?.city?.name || "",
      genre: externalEvent.classifications?.[0]?.genre?.name || "",
      promoter: externalEvent.promoter?.description || "",
      info: externalEvent.info || "",
      pleaseNote: externalEvent.pleaseNote || "",
      attendees: [],
      source: "ticketmaster",
    };

    return res.status(200).json(normalized);
  } catch (err) {
    console.error("Error in getEventById:", err.message);
    return res.status(500).json({ error: "Failed to fetch event by id" });
  }
};

export const createEvent = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: user not found on request" });
    }

    const source = req.body.source || "manual";

    if (source === "manual" && !req.file) {
      return res
        .status(400)
        .json({ message: "Image is required for manual events" });
    }

    const {
      title,
      description,
      location,
      startDate,
      endDate,
      externalId,
      url,
      image,
    } = req.body;
    const venue = location?.venue;
    const city = location?.city;

    if (!title || !startDate || !endDate || !venue || !city) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const finalExternalId =
      externalId || (source === "manual" ? uuidv4() : undefined);

    if (finalExternalId) {
      const existing = await Event.findOne({ externalId: finalExternalId });
      if (existing) {
        return res.status(409).json({ message: "Event already exists" });
      }
    }

    const newEventData = {
      title,
      description: description || "",
      startDate,
      endDate,
      location: { venue, city },
      createdBy: req.user._id,
      source,
      externalId: finalExternalId,
      url: url || undefined,
      image:
        source === "manual"
          ? req.file?.filename
          : image && image.trim() !== ""
          ? image
          : undefined,
    };

    const newEvent = await Event.create(newEventData);

    res.status(201).json(newEvent);
  } catch (err) {
    console.error(">>> Mongoose error object:", err);

    if (err.errors) {
      for (const key in err.errors) {
        console.error(
          `Field "${key}" failed validation:`,
          err.errors[key].message
        );
      }
    }

    res.status(400).json({
      message: err.message,
      errors: err.errors,
    });
  }
};

export const getUserEvents = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user info" });
    }

    const userId = req.user._id;

    const events = await Event.find({ createdBy: userId }).exec();

    res.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

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

const isManualEvent = (eventId) => /^[0-9a-fA-F]{24}$/.test(eventId);

export const signupForEvent = async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user._id;

  try {
    let event;

    if (isManualEvent(eventId)) {
      event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Manual event not found" });
      }
    } else {
      event = await Event.findOne({ externalId: eventId });
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
          description: data.description || data.info || "",
          source: "ticketmaster",
          attendees: [],
        });

        await event.save();
      }
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

export const getMyEvents = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const events = await Event.find({ attendees: req.user._id }).lean();
    res.json(events);
  } catch (err) {
    console.error("getMyEvents error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
