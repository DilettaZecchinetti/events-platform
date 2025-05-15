import mongoose from "mongoose";

const signupSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  source: {
    type: String,
    enum: ["ticketmaster", "local"],
    default: "local",
  },
  calendarAdded: {
    type: Boolean,
    default: false,
  },
  signupAt: {
    type: Date,
    default: Date.now,
  },
});

const Signup = mongoose.model("Signup", signupSchema);

export default Signup;
