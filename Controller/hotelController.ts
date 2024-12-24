import { Request, Response } from "express";
import { Types } from "mongoose";
import HTTP_statusCode from "../Enums/httpStatusCodes";
import { ICreateHotelDTO, IUpdateHotelDTO } from "../Interfaces/common.interface";
import { IHotelService } from "../Interfaces/hotel.service.interface";

export class HotelController {
  constructor(private readonly hotelService: IHotelService) {}

  findAll = async (req: Request, res: Response): Promise<void> => {
    console.log('Inside');
    
    try {
      const hotels = await this.hotelService.findAll();
      res.status(HTTP_statusCode.OK).json(hotels);
    } catch (error: any) {
      res
        .status(HTTP_statusCode.InternalServerError)
        .json({ message: error.message });
    }
  };

  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const { term, checkInDate , checkOutDate} = req.query;
      console.log("Query:",req.query);
      
      if (!term || !checkInDate || !checkOutDate) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json({ message: "Search term and check-in date are required" });
        return;
      }

      const hotels = await this.hotelService.search(
        term as string,
        checkInDate as string,
        checkOutDate as string
      );
      console.log("Hotels:",hotels);
      
      if(!hotels){
        res.status(HTTP_statusCode.NotFound).json({message:"No hotels found"});
      }else{

      res.status(HTTP_statusCode.OK).json(hotels);
    }
    } catch (error: any) {
      console.error("Error searching hotels:", error);
      res
        .status(HTTP_statusCode.InternalServerError)
        .json({ message: "Server error" });
    }
  };

  createHotel = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Inside");
      
      const hotelData: ICreateHotelDTO = req.body;
      const managerId = new Types.ObjectId(req.user_id);

      if (!managerId) {
        res.status(HTTP_statusCode.NoAccess).json({ message: "Unauthorized: Manager ID not found" });
        return;
      }

      const hotel = await this.hotelService.createHotel(hotelData, managerId);
      console.log(hotel);
      
      res.status(HTTP_statusCode.CREATED).json(hotel);
    } catch (error) {
      console.error("Error creating hotel:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Server error while creating hotel" });
    }
  };

  listHotels = async (req: Request, res: Response): Promise<void> => {
    try {
      const managerId = new Types.ObjectId(req.params.managerId);
      const hotels = await this.hotelService.listHotels(managerId);
      res.status(HTTP_statusCode.OK).json(hotels);
    } catch (error) {
      console.error("Error listing hotels:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Server error while listing hotels" });
    }
  };

  getHotelById = async (req: Request, res: Response): Promise<void> => {
    try {
      const hotelId = new Types.ObjectId(req.params.hotelId);
      console.log("Hotel:",hotelId);
      
      if (!hotelId) {
        res.status(400).send("Hotel ID is required");
        return 
    }
      const hotel = await this.hotelService.getHotelById(hotelId);
      res.status(HTTP_statusCode.OK).json(hotel);
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      res.status(HTTP_statusCode.NotFound).json({ message: "Hotel not found" });
    }
  };

  updateHotel = async (req: Request, res: Response): Promise<void> => {
    try {
      const hotelId = new Types.ObjectId(req.params.hotelId);
      const managerId = new Types.ObjectId(req.user_id);
      const updateData: IUpdateHotelDTO = req.body.updatedData;

      if (!managerId) {
        res.status(HTTP_statusCode.Unauthorized).json({ message: "Unauthorized: Manager ID not found" });
        return;
      }

      const updatedHotel = await this.hotelService.updateHotel(hotelId, managerId, updateData);
      res.status(HTTP_statusCode.OK).json(updatedHotel);
    } catch (error) {
      console.error("Error updating hotel:", error);
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        res.status(HTTP_statusCode.Unauthorized).json({ message: error.message });
      } else {
        res.status(HTTP_statusCode.InternalServerError).json({ message: "Server error while updating hotel" });
      }
    }
  };

  deleteHotel = async (req: Request, res: Response): Promise<void> => {
    try {
      const hotelId = new Types.ObjectId(req.params.hotelId);
      await this.hotelService.deleteHotel(hotelId);
      res.status(HTTP_statusCode.OK).json({ message: "Hotel deleted successfully" });
    } catch (error) {
      console.error("Error deleting hotel:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Server error while deleting hotel" });
    }
  };

  listUnlistHotel = async (req: Request, res: Response): Promise<void> => {
    try {
      const hotelId = new Types.ObjectId(req.params.hotelId);
      const { status } = req.body;
      const hotel = await this.hotelService.listUnlistHotel(hotelId, status);
      res.status(HTTP_statusCode.OK).json(hotel);
    } catch (error) {
      console.error("Error updating hotel listing status:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Server error while updating hotel listing status" });
    }
  };

  updateAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const { hotelId } = req.params;
      const { dates,isAvailable } = req.body;
      console.log("Controller:",hotelId,dates,isAvailable);
      
      const hotel = await this.hotelService.updateAvailability(new Types.ObjectId(hotelId), dates, isAvailable);
      if (!hotel) {
        res.status(HTTP_statusCode.NotFound).json({ message: 'Hotel not found' });
        return
      }
      res.status(HTTP_statusCode.OK).json(hotel);
    } catch (error) {
      console.error("Error updating hotel availability:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Server error while updating hotel availability" });
    }
  };
}