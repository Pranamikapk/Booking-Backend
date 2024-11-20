import express from "express";
import { body } from "express-validator";
import { managerVerifyToken } from "../Config/jwt_config";
import { BookingController } from "../Controller/bookingController";
import { HotelController } from "../Controller/hotelController";
import { ManagerController } from "../Controller/managerController";
import { IBookingService } from "../Interfaces/booking.interface";
import { IHotelService } from "../Interfaces/hotel.service.interface";
import { IManagerService } from "../Interfaces/manager.service";
import BookingModel from "../Model/bookingModel";
import Hotel from "../Model/hotelModel";
import ManagerModel from "../Model/managerModel";
import User from "../Model/userModel";
import { BookingRepository } from "../Repository/bookingRepository";
import { HotelRepository } from "../Repository/hotelRepository";
import { ManagerRepository } from "../Repository/managerRepository";
import { UserRepository } from "../Repository/userRepository";
import { BookingService } from "../Services/bookingService";
import { HotelService } from "../Services/hotelService";
import { ManagerService } from "../Services/managerService";

const managerRouter = express.Router();

const managerRepository = new ManagerRepository(ManagerModel)
const hotelRepository = new HotelRepository(Hotel)
const bookingRepository = new BookingRepository(BookingModel)
const userRepository = new UserRepository(User)

const managerService : IManagerService = new ManagerService(managerRepository)
const hotelService : IHotelService = new HotelService(hotelRepository) 
const bookingService : IBookingService = new BookingService(bookingRepository,userRepository,managerRepository)

const managerController = new ManagerController(managerService)
const hotelController = new HotelController(hotelService)
const bookingController = new BookingController(bookingService)

managerRouter.post(
  "/register",
  [
    body("name").not().isEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("phone").not().isEmpty().withMessage("Invalid phone number"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  managerController.register
);

managerRouter.post("/login", managerController.login);
managerRouter.put("/account", managerVerifyToken, managerController.updateProfile);
// managerRouter.post("/api/auth/google-login", managerController.googleLogin);
managerRouter.post("/resendOtp", managerController.resendOtp);
managerRouter.post("/verifyOtp", managerController.verifyOtp);




managerRouter.post(
  "/addHotel",
  managerVerifyToken,
  (req, res, next) => {
    console.log('Middleware passed. Proceeding to controller.');
    next();
  },
  hotelController.createHotel
);
managerRouter.get("/hotels/:managerId", managerVerifyToken, hotelController.listHotels);
managerRouter.get("/hotel/:hotelId", managerVerifyToken, hotelController.getHotelById);
managerRouter.put("/hotel/:hotelId/edit", managerVerifyToken, hotelController.updateHotel);
managerRouter.put("/list/:hotelId", managerVerifyToken, hotelController.listUnlistHotel);
managerRouter.delete("/hotel/:hotelId", managerVerifyToken, hotelController.deleteHotel);


managerRouter.get("/reservations/:managerId",managerVerifyToken,bookingController.listReservations.bind(bookingController))
managerRouter.get("/reservations/:bookingId",managerVerifyToken,bookingController.bookingDetails)

managerRouter.post("/cancel/:bookingId/approve",managerVerifyToken,bookingController.cancelApprove)
managerRouter.post("/cancel/:bookingId/reject",managerVerifyToken,bookingController.cancelReject)

// managerRouter.get("/transactions", managerAuth ,getManagerTransactions)


export default managerRouter;
