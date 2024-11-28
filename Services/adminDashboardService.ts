import { IDashboardRepository, IDashboardService } from "../Interfaces/admin.dashboard.interface";

export class DashboardService implements IDashboardService {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalManagers,
      totalHotels,
      totalBookings,
      monthlyBookingsData,
      recentActivityData
    ] = await Promise.all([
      this.dashboardRepository.getTotalUsers(),
      this.dashboardRepository.getTotalManagers(),
      this.dashboardRepository.getTotalHotels(),
      this.dashboardRepository.getTotalBookings(),
      this.dashboardRepository.getMonthlyBookings(),
      this.dashboardRepository.getRecentActivity(5)
    ]);

    const monthlyBookings = new Array(12).fill(0);
    monthlyBookingsData.forEach(item => {
      monthlyBookings[item.month - 1] = item.count;
    });

    const recentActivity = recentActivityData.map(item => ({
      activity: item.activity,
      date: item.date.toISOString().split('T')[0],
      user: item.user
    }));

    return {
      totalUsers,
      totalManagers,
      totalHotels,
      totalBookings,
      monthlyBookings,
      recentActivity
    };
  }
}

