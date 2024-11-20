"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelService = void 0;
class HotelService {
    constructor(hotelRepository) {
        this.hotelRepository = hotelRepository;
    }
    async findAll() {
        console.log('hii');
        return await this.hotelRepository.findAll();
    }
    async search(term, checkInDate) {
        const checkIn = new Date(checkInDate);
        return await this.hotelRepository.search(term, checkIn);
    }
    async createHotel(hotelData, managerId) {
        return await this.hotelRepository.create(hotelData, managerId);
    }
    async listHotels(managerId) {
        return await this.hotelRepository.findByManager(managerId);
    }
    async getHotelById(hotelId) {
        const hotel = await this.hotelRepository.findById(hotelId);
        if (!hotel) {
            throw new Error('Hotel not found');
        }
        return hotel;
    }
    async updateHotel(hotelId, managerId, updateData) {
        const hotel = await this.hotelRepository.findById(hotelId);
        if (!hotel) {
            throw new Error('Hotel not found');
        }
        const updatedHotel = await this.hotelRepository.update(hotelId, updateData);
        if (!updatedHotel) {
            throw new Error('Failed to update hotel');
        }
        return updatedHotel;
    }
    async deleteHotel(hotelId) {
        const deletedHotel = await this.hotelRepository.delete(hotelId);
        if (!deletedHotel) {
            throw new Error('Hotel not found');
        }
    }
    async listUnlistHotel(hotelId, status) {
        const hotel = await this.hotelRepository.findById(hotelId);
        if (!hotel) {
            throw new Error('Hotel not found');
        }
        const updatedHotel = await this.hotelRepository.update(hotelId, { isListed: status });
        if (!updatedHotel) {
            throw new Error('Failed to update hotel listing status');
        }
        return updatedHotel;
    }
    async updateAvailability(hotelId, availability) {
        const updatedHotel = await this.hotelRepository.updateAvailability(hotelId, availability);
        if (!updatedHotel) {
            throw new Error('Failed to update hotel availability');
        }
        return updatedHotel;
    }
}
exports.HotelService = HotelService;
