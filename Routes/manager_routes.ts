import express, { Request, Response } from "express";
import { body } from "express-validator";
import { managerVerifyToken } from "../Config/jwt_config";
import { BookingController } from "../Controller/bookingController";
import { ChatController } from "../Controller/chatController";
import { HotelController } from "../Controller/hotelController";
import { ManagerController } from "../Controller/managerController";
import { TransactionController } from "../Controller/transactionController";
import { IBookingService } from "../Interfaces/booking.interface";
import { IHotelService } from "../Interfaces/hotel.service.interface";
import { IManagerService } from "../Interfaces/manager.service";
import { ITransactionService } from "../Interfaces/transaction.interface";
import BookingModel from "../Model/bookingModel";
import chatModel from "../Model/chatModel";
import Hotel from "../Model/hotelModel";
import ManagerModel from "../Model/managerModel";
import User from "../Model/userModel";
import { BookingRepository } from "../Repository/bookingRepository";
import ChatRepository from "../Repository/chatRepository";
import { HotelRepository } from "../Repository/hotelRepository";
import { ManagerDashboardRepository } from "../Repository/managerDashboardRepository";
import { ManagerRepository } from "../Repository/managerRepository";
import { TransactionRepository } from "../Repository/transactionRepository";
import { UserRepository } from "../Repository/userRepository";
import { BookingService } from "../Services/bookingService";
import ChatService from "../Services/chatService";
import { HotelService } from "../Services/hotelService";
import { ManagerDashboardService } from "../Services/managerDashboardService";
import { ManagerService } from "../Services/managerService";
import { TransactionService } from "../Services/transactionServices";

const managerRouter = express.Router();

const managerRepository = new ManagerRepository(ManagerModel);
const hotelRepository = new HotelRepository(Hotel);
const bookingRepository = new BookingRepository(BookingModel);
const userRepository = new UserRepository(User);
const transactionRepository = new TransactionRepository(
  BookingModel,
  ManagerModel
);
const chatRepository = new ChatRepository(chatModel);
const managerDashboardRepository = new ManagerDashboardRepository()

const managerService: IManagerService = new ManagerService(managerRepository);
const hotelService: IHotelService = new HotelService(hotelRepository);
const bookingService: IBookingService = new BookingService(
  bookingRepository,
  userRepository,
  managerRepository
);
const transactionService: ITransactionService = new TransactionService(
  transactionRepository
);
const chatService = new ChatService(chatRepository);
const managerDashboardService = new ManagerDashboardService(managerDashboardRepository)

const managerController = new ManagerController(managerService,managerDashboardService);
const hotelController = new HotelController(hotelService);
const bookingController = new BookingController(bookingService);
const transactionController = new TransactionController(transactionService);
const chatController = new ChatController(chatService);

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
managerRouter.put(
  "/account",
  managerVerifyToken,
  managerController.updateProfile
);
// managerRouter.post("/api/auth/google-login", managerController.googleLogin);
managerRouter.post("/resendOtp", managerController.resendOtp);
managerRouter.post("/verifyOtp", managerController.verifyOtp);

managerRouter.post(
  "/addHotel",
  managerVerifyToken,
  (req, res, next) => {
    console.log("Middleware passed. Proceeding to controller.");
    next();
  },
  hotelController.createHotel
);
managerRouter.get(
  "/hotels/:managerId",
  managerVerifyToken,(req: Request, res: Response) =>
  hotelController.listHotels(req,res)
);
managerRouter.get(
  "/hotel/:hotelId",
  managerVerifyToken,(req: Request, res: Response) =>
  hotelController.getHotelById(req,res)
);
managerRouter.put(
  "/hotel/:hotelId/edit",
  managerVerifyToken,(req: Request, res: Response) =>
  hotelController.updateHotel(req,res)
);
managerRouter.put(
  "/list/:hotelId",
  managerVerifyToken,(req: Request, res: Response) =>

  hotelController.listUnlistHotel(req,res)
);
managerRouter.delete(
  "/hotel/:hotelId",
  managerVerifyToken,(req: Request, res: Response) =>

  hotelController.deleteHotel(req,res)
);

managerRouter.get(
  "/reservations/:managerId",
  managerVerifyToken,
  bookingController.listReservations.bind(bookingController)
);
managerRouter.get(
  "/reservations/:bookingId",
  managerVerifyToken,(req: Request, res: Response) =>
    bookingController.reservationDetails(req, res)
);

managerRouter.post(
  "/cancel/:bookingId/approve",
  managerVerifyToken,(req: Request, res: Response) =>

  bookingController.cancelApprove(req,res)
);
managerRouter.post(
  "/cancel/:bookingId/reject",
  managerVerifyToken,(req: Request, res: Response) =>
  bookingController.cancelReject(req,res)
);

managerRouter.get(
  "/transactions",
  managerVerifyToken,(req: Request, res: Response) =>
  transactionController.getManagerTransactions(req,res)
);

managerRouter.get("/stats", managerVerifyToken, managerController.getManagerDashboardStats);


managerRouter.post('/send', managerVerifyToken, chatController.sendMessage);
managerRouter.get('/rooms', managerVerifyToken, chatController.getChatRooms);
managerRouter.get('/:bookingId', managerVerifyToken, chatController.getMessages);

export default managerRouter;
