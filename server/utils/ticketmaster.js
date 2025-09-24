import axios from "axios";

const BASE_URL = "https://app.ticketmaster.com/discovery/v2";
const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;

export const fetchEvents = async ({
  keyword = "",
  city = "",
  page = 0,
  size = 20,
  startDateTime,
  endDateTime,
} = {}) => {
  try {
    const params = {
      apikey: TICKETMASTER_API_KEY,
      countryCode: "GB",
      page,
      size,
      sort: "date,asc",
      ...(keyword && { keyword }),
      ...(city && { city }),
      ...(startDateTime && { startDateTime }),
      ...(endDateTime && { endDateTime }),
    };

    console.log("Fetching Ticketmaster events with params:", params);

    const { data } = await axios.get(`${BASE_URL}/events.json`, { params });

    let events = data._embedded?.events || [];
    const totalPages = data.page?.totalPages || 1;

    if (startDateTime || endDateTime) {
      events = events.filter((event) => {
        const eventDate = event.dates?.start?.dateTime;
        if (!eventDate) return false;

        const time = new Date(eventDate).getTime();
        const start = startDateTime
          ? new Date(startDateTime).getTime()
          : -Infinity;
        const end = endDateTime ? new Date(endDateTime).getTime() : Infinity;

        return time >= start && time <= end;
      });
    }

    return { events, page: { totalPages } };
  } catch (err) {
    console.error(
      "Error fetching Ticketmaster events:",
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
