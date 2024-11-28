import mongoose, { Schema } from "mongoose";
import { IHotel } from "../Interfaces/common.interface";


const HotelSchema: Schema = new Schema<IHotel>(
  {
    manager: { type: Schema.Types.ObjectId, ref: "Manager", required: true },
    propertyType: { type: String, enum: ["Resort", "Flat/Apartment", "House", "Beach House"], required: true },
    placeType: { type: String, enum: ["Room", "Entire Place", "Shared Space"], required: true },
    name: { type: String, required: true },
    address: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true, match: /^[A-Za-z0-9\s\-]+$/ },
    },
    rooms: {
      guests: { type: Number, required: true, min: 1 },
      bedrooms: { type: Number, required: true, min: 0 },
      bathrooms: { type: Number, required: true, min: 0 },
      diningrooms: { type: Number, min: 0 },
      livingrooms: { type: Number, min: 0 },
    },
    amenities: { type: [String], required: true },
    photos: { type: [String], required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isListed: { type: Boolean, default: true },
    availability: [
      {
        date: { type: Date, required: true },
        isAvailable: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

const Hotel = mongoose.model<IHotel>("Hotel", HotelSchema);
export default Hotel;
