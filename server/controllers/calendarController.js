import { calendarService } from "../utils/calendarService.js";

export const initiateOAuth = (req, res) => {
  const url = calendarService.getAuthUrl();
  res.redirect(url);
};

export const handleOAuthCallback = async (req, res) => {
  try {
    const { tokens } = await calendarService.getTokenFromCode(req.query.code);

    res.status(200).json({ msg: "Calendar connected", tokens });
  } catch (err) {
    res.status(500).json({ msg: "OAuth error" });
  }
};

export const addEventToCalendar = async (req, res) => {
  try {
    const eventDetails = req.body;
    const result = await calendarService.addEvent(req.user, eventDetails);
    res.status(200).json({ msg: "Event added to calendar", result });
  } catch (err) {
    res.status(500).json({ msg: "Failed to add to calendar" });
  }
};
