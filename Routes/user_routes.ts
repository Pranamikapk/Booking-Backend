import express, { Request, Response } from "express";
import { body } from "express-validator";
import { verifyToken } from "../Config/jwt_config";
import { HotelController } from "../Controller/hotelController";
import { UserController } from "../Controller/userController";
import { IHotelService } from "../Interfaces/hotel.service.interface";
import { IUserService } from "../Interfaces/user.service.interface";
import Hotel from "../Model/hotelModel";
import User from "../Model/userModel";
import { HotelRepository } from "../Repository/hotelRepository";
import { UserRepository } from "../Repository/userRepository";
import { HotelService } from "../Services/hotelService";
import { UserService } from "../Services/userService";

const userRouter = express.Router();

const userRepository = new UserRepository(User);
const hotelRepository = new HotelRepository(Hotel);

const userService: IUserService = new UserService(userRepository);
const hotelService: IHotelService = new HotelService(hotelRepository);

const userController = new UserController(userService);
const hotelController = new HotelController(hotelService);

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

export default userRouter;
