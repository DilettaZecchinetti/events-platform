import axios from "axios";

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
