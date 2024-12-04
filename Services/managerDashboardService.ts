import { Types } from 'mongoose';
import { ManagerDashboardStats } from '../Interfaces/manager.dashboard.interface';
import { ManagerDashboardRepository } from '../Repository/managerDashboardRepository';

export class ManagerDashboardService {
  private repository: ManagerDashboardRepository;

  constructor(repository: ManagerDashboardRepository) {
    this.repository = repository;
  }

  async getManagerDashboardStats(managerId: Types.ObjectId): Promise<ManagerDashboardStats> {
    const [
      totalHotels,
      totalBookings,
      totalRevenue,
      occupancyRate,
      monthlyRevenue,
      recentBookings
    ] = await Promise.all([
      this.repository.getTotalHotels(managerId),
      this.repository.getTotalBookings(managerId),
      this.repository.getTotalRevenue(managerId),
      this.repository.getOccupancyRate(managerId),
      this.repository.getMonthlyRevenue(managerId),
      this.repository.getRecentBookings(managerId)
    ]);

    return {
      totalHotels,
      totalBookings,
      totalRevenue,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      monthlyRevenue,
      recentBookings: recentBookings.map(booking => ({
        id: booking._id.toString(),
        guestName: (booking.user as any).name,
        checkIn: booking.checkInDate.toISOString().split('T')[0],
        checkOut: booking.checkOutDate.toISOString().split('T')[0],
        status: booking.status
      }))
    };
  }
}

