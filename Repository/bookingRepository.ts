import { Model } from 'mongoose';
import { IBookingRepository } from '../Interfaces/booking.interface';
import { IBooking } from '../Interfaces/common.interface';

export class BookingRepository implements IBookingRepository {
  constructor(private bookingModel: Model<IBooking>) {}

  async create(bookingData: Partial<IBooking>): Promise<IBooking> {
    const booking = new this.bookingModel(bookingData);
    return await booking.save();
  }

  async findById(id: string): Promise<IBooking | null> {
    return await this.bookingModel.findById(id).populate('hotel');
  }

  async update(id: string, updateData: Partial<IBooking>): Promise<IBooking | null> {
    return await this.bookingModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async findByUserId(userId: string): Promise<IBooking[]> {
    return await this.bookingModel.find({ user: userId }).populate('hotel');
  }

  async findByHotelIds(hotelIds: string[]): Promise<IBooking[]> {
    return await this.bookingModel.find({ hotel: { $in: hotelIds } })
      .populate('user', 'name email phone')
      .populate('hotel', 'name address propertyType placeType')
      .sort({ checkInDate: 1 });
  }
}