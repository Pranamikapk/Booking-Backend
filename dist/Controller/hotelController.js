"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelController = void 0;
const mongoose_1 = require("mongoose");
const httpStatusCodes_1 = __importDefault(require("../Enums/httpStatusCodes"));
class HotelController {
    constructor(hotelService) {
        this.hotelService = hotelService;
        this.findAll = async (req, res) => {
            console.log('Inside');
            try {
                const hotels = await this.hotelService.findAll();
                res.status(httpStatusCodes_1.default.OK).json(hotels);
            }
            catch (error) {
                res
                    .status(httpStatusCodes_1.default.InternalServerError)
                    .json({ message: error.message });
            }
        };
        this.search = async (req, res) => {
            try {
                const { term, checkInDate } = req.query;
                if (!term || !checkInDate) {
                    res
                        .status(httpStatusCodes_1.default.BadRequest)
                        .json({ message: "Search term and check-in date are required" });
                    return;
                }
                const hotels = await this.hotelService.search(term, checkInDate);
                res.status(httpStatusCodes_1.default.OK).json(hotels);
            }
            catch (error) {
                console.error("Error searching hotels:", error);
                res
                    .status(httpStatusCodes_1.default.InternalServerError)
                    .json({ message: "Server error" });
            }
        };
        this.createHotel = async (req, res) => {
            try {
                console.log("Inside");
                const hotelData = req.body;
                const managerId = new mongoose_1.Types.ObjectId(req.user_id);
                if (!managerId) {
                    res.status(403).json({ message: "Unauthorized: Manager ID not found" });
                    return;
                }
                const hotel = await this.hotelService.createHotel(hotelData, managerId);
                console.log(hotel);
                res.status(201).json(hotel);
            }
            catch (error) {
                console.error("Error creating hotel:", error);
                res.status(500).json({ message: "Server error while creating hotel" });
            }
        };
        this.listHotels = async (req, res) => {
            try {
                const managerId = new mongoose_1.Types.ObjectId(req.params.managerId);
                const hotels = await this.hotelService.listHotels(managerId);
                res.status(200).json(hotels);
            }
            catch (error) {
                console.error("Error listing hotels:", error);
                res.status(500).json({ message: "Server error while listing hotels" });
            }
        };
        this.getHotelById = async (req, res) => {
            try {
                const hotelId = new mongoose_1.Types.ObjectId(req.params.hotelId);
                const hotel = await this.hotelService.getHotelById(hotelId);
                res.status(200).json(hotel);
            }
            catch (error) {
                console.error("Error fetching hotel details:", error);
                res.status(404).json({ message: "Hotel not found" });
            }
        };
        this.updateHotel = async (req, res) => {
            try {
                const hotelId = new mongoose_1.Types.ObjectId(req.params.hotelId);
                const managerId = new mongoose_1.Types.ObjectId(req.user_id);
                const updateData = req.body.updatedData;
                if (!managerId) {
                    res.status(403).json({ message: "Unauthorized: Manager ID not found" });
                    return;
                }
                const updatedHotel = await this.hotelService.updateHotel(hotelId, managerId, updateData);
                res.status(200).json(updatedHotel);
            }
            catch (error) {
                console.error("Error updating hotel:", error);
                if (error instanceof Error && error.message.includes('Unauthorized')) {
                    res.status(403).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: "Server error while updating hotel" });
                }
            }
        };
        this.deleteHotel = async (req, res) => {
            try {
                const hotelId = new mongoose_1.Types.ObjectId(req.params.hotelId);
                await this.hotelService.deleteHotel(hotelId);
                res.status(200).json({ message: "Hotel deleted successfully" });
            }
            catch (error) {
                console.error("Error deleting hotel:", error);
                res.status(500).json({ message: "Server error while deleting hotel" });
            }
        };
        this.listUnlistHotel = async (req, res) => {
            try {
                const hotelId = new mongoose_1.Types.ObjectId(req.params.hotelId);
                const { status } = req.body;
                const hotel = await this.hotelService.listUnlistHotel(hotelId, status);
                res.status(200).json(hotel);
            }
            catch (error) {
                console.error("Error updating hotel listing status:", error);
                res.status(500).json({ message: "Server error while updating hotel listing status" });
            }
        };
        this.updateAvailability = async (req, res) => {
            try {
                const hotelId = new mongoose_1.Types.ObjectId(req.params.hotelId);
                const { availability } = req.body;
                const hotel = await this.hotelService.updateAvailability(hotelId, availability);
                res.status(200).json(hotel);
            }
            catch (error) {
                console.error("Error updating hotel availability:", error);
                res.status(500).json({ message: "Server error while updating hotel availability" });
            }
        };
    }
}
exports.HotelController = HotelController;
