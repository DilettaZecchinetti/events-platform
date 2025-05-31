import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const eventSchema = new mongoose.Schema({
  externalId: {
    type: String,
    validate: {
      validator: function (v) {
        // externalId required only for ticketmaster events
        if (this.source === "ticketmaster") {
          return v != null && v.length > 0;
        }
        return true; // no validation for manual events
      },
      message: "externalId is required for ticketmaster events",
    },
  },
  source: {
    type: String,
    enum: ["ticketmaster", "manual"],
    default: "manual",
  },
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

eventSchema.index({ externalId: 1 }, { unique: true, sparse: true });

export const Event = mongoose.model("Event", eventSchema);
