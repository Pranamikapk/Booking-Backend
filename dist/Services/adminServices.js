"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_config_1 = require("../Config/jwt_config");
class AdminService {
    constructor(adminRepository) {
        this.adminRepository = adminRepository;
    }
    async registerAdmin(adminData) {
        const adminExists = await this.adminRepository.findAdminByEmail(adminData.email);
        if (adminExists) {
            throw new Error('Admin already exists');
        }
        const hashedPassword = await bcryptjs_1.default.hash(adminData.password, 10);
        await this.adminRepository.createAdmin({
            name: adminData.name,
            email: adminData.email,
            password: hashedPassword,
            role: 'admin',
        });
    }
    async loginAdmin(email, password) {
        const user = await this.adminRepository.findAdminByEmail(email);
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            throw new Error('Invalid email or password.');
        }
        const token = (0, jwt_config_1.createToken)(user._id, 'admin');
        const refreshToken = (0, jwt_config_1.createRefreshToken)(user._id, 'admin');
        return { user, token, refreshToken };
    }
    async listUsers() {
        return this.adminRepository.findAllClients();
    }
    async listManagers() {
        return this.adminRepository.findAllManagers();
    }
    async toggleUserBlock(userId) {
        const user = await this.adminRepository.findUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        user.isBlocked = !user.isBlocked;
        await this.adminRepository.updateUser(user);
        return this.adminRepository.findAllClients();
    }
    async listHotels() {
        return this.adminRepository.findAllHotels();
    }
    async approveHotel(hotelId, status) {
        const hotel = await this.adminRepository.findHotelById(hotelId);
        if (!hotel) {
            throw new Error('Hotel not found');
        }
        hotel.isVerified = status;
        return this.adminRepository.updateHotel(hotel);
    }
    async listUnlistHotel(hotelId, status) {
        const hotel = await this.adminRepository.findHotelById(hotelId);
        if (!hotel) {
            throw new Error('Hotel not found');
        }
        hotel.isListed = status;
        return this.adminRepository.updateHotel(hotel);
    }
}
exports.AdminService = AdminService;
