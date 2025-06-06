import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const fetchEvents = async (keyword = "music", city = "") => {
  try {
    const params = {};
    if (keyword) params.keyword = keyword;
    if (city) params.city = city;

    const response = await axios.get(`${API_BASE}/api/events`, { params });
    return response.data;
  } catch (err) {
    console.error("Error fetching events:", err);
    throw err;
  }
};

export const fetchEventsById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/api/events/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching events by ID:", error);
  }
};

export const registerUser = async (name, email, password, role) => {
  try {
    const response = await axios.post(`${API_BASE}/api/auth/signup`, {
      name,
      email,
      password,
      role,
    });
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE}/api/auth/login`, {
      email,
      password,
    });
    const { token, user } = response.data;

    localStorage.setItem("token", token);

    return { user, token };
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const fetchCurrentUser = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const response = await axios.get(`${API_BASE}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const signupForEvent = async (eventId, token) => {
  const response = await axios.post(
    `${API_BASE}/api/events/${eventId}/signup`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const addEventToCalendar = (eventId, token) => {
  return axios.post(
    `${API_BASE}/api/calendar/add-event`,
    { eventId },
    {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }
  );
};

export const createEvent = async (data, token) => {
  return axios
    .post(`${API_BASE}/api/events`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

export const updateEvent = async (id, data, token) => {
  return axios
    .put(`${API_BASE}/api/events/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

export const deleteEvent = async (id, token) => {
  return axios
    .delete(`${API_BASE}/api/events/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
  const response = await axios.get(`${API_BASE}/api/events/manual`);
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
