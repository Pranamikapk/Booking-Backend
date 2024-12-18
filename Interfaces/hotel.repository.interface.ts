import { Types } from "mongoose";
import { ICreateHotelDTO, IHotel, IUpdateHotelDTO } from "./common.interface";

export interface IHotelRepository {
    findAll(): Promise<IHotel[]>;
    search(term: string, checkInDate: Date): Promise<IHotel[]>;
    create(hotelData: ICreateHotelDTO, managerId: Types.ObjectId): Promise<IHotel>;
    findByManager(managerId: Types.ObjectId): Promise<IHotel[]>;
    findById(hotelId: Types.ObjectId): Promise<IHotel | null>;
    update(hotelId: Types.ObjectId, updateData: IUpdateHotelDTO): Promise<IHotel | null>;
    delete(hotelId: Types.ObjectId): Promise<IHotel | null>;
    updateAvailability(hotelId: Types.ObjectId, dates: Date[], isAvailable: boolean): Promise<IHotel | null> 
    }
  