import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const fetchEvents = async ({
  keyword = "",
  page = 0,
  size = 20,
} = {}) => {
  try {
    const response = await axios.get(`${API_BASE}/api/events`, {
      params: { query: keyword, page, size },
      withCredentials: true,
    });
    return response.data;
  } catch (err) {
    console.error("Error fetching events:", err);
    throw err;
  }
};

export const fetchBannerEvents = async () => {
  try {
    const { data } = await axios.get(`${API_BASE}/api/events/banner`);
    return data;
  } catch (err) {
    console.error("Error fetching banner events:", err);
    return [];
  }
};

export const fetchEventsById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/api/events/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching events by ID:", error);
  }
};

export const registerUser = async (name, email, password, role) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/auth/signup`,
      { name, email, password, role },
      { withCredentials: true }
    );

    return response.data.user;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/auth/login`,
      { email, password },
      { withCredentials: true }
    );

    const { user } = response.data;
    return user;
  } catch (err) {
    console.error("Login error:", err);
    throw err;
  }
};

export const fetchCurrentUser = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const contentType = res.headers.get("Content-Type");
      const errorText = contentType?.includes("application/json")
        ? JSON.stringify(await res.json())
        : await res.text();

      console.error("fetchCurrentUser error response:", res.status, errorText);
      throw new Error("Not authenticated");
    }

    return await res.json();
  } catch (error) {
    console.error("fetchCurrentUser fetch error:", error.message);
    throw error;
  }
};

export const signupForEvent = async (eventId, userId) => {
  return axios.post(
    `${API_BASE}/api/events/${eventId}/signup`,
    { eventId, userId },
    { withCredentials: true }
  );
};

export const addEventToCalendar = async (eventId) => {
  return axios.post(
    `${API_BASE}/api/calendar/add-event`,
    { eventId },
    { withCredentials: true }
  );
};

export const getOAuthUrl = async () => {
  const response = await axios.get(`${API_BASE}/api/calendar/oauth`, {
    withCredentials: true,
  });
  return response.data.url;
};

export const createEvent = async (eventData) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/staff/events/`,
      eventData,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (err) {
    console.error("Create error:", err);
    throw err;
  }
};

export const updateEvent = async (id, data) => {
  return axios
    .put(`${API_BASE}/api/staff/events/${id}`, data, {
      withCredentials: true,
    })
    .then((res) => res.data);
};

export const deleteEvent = async (id) => {
  return axios
    .delete(`${API_BASE}/api/staff/events/${id}`, {
      withCredentials: true,
    })
    .then((res) => res.data);
};

export const fetchManualEventById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/api/events/manual/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch manual event:", error);
    throw error;
  }
};

export const fetchTicketmasterEventById = async (id) => {
  try {
    const response = await axios.get(
      `${API_BASE}/api/events/ticketmaster/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch Ticketmaster event:", error);
    throw error;
  }
};

export const getManualEvents = async () => {
  const response = await axios.get(`${API_BASE}/api/events/manual`, {
    withCredentials: true,
  });
  return response.data;
};

export const fetchFromTicketmaster = async (externalId) => {
  try {
    const res = await axios.get(`${API_BASE}/api/ticketmaster/${externalId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch from Ticketmaster", error.message);
    return null;
  }
};

export const logoutUser = async () => {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
};
