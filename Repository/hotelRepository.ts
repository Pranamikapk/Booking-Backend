import { Model, Types } from "mongoose";
import { ICreateHotelDTO, IHotel, IUpdateHotelDTO } from "../Interfaces/common.interface";
import { IHotelRepository } from "../Interfaces/hotel.repository.interface";
import Hotel from "../Model/hotelModel";

  export class HotelRepository implements IHotelRepository {
    private hotelModel: Model<IHotel>; 

    constructor(hotelModel: Model<IHotel>) {
      this.hotelModel = hotelModel;
    }  
    
    async findAll(): Promise<IHotel[]> {
      console.log('Repos');
      
      return this.hotelModel.find({isListed:true});
    }
    
    async search(term: string, checkInDate: Date): Promise<IHotel[]> {
      return Hotel.find({
        $and: [
          {
            $or: [
              { "address.state": { $regex: term, $options: "i" } },
              { "rooms.room": { $regex: term, $options: "i" } },
            ],
          },
          {
            bookings: {
              $not: {
                $elemMatch: {
                  checkIn: { $lte: checkInDate },
                  checkOut: { $gte: checkInDate },
                },
              },
            },
          },
          { isListed: true },
        ],
      });
    }
    async create(hotelData: ICreateHotelDTO, managerId: Types.ObjectId): Promise<IHotel> {
      const hotel = new this.hotelModel({ ...hotelData, manager: managerId });
      return await hotel.save();
    }
  
    async findByManager(managerId: Types.ObjectId): Promise<IHotel[]> {
      return await this.hotelModel.find({ manager: managerId });
    }
  
    async findById(hotelId: Types.ObjectId): Promise<IHotel | null> {
      return await this.hotelModel.findById(hotelId);
    }
  
    async update(hotelId: Types.ObjectId, updateData: IUpdateHotelDTO): Promise<IHotel | null> {
      return await this.hotelModel.findByIdAndUpdate(hotelId, updateData, { new: true });
    }
  
    async delete(hotelId: Types.ObjectId): Promise<IHotel | null> {
      return await this.hotelModel.findByIdAndDelete(hotelId);
    }
  
    async updateAvailability(hotelId: Types.ObjectId, availability: IHotel['availability']): Promise<IHotel | null> {
      return await this.hotelModel.findByIdAndUpdate(hotelId, { availability }, { new: true });
    }
  }