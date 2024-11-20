"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const mongoose_1 = require("mongoose");
class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
        this.registerAdmin = async (req, res) => {
            try {
                const { name, email, password } = req.body;
                await this.adminService.registerAdmin({ name, email, password });
                res.status(201).json({ message: 'Admin created' });
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        };
        this.adminLogin = async (req, res) => {
            try {
                const { email, password } = req.body;
                const { user, token, refreshToken } = await this.adminService.loginAdmin(email, password);
                res.cookie("admin_refresh_token", refreshToken, {
                    httpOnly: true,
                    sameSite: 'none',
                    secure: true,
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
                res.cookie("admin_access_token", token, {
                    httpOnly: true,
                    sameSite: 'none',
                    secure: true,
                    maxAge: 15 * 60 * 1000,
                });
                res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token,
                });
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        };
        this.listUser = async (req, res) => {
            try {
                const users = await this.adminService.listUsers();
                res.status(200).json(users);
            }
            catch (error) {
                res.status(500).json({ message: 'Internal Server Error' });
            }
        };
        this.listManager = async (req, res) => {
            try {
                const managers = await this.adminService.listManagers();
                res.status(200).json(managers);
            }
            catch (error) {
                res.status(500).json({ message: 'Internal Server Error' });
            }
        };
        this.userBlock = async (req, res) => {
            try {
                const { userId } = req.body;
                const users = await this.adminService.toggleUserBlock(new mongoose_1.Types.ObjectId(userId));
                res.status(200).json(users);
            }
            catch (error) {
                res.status(500).json({ message: 'Internal Server Error' });
            }
        };
        this.listHotels = async (req, res) => {
            try {
                const hotels = await this.adminService.listHotels();
                res.status(200).json(hotels);
            }
            catch (error) {
                res.status(500).json({ message: 'Internal Server Error' });
            }
        };
        this.approveHotel = async (req, res) => {
            try {
                const { hotelId } = req.params;
                const { status } = req.body;
                const hotel = await this.adminService.approveHotel(new mongoose_1.Types.ObjectId(hotelId), status);
                res.status(200).json(hotel);
            }
            catch (error) {
                res.status(500).json({ message: 'Internal Server Error' });
            }
        };
        this.listUnlistHotel = async (req, res) => {
            try {
                const { hotelId } = req.params;
                const { status } = req.body;
                const hotel = await this.adminService.listUnlistHotel(new mongoose_1.Types.ObjectId(hotelId), status);
                res.status(200).json(hotel);
            }
            catch (error) {
                res.status(500).json({ message: 'Internal Server Error' });
            }
        };
    }
}
exports.AdminController = AdminController;
