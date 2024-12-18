import { Types } from "mongoose";
import { ICreateHotelDTO, IHotel, IUpdateHotelDTO } from "../Interfaces/common.interface";
import { IHotelRepository } from "../Interfaces/hotel.repository.interface";
import { IHotelService } from "../Interfaces/hotel.service.interface";

export class HotelService implements IHotelService {
  private hotelRepository: IHotelRepository;

  constructor(hotelRepository: IHotelRepository) {
    this.hotelRepository = hotelRepository;
  }

  async findAll(): Promise<IHotel[]> {
      return await this.hotelRepository.findAll();
  }

  async search(term: string, checkInDate: string): Promise<IHotel[]> {
      const checkIn = new Date(checkInDate); 
      return await this.hotelRepository.search(term, checkIn);
  }

  async createHotel(hotelData: ICreateHotelDTO, managerId: Types.ObjectId): Promise<IHotel> {
    return await this.hotelRepository.create({...hotelData,
      roomCategories: hotelData.placeType === 'Room' || hotelData.placeType === 'Shared Space'
        ? hotelData.roomCategories.map(category => ({
            ...category,
            availableUnits: category.quantity
          }))
        : []
    }, managerId);
  }

  async listHotels(managerId: Types.ObjectId): Promise<IHotel[]> {
    return await this.hotelRepository.findByManager(managerId);
  }

  async getHotelById(hotelId: Types.ObjectId): Promise<IHotel> {
    const hotel = await this.hotelRepository.findById(hotelId);
    console.log("Hotel:",hotel,hotelId);
    
    if (!hotel) {
      throw new Error('Hotel not found');
    }
    return hotel;
  }

  async updateHotel(hotelId: Types.ObjectId, managerId: Types.ObjectId, updateData: IUpdateHotelDTO): Promise<IHotel> {
    const hotel = await this.hotelRepository.findById(hotelId);
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    if (updateData.roomCategories && Array.isArray(updateData.roomCategories) &&
      (hotel.placeType === 'Room' || hotel.placeType === 'Shared Space')) {
      updateData.roomCategories = updateData.roomCategories.map(category => ({
        ...category,
        availableUnits: category.quantity
      }));
    }

    const updatedHotel = await this.hotelRepository.update(hotelId, updateData);
    if (!updatedHotel) {
      throw new Error('Failed to update hotel');
    }
    return updatedHotel;
  }

  async deleteHotel(hotelId: Types.ObjectId): Promise<void> {
    const deletedHotel = await this.hotelRepository.delete(hotelId);
    if (!deletedHotel) {
      throw new Error('Hotel not found');
    }
  }

  async listUnlistHotel(hotelId: Types.ObjectId, status: boolean): Promise<IHotel> {
    const hotel = await this.hotelRepository.findById(hotelId);
    if (!hotel) {
      throw new Error('Hotel not found');
    }
    const updatedHotel = await this.hotelRepository.update(hotelId, { isListed: status , roomCategories: hotel.roomCategories});
    if (!updatedHotel) {
      throw new Error('Failed to update hotel listing status');
    }
    return updatedHotel;
  }

  
  

  async updateAvailability( hotelId: Types.ObjectId, dates: Date[], isAvailable: boolean): Promise<IHotel> {
    if (!dates || dates.length === 0) {
      throw new Error('Dates array must not be empty');
    }
  console.log("Service:",hotelId,dates,isAvailable);
  
    const updatedHotel = await this.hotelRepository.updateAvailability(hotelId, dates, isAvailable);
    
    if (!updatedHotel) {
      throw new Error('Failed to update hotel availability');
    }
  
    return updatedHotel;
  }
}
