import { Types } from 'mongoose';
import { IBooking } from '../Interfaces/common.interface';
import BookingModel from '../Model/bookingModel';
import Hotel from '../Model/hotelModel';


export class ManagerDashboardRepository {
  async getTotalHotels(managerId: Types.ObjectId): Promise<number> {
    return Hotel.countDocuments({ manager: managerId });
  }

  async getTotalBookings(managerId: Types.ObjectId): Promise<number> {
    const hotels = await Hotel.find({ manager: managerId });
    const hotelIds = hotels.map(hotel => hotel._id);
    return BookingModel.countDocuments({ hotel: { $in: hotelIds } });
  }

  async getTotalRevenue(managerId: Types.ObjectId): Promise<number> {
    const hotels = await Hotel.find({ manager: managerId });
    const hotelIds = hotels.map(hotel => hotel._id);
    const bookings = await BookingModel.find({ hotel: { $in: hotelIds } ,  async getTotalRevenue(managerId: Types.ObjectId): Promise<number> {
        const hotels = await Hotel.find({ manager: managerId });
        const hotelIds = hotels.map(hotel => hotel._id);
        const bookings = await BookingModel.find({ hotel: { $in: hotelIds } ,status: { $or: [{ status: 'Completed' }, { status: 'Rejected' }] }
        });
        return bookings.reduce((total, booking) => total + booking.totalPrice, 0);
      }});
    return bookings.reduce((total, booking) => total + booking.totalPrice, 0);
  }

  async getOccupancyRate(managerId: Types.ObjectId): Promise<number> {
    const hotels = await Hotel.find({ manager: managerId });
    const hotelIds = hotels.map(hotel => hotel._id);
    const totalRooms = hotels.reduce((total, hotel) => total + hotel.rooms.bedrooms, 0);
    const occupiedRooms = await BookingModel.countDocuments({
      hotel: { $in: hotelIds },
      status: 'Completed',
      checkOutDate: { $gte: new Date() }
    });
    return (occupiedRooms / totalRooms) * 100;
  }

  async getMonthlyRevenue(managerId: Types.ObjectId): Promise<number[]> {
    const hotels = await Hotel.find({ manager: managerId });
    const hotelIds = hotels.map(hotel => hotel._id);
    const bookings = await BookingModel.find({ 
      hotel: { $in: hotelIds },
      createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) }
    });

    const monthlyRevenue = new Array(12).fill(0);
    bookings.forEach(booking => {
      const month = booking.createdAt!.getMonth();
      monthlyRevenue[month] += booking.totalPrice;
    });

    return monthlyRevenue;
  }

  async getRecentBookings(managerId: Types.ObjectId): Promise<IBooking[]> {
    const hotels = await Hotel.find({ manager: managerId });
    const hotelIds = hotels.map(hotel => hotel._id);
    return BookingModel.find({ hotel: { $in: hotelIds } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name')
      .populate('hotel', 'name');
  }
}

