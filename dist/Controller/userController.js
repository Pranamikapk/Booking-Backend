"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const express_validator_1 = require("express-validator");
const jwt_config_1 = require("../Config/jwt_config");
const httpStatusCodes_1 = __importDefault(require("../Enums/httpStatusCodes"));
class UserController {
    constructor(userService) {
        this.userService = userService;
        this.userRegister = async (req, res) => {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res
                        .status(httpStatusCodes_1.default.BadRequest)
                        .json({ errors: errors.array() });
                    return;
                }
                const { name, email, phone, password } = req.body;
                const user = await this.userService.register({
                    name,
                    email,
                    phone,
                    password,
                });
                res.status(httpStatusCodes_1.default.OK).json({
                    message: "OTP sent successfully. Please verify to complete registration.",
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    token: (0, jwt_config_1.createToken)(user._id, user.role),
                });
            }
            catch (error) {
                console.error("Error in user registration:", error);
                res
                    .status(httpStatusCodes_1.default.InternalServerError)
                    .json({ message: "Something went wrong" });
            }
        };
        this.verifyOtp = async (req, res) => {
            try {
                const { email, otp } = req.body;
                const user = await this.userService.verifyOtp(email, otp);
                res.status(httpStatusCodes_1.default.OK).json({
                    success: true,
                    message: "OTP verified successfully",
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    token: (0, jwt_config_1.createToken)(user._id, user.role),
                });
            }
            catch (error) {
                console.error("Error verifying OTP:", error);
                res
                    .status(httpStatusCodes_1.default.BadRequest)
                    .json({ success: false, message: error.message });
            }
        };
        this.resendOtp = async (req, res) => {
            try {
                const { email } = req.body;
                await this.userService.resendOtp(email);
                res.status(httpStatusCodes_1.default.OK).json({
                    message: "OTP resent successfully",
                });
            }
            catch (error) {
                console.error("Error resending OTP:", error);
                res
                    .status(httpStatusCodes_1.default.InternalServerError)
                    .json({ message: "Something went wrong" });
            }
        };
        this.login = async (req, res) => {
            try {
                console.log('Login request received with payload:', req.body);
                const { email, password } = req.body;
                if (!email || !password) {
                    console.error('Missing email or password in request');
                    res.status(httpStatusCodes_1.default.BadRequest).json({ message: 'Email and password are required.' });
                    return;
                }
                const { user, token, refreshToken } = await this.userService.login(email, password);
                console.log('Login successful for user:', user);
                res.cookie('user_access_token', token, {
                    httpOnly: true,
                    sameSite: 'strict',
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 15 * 60,
                });
                res.cookie('user_refresh_token', refreshToken, {
                    httpOnly: true,
                    sameSite: 'strict',
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
                res.json(user);
            }
            catch (error) {
                console.error('Error during login:', error.message);
                res.status(httpStatusCodes_1.default.Unauthorized).json({ message: 'Invalid credentials' });
            }
        };
        this.updateUser = async (req, res) => {
            try {
                const { name, email, phone } = req.body;
                const userId = req.user_id;
                if (!userId) {
                    res.status(httpStatusCodes_1.default.BadRequest).json({ message: "User ID is missing." });
                    return;
                }
                const updatedUser = await this.userService.updateUser(userId, {
                    name,
                    email,
                    phone,
                });
                res.status(httpStatusCodes_1.default.OK).json({
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    token: (0, jwt_config_1.createToken)(updatedUser._id, updatedUser.role),
                });
            }
            catch (error) {
                console.error("Error updating user:", error);
                res
                    .status(httpStatusCodes_1.default.InternalServerError)
                    .json({ message: "Something went wrong" });
            }
        };
        this.googleLogin = async (req, res) => {
            try {
                const { name, email } = req.body;
                console.log('Google OAuth response:', req.body);
                if (!name || !email) {
                    res.status(httpStatusCodes_1.default.BadRequest).json({ message: 'Name and email are required' });
                    return;
                }
                const user = await this.userService.googleLogin(name, email);
                res.status(httpStatusCodes_1.default.OK).json({
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        token: user.token,
                    },
                });
            }
            catch (error) {
                console.error("Google login error:", error);
                res
                    .status(httpStatusCodes_1.default.InternalServerError)
                    .json({ message: "Server error" });
            }
        };
        this.forgotPassword = async (req, res) => {
            try {
                const { email } = req.body;
                await this.userService.forgotPassword(email);
                res.status(httpStatusCodes_1.default.OK).json({
                    message: "Password reset link sent to your email.",
                });
            }
            catch (error) {
                console.error("Error sending reset email:", error);
                res
                    .status(httpStatusCodes_1.default.InternalServerError)
                    .json({ message: "Server error", error: error.message });
            }
        };
        this.resetPassword = async (req, res) => {
            try {
                const { token, newPassword } = req.body;
                await this.userService.resetPassword(token, newPassword);
                res.status(httpStatusCodes_1.default.OK).json({
                    message: "Password has been reset successfully.",
                });
            }
            catch (error) {
                console.error("Error resetting password:", error);
                res
                    .status(httpStatusCodes_1.default.InternalServerError)
                    .json({ message: "Server error", error: error.message });
            }
        };
    }
}
exports.UserController = UserController;
