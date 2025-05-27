import { Event } from "../models/Event";

export const signupForEvents = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.attendees.includes(userId)) {
      return res.status(400).json({ error: "User already signed up" });
    }

    event.attendees.push(userId);
    await event.save();

    res.status(200).json({ message: "Signed up successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Failed to sign up" });
  }
};
