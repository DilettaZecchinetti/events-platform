import axios from "axios";

const API_BASE = "http://localhost:5000";

export const fetchEvents = async () => {
  try {
    const response = await axios.get("/api/events");
    console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

export const fetchEventsById = async (id) => {
  try {
    const response = await axios.get(`/api/events/${id}`);
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

    return user;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const fetchCurrentUser = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const response = await axios.get("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const signupForEvent = async (eventId) => {
  if (!eventId) throw new Error("eventId is required");

  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  try {
    const response = await axios.post(
      `${API_BASE}/api/events/${eventId}/signup`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error signing up for event:",
      error.response?.data || error.message
    );
    throw error;
  }
};
