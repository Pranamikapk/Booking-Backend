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
const BookingSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    hotel: { type: mongoose_1.Schema.Types.ObjectId, ref: "Hotel", required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    totalDays: { type: Number, required: true, min: 1 },
    transactionId: { type: String, required: true },
    status: { type: String, enum: ["pending", "cancelled", "completed", "cancellation_pending"], default: "pending" },
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
    cancellationRequest: { type: mongoose_1.Schema.Types.ObjectId, ref: "CancellationModel" },
}, { timestamps: true });
const BookingModel = mongoose_1.default.model("Booking", BookingSchema);
exports.default = BookingModel;
