import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true},
    email_verified: { type: Boolean, default: false },
    family_name: { type: String },
    given_name: { type: String },
    picture: { type: String },
    sub: { type: String },
  },
  { timestamps: true }
);

const User = model("User", userSchema);

export default User;
