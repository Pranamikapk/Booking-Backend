import { Types } from "mongoose";
import { IBooking } from "./common.interface";

export interface IManagerRepository{
     getTotalHotels(managerId: Types.ObjectId): Promise<number> 
     getTotalBookings(managerId: Types.ObjectId): Promise<number>
     getTotalRevenue(managerId: Types.ObjectId): Promise<number> 
     getOccupancyRate(managerId: Types.ObjectId): Promise<number> 
     getMonthlyRevenue(managerId: Types.ObjectId): Promise<number[]>
     getRecentBookings(managerId: Types.ObjectId): Promise<IBooking[]> 
}

export interface IManagerDashboardService {
    getManagerDashboardStats(managerId: Types.ObjectId): Promise<ManagerDashboardStats>;
  }

  export interface ManagerDashboardStats {
    totalHotels: number;
    totalBookings: number;
    totalRevenue: number;
    occupancyRate: number;
    monthlyRevenue: number[];
    recentBookings: Array<{
      id: string;
      guestName: string;
      checkIn: string;
      checkOut: string;
      status: string;
    }>;
  }