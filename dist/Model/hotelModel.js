"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const HotelSchema = new mongoose_1.Schema({
    manager: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
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
}, { timestamps: true });
const Hotel = mongoose_1.default.model("Hotel", HotelSchema);
exports.default = Hotel;
