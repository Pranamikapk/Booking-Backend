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
      const { term, checkInDate } = req.query;

      if (!term || !checkInDate) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json({ message: "Search term and check-in date are required" });
        return;
      }

      const hotels = await this.hotelService.search(
        term as string,
        checkInDate as string
      );
      res.status(HTTP_statusCode.OK).json(hotels);
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
        res.status(403).json({ message: "Unauthorized: Manager ID not found" });
        return;
      }

      const hotel = await this.hotelService.createHotel(hotelData, managerId);
      console.log(hotel);
      
      res.status(201).json(hotel);
    } catch (error) {
      console.error("Error creating hotel:", error);
      res.status(500).json({ message: "Server error while creating hotel" });
    }
  };

  listHotels = async (req: Request, res: Response): Promise<void> => {
    try {
      const managerId = new Types.ObjectId(req.params.managerId);
      const hotels = await this.hotelService.listHotels(managerId);
      res.status(200).json(hotels);
    } catch (error) {
      console.error("Error listing hotels:", error);
      res.status(500).json({ message: "Server error while listing hotels" });
    }
  };

  getHotelById = async (req: Request, res: Response): Promise<void> => {
    try {
      const hotelId = new Types.ObjectId(req.params.hotelId);
      const hotel = await this.hotelService.getHotelById(hotelId);
      res.status(200).json(hotel);
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      res.status(404).json({ message: "Hotel not found" });
    }
  };

  updateHotel = async (req: Request, res: Response): Promise<void> => {
    try {
      const hotelId = new Types.ObjectId(req.params.hotelId);
      const managerId = new Types.ObjectId(req.user_id);
      const updateData: IUpdateHotelDTO = req.body.updatedData;

      if (!managerId) {
        res.status(403).json({ message: "Unauthorized: Manager ID not found" });
        return;
      }

      const updatedHotel = await this.hotelService.updateHotel(hotelId, managerId, updateData);
      res.status(200).json(updatedHotel);
    } catch (error) {
      console.error("Error updating hotel:", error);
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        res.status(403).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Server error while updating hotel" });
      }
    }
  };

  deleteHotel = async (req: Request, res: Response): Promise<void> => {
    try {
      const hotelId = new Types.ObjectId(req.params.hotelId);
      await this.hotelService.deleteHotel(hotelId);
      res.status(200).json({ message: "Hotel deleted successfully" });
    } catch (error) {
      console.error("Error deleting hotel:", error);
      res.status(500).json({ message: "Server error while deleting hotel" });
    }
  };

  listUnlistHotel = async (req: Request, res: Response): Promise<void> => {
    try {
      const hotelId = new Types.ObjectId(req.params.hotelId);
      const { status } = req.body;
      const hotel = await this.hotelService.listUnlistHotel(hotelId, status);
      res.status(200).json(hotel);
    } catch (error) {
      console.error("Error updating hotel listing status:", error);
      res.status(500).json({ message: "Server error while updating hotel listing status" });
    }
  };

  updateAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const hotelId = new Types.ObjectId(req.params.hotelId);
      const { availability } = req.body;
      const hotel = await this.hotelService.updateAvailability(hotelId, availability);
      res.status(200).json(hotel);
    } catch (error) {
      console.error("Error updating hotel availability:", error);
      res.status(500).json({ message: "Server error while updating hotel availability" });
    }
  };
}