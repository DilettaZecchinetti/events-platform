import { fetchEvents } from "../utils/ticketmaster.js";

export const getEvents = async (req, res) => {
  try {
    const keyword = req.query.keyword || "music";
    const events = await fetchEvents(keyword);
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
};
