import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  date: {
    type: Date,
    required: true,
  },
  location: {
    venue: String,
    city: String,
  },
  image: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  url: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export const Event = mongoose.model("Event", eventSchema);
