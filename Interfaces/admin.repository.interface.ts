import { Types } from "mongoose";
import { IHotel, IManager, IUser } from "./common.interface";

export interface IAdminRepository {
    findAdminByEmail(email: string): Promise<IUser | null>;
    createAdmin(adminData: Partial<IUser>): Promise<IUser>;
    findUserById(id: Types.ObjectId): Promise<IUser | null>;
    findAllClients(): Promise<IUser[]>;
    findAllManagers(): Promise<IManager[]>;
    updateUser(user: IUser): Promise<IUser>;
    findAllHotels(): Promise<IHotel[]>;
    findHotelById(id: Types.ObjectId): Promise<IHotel | null>;
    updateHotel(hotel: IHotel): Promise<IHotel>;
  }