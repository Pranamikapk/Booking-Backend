import { Types } from "mongoose";
import { ICreateHotelDTO, IHotel, IUpdateHotelDTO } from "./common.interface";

export interface IHotelService {
    findAll(): Promise<IHotel[]>;
    search(term: string, checkInDate: string): Promise<IHotel[]>;
    createHotel(hotelData: ICreateHotelDTO, managerId: Types.ObjectId): Promise<IHotel>;
    listHotels(managerId: Types.ObjectId): Promise<IHotel[]>;
    getHotelById(hotelId: Types.ObjectId): Promise<IHotel>;
    updateHotel(hotelId: Types.ObjectId, managerId: Types.ObjectId, updateData: IUpdateHotelDTO): Promise<IHotel>;
    deleteHotel(hotelId: Types.ObjectId): Promise<void>;
    listUnlistHotel(hotelId: Types.ObjectId, status: boolean): Promise<IHotel>;
    updateAvailability(hotelId: Types.ObjectId, availability: IHotel['availability']): Promise<IHotel>;
  }