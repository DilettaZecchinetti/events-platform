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

export const signUpForEvent = async (userName, email, eventId) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${API_BASE}/api/events/${eventId}/signup`,
      { userName, email },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error signing up for event:", error);
    throw error;
  }
};
