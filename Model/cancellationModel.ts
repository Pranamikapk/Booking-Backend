import mongoose, { Schema } from "mongoose";
import { ICancellation } from "../Interfaces/common.interface";


const CancellationSchema: Schema = new Schema<ICancellation>({
  bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const CancellationModel = mongoose.model<ICancellation>("CancellationModel", CancellationSchema);
export default CancellationModel;
