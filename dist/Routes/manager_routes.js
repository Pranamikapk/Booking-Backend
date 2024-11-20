"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const jwt_config_1 = require("../Config/jwt_config");
const bookingController_1 = require("../Controller/bookingController");
const hotelController_1 = require("../Controller/hotelController");
const managerController_1 = require("../Controller/managerController");
const bookingModel_1 = __importDefault(require("../Model/bookingModel"));
const hotelModel_1 = __importDefault(require("../Model/hotelModel"));
const managerModel_1 = __importDefault(require("../Model/managerModel"));
const userModel_1 = __importDefault(require("../Model/userModel"));
const bookingRepository_1 = require("../Repository/bookingRepository");
const hotelRepository_1 = require("../Repository/hotelRepository");
const managerRepository_1 = require("../Repository/managerRepository");
const userRepository_1 = require("../Repository/userRepository");
const bookingService_1 = require("../Services/bookingService");
const hotelService_1 = require("../Services/hotelService");
const managerService_1 = require("../Services/managerService");
const managerRouter = express_1.default.Router();
const managerRepository = new managerRepository_1.ManagerRepository(managerModel_1.default);
const hotelRepository = new hotelRepository_1.HotelRepository(hotelModel_1.default);
const bookingRepository = new bookingRepository_1.BookingRepository(bookingModel_1.default);
const userRepository = new userRepository_1.UserRepository(userModel_1.default);
const managerService = new managerService_1.ManagerService(managerRepository);
const hotelService = new hotelService_1.HotelService(hotelRepository);
const bookingService = new bookingService_1.BookingService(bookingRepository, userRepository, managerRepository);
const managerController = new managerController_1.ManagerController(managerService);
const hotelController = new hotelController_1.HotelController(hotelService);
const bookingController = new bookingController_1.BookingController(bookingService);
managerRouter.post("/register", [
    (0, express_validator_1.body)("name").not().isEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("email").isEmail().withMessage("Invalid email address"),
    (0, express_validator_1.body)("phone").not().isEmpty().withMessage("Invalid phone number"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
], managerController.register);
managerRouter.post("/login", managerController.login);
managerRouter.put("/account", jwt_config_1.managerVerifyToken, managerController.updateProfile);
// managerRouter.post("/api/auth/google-login", managerController.googleLogin);
managerRouter.post("/resendOtp", managerController.resendOtp);
managerRouter.post("/verifyOtp", managerController.verifyOtp);
managerRouter.post("/addHotel", jwt_config_1.managerVerifyToken, (req, res, next) => {
    console.log('Middleware passed. Proceeding to controller.');
    next();
}, hotelController.createHotel);
managerRouter.get("/hotels/:managerId", jwt_config_1.managerVerifyToken, hotelController.listHotels);
managerRouter.get("/hotel/:hotelId", jwt_config_1.managerVerifyToken, hotelController.getHotelById);
managerRouter.put("/hotel/:hotelId/edit", jwt_config_1.managerVerifyToken, hotelController.updateHotel);
managerRouter.put("/list/:hotelId", jwt_config_1.managerVerifyToken, hotelController.listUnlistHotel);
managerRouter.delete("/hotel/:hotelId", jwt_config_1.managerVerifyToken, hotelController.deleteHotel);
managerRouter.get("/reservations/:managerId", jwt_config_1.managerVerifyToken, bookingController.listReservations);
managerRouter.get("/reservations/:bookingId", jwt_config_1.managerVerifyToken, bookingController.bookingDetails);
managerRouter.post("/cancel/:bookingId/approve", jwt_config_1.managerVerifyToken, bookingController.cancelApprove);
managerRouter.post("/cancel/:bookingId/reject", jwt_config_1.managerVerifyToken, bookingController.cancelReject);
// managerRouter.get("/transactions", managerAuth ,getManagerTransactions)
exports.default = managerRouter;
