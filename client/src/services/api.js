import axios from "axios";

const API_BASE = "http://localhost:5000";

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

    return user;
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

// export const addEventToCalendar = async (eventId, token) => {
//   const response = await axios.post(
//     `${API_BASE}/api/calendar/add-event`,
//     { eventId },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );
//   return response.data;
// };

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
