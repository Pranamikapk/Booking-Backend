"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerController = void 0;
const express_validator_1 = require("express-validator");
const jwt_config_1 = require("../Config/jwt_config");
const httpStatusCodes_1 = __importDefault(require("../Enums/httpStatusCodes"));
class ManagerController {
    constructor(managerService) {
        this.managerService = managerService;
        this.register = async (req, res) => {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(httpStatusCodes_1.default.BadRequest).json({ errors: errors.array() });
                    return;
                }
                const managerData = req.body;
                const newManager = await this.managerService.register(managerData);
                res.status(httpStatusCodes_1.default.CREATED).json({
                    message: "OTP sent successfully. Please verify to complete registration.",
                    name: newManager.name,
                    email: newManager.email,
                    phone: newManager.phone,
                    licence: newManager.licence,
                    token: (0, jwt_config_1.createToken)(newManager._id, "manager"),
                });
            }
            catch (error) {
                console.error("Error during registration:", error);
                res.status(httpStatusCodes_1.default.InternalServerError).json({ message: "Something went wrong. Please try again later." });
            }
        };
        this.verifyOtp = async (req, res) => {
            try {
                const { email, otp } = req.body;
                const manager = await this.managerService.verifyOtp(email, otp);
                res.status(httpStatusCodes_1.default.OK).json({
                    success: true,
                    message: "OTP verified successfully",
                    id: manager._id,
                    name: manager.name,
                    email: manager.email,
                    token: (0, jwt_config_1.createToken)(manager._id, 'manager'),
                });
            }
            catch (error) {
                console.error("Error verifying OTP:", error);
                res.status(httpStatusCodes_1.default.BadRequest).json({ success: false, message: error.message });
            }
        };
        this.resendOtp = async (req, res) => {
            try {
                const { email } = req.body;
                await this.managerService.resendOtp(email);
                res.status(httpStatusCodes_1.default.OK).json({ message: "OTP resent successfully" });
            }
            catch (error) {
                console.error("Error resending OTP:", error);
                res.status(httpStatusCodes_1.default.InternalServerError).json({ message: "Something went wrong" });
            }
        };
        this.login = async (req, res) => {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    console.error('Missing email or password in request');
                    res.status(httpStatusCodes_1.default.BadRequest).json({ message: 'Email and password are required.' });
                    return;
                }
                const { manager, token, refreshToken } = await this.managerService.login(email, password);
                console.log("Manager:", manager, "Token:", token, "RefreshToken:", refreshToken);
                res.cookie('manager_refresh_token', refreshToken, {
                    httpOnly: true,
                    sameSite: 'none',
                    secure: true,
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
                res.cookie('manager_access_token', token, {
                    httpOnly: true,
                    sameSite: 'none',
                    secure: true,
                    maxAge: 15 * 60,
                });
                res.json({ ...manager, token });
            }
            catch (error) {
                console.error(error);
                res.status(httpStatusCodes_1.default.BadRequest).json({ message: error.message });
            }
        };
        this.updateProfile = async (req, res) => {
            try {
                const { name, email, phone } = req.body;
                const managerId = req.user_id;
                if (!managerId) {
                    res.status(httpStatusCodes_1.default.BadRequest).json({ message: "Manager ID is missing." });
                    return;
                }
                const updatedManager = await this.managerService.updateProfile(managerId, {
                    name,
                    email,
                    phone
                });
                res.status(httpStatusCodes_1.default.OK).json({
                    _id: updatedManager._id,
                    name: updatedManager.name,
                    email: updatedManager.email,
                    phone: updatedManager.phone,
                    licence: updatedManager.licence,
                    token: (0, jwt_config_1.createToken)(updatedManager._id, "manager"),
                });
            }
            catch (error) {
                console.error(error);
                res.status(httpStatusCodes_1.default.InternalServerError).json({ message: "Something went wrong" });
            }
        };
    }
}
exports.ManagerController = ManagerController;
