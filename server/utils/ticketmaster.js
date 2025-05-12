import axios from "axios";

export const fetchEvents = async (keyword = "music") => {
  try {
    const url = `https://app.ticketmaster.com/discovery/v2/events.json`;

    const { data } = await axios.get(url, {
      params: {
        apikey: process.env.TICKETMASTER_API_KEY,
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
