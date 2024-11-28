import { Model } from 'mongoose';
import { IDashboardRepository } from '../Interfaces/admin.dashboard.interface';
import { IBooking, IHotel, IManager, IUser } from '../Interfaces/common.interface';

export class DashboardRepository implements IDashboardRepository {
  constructor(
    private userModel: Model<IUser>,
    private managerModel: Model<IManager>,
    private hotelModel: Model<IHotel>,
    private bookingModel: Model<IBooking>
  ) {}

  async getTotalUsers(): Promise<number> {
    return this.userModel.countDocuments();
  }

  async getTotalManagers(): Promise<number> {
    return this.managerModel.countDocuments();
  }

  async getTotalHotels(): Promise<number> {
    return this.hotelModel.countDocuments();
  }

  async getTotalBookings(): Promise<number> {
    return this.bookingModel.countDocuments();
  }

  async getMonthlyBookings(): Promise<{ month: number; count: number }[]> {
    const currentYear = new Date().getFullYear();
    return this.bookingModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          month: "$_id",
          count: 1,
          _id: 0
        }
      },
      { $sort: { month: 1 } }
    ]);
  }

  async getRecentActivity(limit: number): Promise<{ activity: string; date: Date; user: string; }[]> {
    const recentBookings = await this.bookingModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name')
      .lean();

    return recentBookings.map(booking => ({
      activity: 'New Booking',
      date: booking.createdAt!,
      user: (booking.user as IUser).name || 'Unknown User'
    }));
  }
}

