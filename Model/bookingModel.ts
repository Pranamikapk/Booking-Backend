import mongoose, { Schema } from "mongoose";
import { IBooking } from "../Interfaces/common.interface";


const BookingSchema: Schema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    hotel: { type: Schema.Types.ObjectId, ref: "Hotel", required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    totalDays: { type: Number, required: true, min: 1 },
    transactionType: { type: String, enum: ["Razor Pay","Wallet"]},
    transactionId: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Cancelled", "Completed", "Cancellation_pending" , "Approved","Rejected"], default: "Pending" },
    amountPaid: { type: Number, required: true, min: 0 },
    remainingAmount: { type: Number, required: true, min: 0 },
    revenueDistribution: {
      admin: { type: Number, required: true },
      manager: { type: Number, required: true },
    },
    userCredentials: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      idType: { type: String, enum: ["Aadhar", "Passport", "Driving License"], required: true },
      idPhoto: { type: [String], required: true },
    },
    cancellationRequest: { type: Schema.Types.ObjectId, ref: "CancellationModel" },
  },
  { timestamps: true }
);

const BookingModel= mongoose.model<IBooking>("Booking", BookingSchema);
export default BookingModel;
