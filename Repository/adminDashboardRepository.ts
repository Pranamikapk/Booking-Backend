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
    const activities: { activity: string; date: Date; user: string; }[] = [];

    const recentBookings = await this.bookingModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name')
      .lean();

    activities.push(...recentBookings.map(booking => ({
      activity: 'New Booking',
      date: booking.createdAt!,
      user: (booking.user as IUser).name || 'Unknown User'
    })));

    const cancellationRequests = await this.bookingModel
      .find({ status: 'Cancellation_pending' })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate('user', 'name')
      .lean();

    activities.push(...cancellationRequests.map(booking => ({
      activity: 'Cancellation Request',
      date: booking.updatedAt!,
      user: (booking.user as IUser).name || 'Unknown User'
    })));

    const newHotels = await this.hotelModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('manager', 'name')
      .lean();

    activities.push(...newHotels.map(hotel => ({
      activity: 'New Hotel Added',
      date: hotel.createdAt!,
      user: (hotel.manager as IManager).name || 'Unknown Manager'
    })));

    const newUsers = await this.userModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    activities.push(...newUsers.map(user => ({
      activity: 'New User Registered',
      date: user.createdAt!,
      user: user.name || 'Unknown User'
    })));

    const newManagers = await this.managerModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    activities.push(...newManagers.map(manager => ({
      activity: 'New Manager Registered',
      date: manager.createdAt!,
      user: manager.name || 'Unknown Manager'
    })));

    // Manager Approval Requests
    const managerApprovalRequests = await this.managerModel
      .find({ isApproved: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    activities.push(...managerApprovalRequests.map(manager => ({
      activity: 'Manager Approval Request',
      date: manager.createdAt!,
      user: manager.name || 'Unknown Manager'
    })));

    // Hotel Verification Requests
    const hotelVerificationRequests = await this.hotelModel
      .find({ isVerified: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('manager', 'name')
      .lean();

    activities.push(...hotelVerificationRequests.map(hotel => ({
      activity: 'Hotel Verification Request',
      date: hotel.createdAt!,
      user: (hotel.manager as IManager).name || 'Unknown Manager'
    })));

    return activities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }
}

