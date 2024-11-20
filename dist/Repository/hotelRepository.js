"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelRepository = void 0;
const hotelModel_1 = __importDefault(require("../Model/hotelModel"));
class HotelRepository {
    constructor(hotelModel) {
        this.hotelModel = hotelModel;
    }
    async findAll() {
        console.log('Repos');
        return this.hotelModel.find({ isListed: true });
    }
    async search(term, checkInDate) {
        return hotelModel_1.default.find({
            $and: [
                {
                    $or: [
                        { "address.state": { $regex: term, $options: "i" } },
                        { "rooms.room": { $regex: term, $options: "i" } },
                    ],
                },
                {
                    bookings: {
                        $not: {
                            $elemMatch: {
                                checkIn: { $lte: checkInDate },
                                checkOut: { $gte: checkInDate },
                            },
                        },
                    },
                },
                { isListed: true },
            ],
        });
    }
    async create(hotelData, managerId) {
        const hotel = new this.hotelModel({ ...hotelData, manager: managerId });
        return await hotel.save();
    }
    async findByManager(managerId) {
        return await this.hotelModel.find({ manager: managerId });
    }
    async findById(hotelId) {
        return await this.hotelModel.findById(hotelId);
    }
    async update(hotelId, updateData) {
        return await this.hotelModel.findByIdAndUpdate(hotelId, updateData, { new: true });
    }
    async delete(hotelId) {
        return await this.hotelModel.findByIdAndDelete(hotelId);
    }
    async updateAvailability(hotelId, availability) {
        return await this.hotelModel.findByIdAndUpdate(hotelId, { availability }, { new: true });
    }
}
exports.HotelRepository = HotelRepository;
