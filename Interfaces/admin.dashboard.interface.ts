
export interface IDashboardRepository {
  getTotalUsers(): Promise<number>;
  getTotalManagers(): Promise<number>;
  getTotalHotels(): Promise<number>;
  getTotalBookings(): Promise<number>;
  getMonthlyBookings(): Promise<{ month: number; count: number }[]>;
  getRecentActivity(limit: number): Promise<{
    activity: string;
    date: Date;
    user: string;
  }[]>;
}

export interface IDashboardService {
    getDashboardStats(): Promise<{
      totalUsers: number;
      totalManagers: number;
      totalHotels: number;
      totalBookings: number;
      monthlyBookings: number[];
      recentActivity: {
        activity: string;
        date: string;
        user: string;
      }[];
    }>;
  }
  
  