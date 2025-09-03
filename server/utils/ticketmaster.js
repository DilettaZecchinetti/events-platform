import dotenv from "dotenv";
dotenv.config();

import axios from "axios";

const BASE_URL = "https://app.ticketmaster.com/discovery/v2";
const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;

export const fetchEvents = async ({
  keyword = "",
  city = "",
  page = 0,
  size = 20,
} = {}) => {
  try {
    const startDateTime = new Date().toISOString().split(".")[0] + "Z";

    const params = {
      apikey: TICKETMASTER_API_KEY,
      countryCode: "GB",
      startDateTime,
      page,
      size,
      sort: "date,asc",
      classificationName: "music",
      ...(keyword && { keyword }),
      ...(city && { city }),
    };

    const { data } = await axios.get(`${BASE_URL}/events.json`, { params });

    return {
      events: data._embedded?.events || [],
      page: data.page || { totalPages: 1 },
    };
  } catch (err) {
    console.error(
      "Error from Ticketmaster:",
      err.response?.data || err.message
    );
    throw err;
  }
};

export const fetchEventById = async (eventId) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/events/${eventId}.json`, {
      params: {
        apikey: TICKETMASTER_API_KEY,
      },
    });
    return data;
  } catch (err) {
    console.error("TIcketmaster API error (by ID):", err.message);
    throw err;
  }
};
