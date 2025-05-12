import axios from "axios";

export const fetchEvents = async (keyword = "music") => {
  const url = "https://app.ticketmaster.com/discovery/v2/events.json";

  const { data } = await axios.get(url, {
    params: {
      apikey: process.env.TICKETMASTER_API_KEY,
      keyword,
      countryCode: "GB",
    },
  });

  return data._embedded?.events || [];
};
