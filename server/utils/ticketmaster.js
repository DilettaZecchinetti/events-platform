import dotenv from "dotenv";
dotenv.config();

import axios from "axios";

const BASE_URL = "https://app.ticketmaster.com/discovery/v2";
const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;

export const fetchEvents = async ({
  genreId = "KnvZfZ7vAv1",
  keyword = "music",
  city = "London",
} = {}) => {
  try {
    const params = {
      apikey: TICKETMASTER_API_KEY,
      countryCode: "GB",
      size: 40,
    };

    if (genreId) params.genreId = genreId;
    if (keyword) params.keyword = keyword;
    if (city) params.city = city;

    const { data } = await axios.get(`${BASE_URL}/events.json`, { params });

    console.log("Response data:", data);

    return data._embedded?.events || [];
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
