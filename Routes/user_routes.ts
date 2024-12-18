import express, { Request, Response } from "express";
import { body } from "express-validator";
import { verifyToken } from "../Config/jwt_config";
import { BookingController } from "../Controller/bookingController";
import { ChatController } from "../Controller/chatController";
import { HotelController } from "../Controller/hotelController";
import { TransactionController } from "../Controller/transactionController";
import { UserController } from "../Controller/userController";
import { IBookingService } from "../Interfaces/booking.interface";
import { IHotelService } from "../Interfaces/hotel.service.interface";
import { ITransactionService } from "../Interfaces/transaction.interface";
import { IUserService } from "../Interfaces/user.service.interface";
import BookingModel from "../Model/bookingModel";
import chatModel from "../Model/chatModel";
import Hotel from "../Model/hotelModel";
import ManagerModel from "../Model/managerModel";
import User from "../Model/userModel";
import { BookingRepository } from "../Repository/bookingRepository";
import ChatRepository from "../Repository/chatRepository";
import { HotelRepository } from "../Repository/hotelRepository";
import { ManagerRepository } from "../Repository/managerRepository";
import { TransactionRepository } from "../Repository/transactionRepository";
import { UserRepository } from "../Repository/userRepository";
import { BookingService } from "../Services/bookingService";
import ChatService from "../Services/chatService";
import { HotelService } from "../Services/hotelService";
import { TransactionService } from "../Services/transactionServices";
import { UserService } from "../Services/userService";

const userRouter = express.Router();

const userRepository = new UserRepository(User);
const managerRepository = new ManagerRepository(ManagerModel)
const hotelRepository = new HotelRepository(Hotel);
const bookingRepository = new BookingRepository(BookingModel)
const chatRepository = new ChatRepository(chatModel)
const transactionRepository = new TransactionRepository(BookingModel,ManagerModel)

const userService: IUserService = new UserService(userRepository);
const hotelService: IHotelService = new HotelService(hotelRepository);
const bookingService: IBookingService = new BookingService(bookingRepository,userRepository,managerRepository,hotelRepository)
const chatService = new ChatService(chatRepository)
const transactionService : ITransactionService = new TransactionService(transactionRepository)

const userController = new UserController(userService);
const hotelController = new HotelController(hotelService);
const bookingController = new BookingController(bookingService)
const chatController = new ChatController(chatService)
const transactionController = new TransactionController(transactionService)

userRouter.post(
  "/register",
  [
    body("name").not().isEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  (req: Request, res: Response) => userController.userRegister(req, res)
);

userRouter.post("/verifyOtp", (req: Request, res: Response) =>
  userController.verifyOtp(req, res)
);

userRouter.post("/resendOtp", (req: Request, res: Response) =>
  userController.resendOtp(req, res)
);

userRouter.post("/login", (req: Request, res: Response) =>
  userController.login(req, res)
);

userRouter.post("/refresh-token", userController.verifyRefreshToken );

userRouter.post("/api/auth/google-login", (req: Request, res: Response) =>
  userController.googleLogin(req, res)
);

userRouter.put("/user", verifyToken, (req: Request, res: Response) =>
  userController.updateUser(req, res)
);

userRouter.post("/forgotPassword", (req: Request, res: Response) =>
  userController.forgotPassword(req, res)
);

userRouter.post("/resetPassword", (req: Request, res: Response) =>
  userController.resetPassword(req, res)
);

userRouter.get("/hotels", (req: Request, res: Response) =>
    hotelController.findAll(req, res)
  );

userRouter.get("/search", (req: Request, res: Response) =>
  hotelController.search(req, res)
);

userRouter.get("/hotel/:hotelId", (req: Request, res: Response) =>
  hotelController.getHotelById(req, res)
);

userRouter.post("/:hotelId/availability",(req: Request,res: Response)=>{
  bookingController.checkAvailability(req,res)
})

userRouter.post("/booking" , (req: Request, res: Response) =>
  bookingController.createBooking(req,res) 
)

userRouter.post("/verifyPayment" , (req: Request, res: Response) =>
  bookingController.verifyPayment(req,res) 
)

userRouter.post('/walletPayment',verifyToken, (req: Request, res: Response) =>
  bookingController.walletPayment(req,res)
)


userRouter.get("/listBookings" ,verifyToken,
  bookingController.listBookings.bind(bookingController)
)

userRouter.get('/transactions', verifyToken, (req: Request, res: Response) =>
  transactionController.getUserTransactions(req,res)
);


userRouter.get("/booking/:bookingId",verifyToken, (req: Request, res: Response) =>
  bookingController.bookingDetails(req,res)
)

userRouter.post("/cancelRequest", bookingController.cancelRequest.bind(bookingController))


userRouter.post('/send', verifyToken, chatController.sendMessage);
userRouter.get('/rooms', verifyToken, chatController.getChatRooms);
userRouter.get('/:bookingId', verifyToken, chatController.getMessages);


export default userRouter;
