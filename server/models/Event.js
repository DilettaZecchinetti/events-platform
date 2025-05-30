import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const eventSchema = new mongoose.Schema({
  externalId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
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
  createdAt: { type: Date, default: Date.now },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export const Event = mongoose.model("Event", eventSchema);
