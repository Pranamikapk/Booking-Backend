import express from "express";
import { adminVerifyToken } from "../Config/jwt_config";
import { AdminController } from "../Controller/adminController";
import { TransactionController } from "../Controller/transactionController";
import { IDashboardService } from "../Interfaces/admin.dashboard.interface";
import { IAdminService } from "../Interfaces/admin.service.interface";
import { IHotelService } from "../Interfaces/hotel.service.interface";
import { IManagerService } from "../Interfaces/manager.service";
import { ITransactionService } from "../Interfaces/transaction.interface";
import BookingModel from "../Model/bookingModel";
import Hotel from "../Model/hotelModel";
import ManagerModel from "../Model/managerModel";
import User from "../Model/userModel";
import { DashboardRepository } from "../Repository/adminDashboardRepository";
import { AdminRepository } from "../Repository/adminRepository";
import { HotelRepository } from "../Repository/hotelRepository";
import { ManagerRepository } from "../Repository/managerRepository";
import { TransactionRepository } from "../Repository/transactionRepository";
import { DashboardService } from "../Services/adminDashboardService";
import { AdminService } from "../Services/adminServices";
import { HotelService } from "../Services/hotelService";
import { ManagerService } from "../Services/managerService";
import { TransactionService } from "../Services/transactionServices";

const adminRouter = express.Router();

const adminRepository = new AdminRepository(User,ManagerModel,Hotel)
const hotelRepository = new HotelRepository(Hotel)
const managerRepository = new ManagerRepository(ManagerModel)
const transactionRepository = new TransactionRepository(BookingModel,ManagerModel)
const dashboardRepository = new DashboardRepository(User,ManagerModel,Hotel,BookingModel)

const adminService : IAdminService = new AdminService(adminRepository)
const hotelService : IHotelService = new HotelService(hotelRepository)
const managerService : IManagerService = new ManagerService(managerRepository)
const transactionService : ITransactionService = new TransactionService(transactionRepository)
const dashboardService : IDashboardService = new DashboardService(dashboardRepository)

const adminController = new AdminController(adminService,dashboardService)
const transactionController = new TransactionController(transactionService)

adminRouter.post("/register", adminController.registerAdmin);
adminRouter.post("/login", adminController.adminLogin);
adminRouter.get("/users", adminVerifyToken, adminController.listUser);
adminRouter.post("/userBlock", adminVerifyToken, adminController.userBlock);
adminRouter.get("/managers", adminVerifyToken,adminController.listManager);
adminRouter.post("/managerBlock", adminVerifyToken, adminController.managerBlock);
adminRouter.get("/hotels",adminVerifyToken, adminController.listHotels);
adminRouter.post("/approve/:hotelId", adminVerifyToken, adminController.approveHotel);
adminRouter.post("/list/:hotelId", adminVerifyToken, adminController.listUnlistHotel);

adminRouter.get("/transactions", adminVerifyToken,transactionController.getAdminTransactions)
adminRouter.get("/stats",adminController.getDashboardStats)

export default adminRouter;
