import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
  },
  name: { type: String, required: true },
  role: { type: String, enum: ["user", "staff"], default: "user" },
  createdAt: { type: Date, default: Date.now },
  googleTokens: {
    access_token: String,
    refresh_token: String,
    scope: String,
    token_type: String,
    expiry_date: Number,
  },
});

userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
