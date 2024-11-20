import express from "express";
import { adminVerifyToken } from "../Config/jwt_config";
import { AdminController } from "../Controller/adminController";
import { IAdminService } from "../Interfaces/admin.service.interface";
import { IHotelService } from "../Interfaces/hotel.service.interface";
import { IManagerService } from "../Interfaces/manager.service";
import Hotel from "../Model/hotelModel";
import ManagerModel from "../Model/managerModel";
import User from "../Model/userModel";
import { AdminRepository } from "../Repository/adminRepository";
import { HotelRepository } from "../Repository/hotelRepository";
import { ManagerRepository } from "../Repository/managerRepository";
import { AdminService } from "../Services/adminServices";
import { HotelService } from "../Services/hotelService";
import { ManagerService } from "../Services/managerService";

const adminRouter = express.Router();

const adminRepository = new AdminRepository(User,ManagerModel,Hotel)
const hotelRepository = new HotelRepository(Hotel)
const managerRepository = new ManagerRepository(ManagerModel)

const adminService : IAdminService = new AdminService(adminRepository)
const hotelService : IHotelService = new HotelService(hotelRepository)
const managerService : IManagerService = new ManagerService(managerRepository)

const adminController = new AdminController(adminService)

adminRouter.post("/register", adminController.registerAdmin);
adminRouter.post("/login", adminController.adminLogin);
adminRouter.get("/users", adminVerifyToken, adminController.listUser);
adminRouter.post("/userBlock", adminVerifyToken, adminController.userBlock);
adminRouter.get("/managers", adminVerifyToken,adminController.listManager);
adminRouter.get("/hotels",adminVerifyToken, adminController.listHotels);
adminRouter.post("/approve/:hotelId", adminVerifyToken, adminController.approveHotel);
adminRouter.post("/list/:hotelId", adminVerifyToken, adminController.listUnlistHotel);

// adminRouter.get("/transactions",  getAdminTransactions)

export default adminRouter;
