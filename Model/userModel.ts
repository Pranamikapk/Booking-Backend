import mongoose, { Schema } from "mongoose";
import { IUser } from "../Interfaces/common.interface";

const UserSchema: Schema = new Schema<IUser>(
  {
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, default: null },
    token: { type: String },
    role: { type: String, enum: ["client", "admin"], default: "client" },
    wallet: { type: Number, min: 0, default: 0 },
    isBlocked: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: {type: Date },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
