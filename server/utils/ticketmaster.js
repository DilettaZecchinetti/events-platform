import dotenv from "dotenv";
dotenv.config();

import axios from "axios";

const BASE_URL = "https://app.ticketmaster.com/discovery/v2";
const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;

export const fetchEvents = async (keyword = "music") => {
  console.log("Ticketmaster API key:", TICKETMASTER_API_KEY);
  try {
    const { data } = await axios.get(`${BASE_URL}/events.json`, {
      params: {
        apikey: TICKETMASTER_API_KEY,
        keyword,
        countryCode: "GB",
      },
    });

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
