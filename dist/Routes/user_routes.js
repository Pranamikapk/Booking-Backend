"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const jwt_config_1 = require("../Config/jwt_config");
const hotelController_1 = require("../Controller/hotelController");
const userController_1 = require("../Controller/userController");
const hotelModel_1 = __importDefault(require("../Model/hotelModel"));
const userModel_1 = __importDefault(require("../Model/userModel"));
const hotelRepository_1 = require("../Repository/hotelRepository");
const userRepository_1 = require("../Repository/userRepository");
const hotelService_1 = require("../Services/hotelService");
const userService_1 = require("../Services/userService");
const userRouter = express_1.default.Router();
const userRepository = new userRepository_1.UserRepository(userModel_1.default);
const hotelRepository = new hotelRepository_1.HotelRepository(hotelModel_1.default);
const userService = new userService_1.UserService(userRepository);
const hotelService = new hotelService_1.HotelService(hotelRepository);
const userController = new userController_1.UserController(userService);
const hotelController = new hotelController_1.HotelController(hotelService);
userRouter.post("/register", [
    (0, express_validator_1.body)("name").not().isEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("email").isEmail().withMessage("Invalid email address"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
], (req, res) => userController.userRegister(req, res));
userRouter.post("/verifyOtp", (req, res) => userController.verifyOtp(req, res));
userRouter.post("/resendOtp", (req, res) => userController.resendOtp(req, res));
userRouter.post("/login", (req, res) => userController.login(req, res));
userRouter.post("/api/auth/google-login", (req, res) => userController.googleLogin(req, res));
userRouter.put("/user", jwt_config_1.verifyToken, (req, res) => userController.updateUser(req, res));
userRouter.post("/forgotPassword", (req, res) => userController.forgotPassword(req, res));
userRouter.post("/resetPassword", (req, res) => userController.resetPassword(req, res));
userRouter.get("/hotels", (req, res) => hotelController.findAll(req, res));
userRouter.get("/search", (req, res) => hotelController.search(req, res));
exports.default = userRouter;
