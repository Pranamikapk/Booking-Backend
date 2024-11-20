"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
const email_config_1 = __importDefault(require("../Config/email_config"));
const jwt_config_1 = require("../Config/jwt_config");
dotenv_1.default.config();
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    generateOTP() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    async register(userData) {
        const { email, phone, password } = userData;
        if (!email || !password || !phone) {
            throw new Error('Email and password are required.');
        }
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser?.isVerified) {
            throw new Error('User already exists and is verified.');
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const otp = this.generateOTP();
        console.log("otp: ", otp);
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        let user;
        if (existingUser && !existingUser.isVerified) {
            user = await this.userRepository.update(existingUser._id.toString(), {
                ...userData,
                password: hashedPassword,
                otp,
                otpExpires
            });
        }
        else {
            user = await this.userRepository.create({
                ...userData,
                password: hashedPassword,
                otp,
                otpExpires,
                role: 'client',
                isVerified: false,
            });
        }
        await (0, email_config_1.default)(user.email, `<p>Your OTP is: ${otp}</p>`);
        return user;
    }
    async verifyOtp(email, otp) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('User not found.');
        }
        console.log("Entered OTP: ", otp);
        console.log("Stored OTP: ", user.otp);
        console.log("OTP expires at: ", user.otpExpires);
        if (user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
            throw new Error('Invalid or expired OTP.');
        }
        const updatedUser = await this.userRepository.update(user._id.toString(), {
            isVerified: true,
            otp: undefined,
            otpExpires: undefined,
        });
        return updatedUser;
    }
    async resendOtp(email) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('User not found.');
        }
        const otp = this.generateOTP();
        console.log('OTP:', otp);
        await this.userRepository.update(user._id.toString(), {
            otp,
            otpExpires: new Date(Date.now() + 10 * 60 * 1000),
        });
        await (0, email_config_1.default)(user.email, `<p>Your OTP is: ${otp}</p>`);
    }
    async login(email, password) {
        const user = await this.userRepository.findByEmail(email);
        console.log('Inside');
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            throw new Error('Invalid email or password.');
        }
        if (user.isBlocked) {
            throw new Error('User is blocked.');
        }
        const { password: _, ...userWithoutPassword } = user;
        const token = (0, jwt_config_1.createToken)(user._id, user.role);
        const refreshToken = (0, jwt_config_1.createRefreshToken)(user._id, user.role);
        return { user: userWithoutPassword, token, refreshToken };
    }
    async updateUser(userId, userData) {
        const updatedUser = await this.userRepository.update(userId, userData);
        if (!updatedUser) {
            throw new Error('User update failed.');
        }
        return updatedUser;
    }
    async googleLogin(name, email) {
        let user = await this.userRepository.findByEmail(email);
        if (!user) {
            user = await this.userRepository.create({
                name,
                email,
                role: 'client',
                isVerified: true,
                password: undefined,
            });
        }
        return user;
    }
    async forgotPassword(email) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('User not found.');
        }
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 3600000);
        await this.userRepository.reset(email, resetToken, tokenExpires);
        const resetUrl = `${process.env.CLIENT_BASE_URL}/resetPassword?token=${resetToken}`;
        await (0, email_config_1.default)(user.email, `<p>To reset your password, click the link below:</p><a href="${resetUrl}">${resetUrl}</a>`);
    }
    async resetPassword(token, newPassword) {
        const user = await this.userRepository.findByResetToken(token);
        if (!user) {
            throw new Error('Invalid or expired token.');
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await this.userRepository.update(user._id.toString(), {
            password: hashedPassword,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined,
        });
    }
}
exports.UserService = UserService;
