import mongoose, { Schema } from "mongoose";
import { IManager } from "../Interfaces/common.interface";

const ManagerSchema: Schema = new Schema<IManager>(
  {
    hotel: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String },
    licence: { type: String },
    hotels: [{ type: Schema.Types.ObjectId, ref: "Hotel", required: true }],
    token: { type: String },
    wallet: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ManagerModel= mongoose.model<IManager>("Manager", ManagerSchema);
export default ManagerModel;
