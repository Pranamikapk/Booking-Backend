"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const email_config_1 = __importDefault(require("../Config/email_config"));
const jwt_config_1 = require("../Config/jwt_config");
class ManagerService {
    constructor(managerRepository) {
        this.managerRepository = managerRepository;
    }
    generateOTP() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    async register(managerData) {
        const { hotel, name, email, phone, licence, password } = managerData;
        if (!hotel || !email || !password || !phone || !licence) {
            throw new Error('All fields are required.');
        }
        const existingHotel = await this.managerRepository.findByHotel(hotel);
        if (existingHotel) {
            throw new Error('Hotel already exists with this name');
        }
        const existingManager = await this.managerRepository.findByEmail(email);
        if (existingManager) {
            throw new Error('Manager already exists with this email address');
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const otp = this.generateOTP();
        let manager = await this.managerRepository.create({
            ...managerData,
            password: hashedPassword,
            otp,
            otpExpires: new Date(Date.now() + 10 * 60 * 1000),
            isApproved: false,
            isVerified: false,
            isBlocked: false
        });
        await (0, email_config_1.default)(manager.email, `<p>Your OTP is: ${otp}</p>`);
        return manager;
    }
    async verifyOtp(email, otp) {
        const manager = await this.managerRepository.findByEmail(email);
        if (!manager) {
            throw new Error('Manager not found');
        }
        if (manager.otp !== otp || !manager.otpExpires || manager.otpExpires < new Date()) {
            throw new Error('Invalid or expired OTP');
        }
        const updatedManager = await this.managerRepository.update(manager._id.toString(), {
            isVerified: true,
            otp: undefined,
            otpExpires: undefined,
        });
        return updatedManager;
    }
    async resendOtp(email) {
        const manager = await this.managerRepository.findByEmail(email);
        if (!manager) {
            throw new Error('Manager not found');
        }
        const otp = this.generateOTP();
        manager.otp = otp;
        manager.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await this.managerRepository.update(manager._id.toString(), manager);
        await (0, email_config_1.default)(manager.email, otp);
    }
    async login(email, password) {
        const manager = await this.managerRepository.findByEmail(email);
        if (!manager) {
            throw new Error('Invalid manager data');
        }
        if (!manager || !(await bcryptjs_1.default.compare(password, manager.password))) {
            throw new Error('Invalid email or password.');
        }
        if (manager.isBlocked) {
            throw new Error('Manager is blocked.');
        }
        const { password: _, ...userWithoutPassword } = manager;
        const token = (0, jwt_config_1.createToken)(manager._id, 'manager');
        const refreshToken = (0, jwt_config_1.createRefreshToken)(manager._id, 'manager');
        return { manager: userWithoutPassword, token, refreshToken };
    }
    async updateProfile(managerId, updateData) {
        const updatedManager = await this.managerRepository.update(managerId, updateData);
        if (!updatedManager) {
            throw new Error('Manager update failed.');
        }
        return updatedManager;
    }
}
exports.ManagerService = ManagerService;
