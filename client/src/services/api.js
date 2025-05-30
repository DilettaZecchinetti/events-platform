import axios from "axios";

const API_BASE = "http://localhost:5000";
const STAFF_API_URL = "/api/staff/events";

export const fetchEvents = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/events`);
    console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
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
    "http://localhost:5000/api/calendar/add-event",
    { eventId },
    {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }
  );
};

export const createEvent = async (data, token) => {
  return axios
    .post("/api/events", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

export const updateEvent = async (id, data, token) => {
  return axios
    .put(`/api/events/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

export const deleteEvent = async (id, token) => {
  return axios
    .delete(`/api/events/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

export const getUserEvents = async (token) => {
  const response = await axios.get(`${STAFF_API_BASE}/api/events/my-events`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!Array.isArray(response.data)) {
    throw new Error("Expected an array of events");
  }

  return response.data;
};
