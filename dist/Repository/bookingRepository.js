"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRepository = void 0;
class BookingRepository {
    constructor(bookingModel) {
        this.bookingModel = bookingModel;
    }
    async create(bookingData) {
        const booking = new this.bookingModel(bookingData);
        return await booking.save();
    }
    async findById(id) {
        return await this.bookingModel.findById(id).populate('hotel');
    }
    async update(id, updateData) {
        return await this.bookingModel.findByIdAndUpdate(id, updateData, { new: true });
    }
    async findByUserId(userId) {
        return await this.bookingModel.find({ user: userId }).populate('hotel');
    }
    async findByHotelIds(hotelIds) {
        return await this.bookingModel.find({ hotel: { $in: hotelIds } })
            .populate('user', 'name email phone')
            .populate('hotel', 'name address propertyType placeType')
            .sort({ checkInDate: 1 });
    }
}
exports.BookingRepository = BookingRepository;
