import { Types } from "mongoose";
import { IHotel, IManager, IUser } from "./common.interface";

export interface IAdminService {
    registerAdmin(adminData: { name: string; email: string; password: string }): Promise<void>;
    loginAdmin(email: string, password: string): Promise<{ user: Partial<IUser>; token: string ;refreshToken: string}>;
    listUsers(): Promise<IUser[]>;
    listManagers(): Promise<IManager[]>;
    toggleUserBlock(userId: Types.ObjectId): Promise<IUser[]>;
    listHotels(): Promise<IHotel[]>;
    approveHotel(hotelId: Types.ObjectId, status: boolean): Promise<IHotel>;
    listUnlistHotel(hotelId: Types.ObjectId, status: boolean): Promise<IHotel>;
  }