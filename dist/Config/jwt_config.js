"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = exports.createRefreshToken = exports.adminVerifyToken = exports.managerVerifyToken = exports.verifyToken = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const httpStatusCodes_1 = __importDefault(require("../Enums/httpStatusCodes"));
dotenv_1.default.config();
const secret_key = process.env.JWT_SECRET_KEY;
if (!secret_key) {
    console.error("JWT_SECRET_KEY is not defined");
    throw new Error("JWT_SECRET_KEY is required");
}
const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY_TIME;
const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY_TIME;
const userAccessTokenName = process.env.USER_ACCESS_TOKEN_NAME;
const userRefreshTokenName = process.env.USER_REFRESH_TOKEN_NAME;
const managerAccessTokenName = process.env.MANAGER_ACCESS_TOKEN_NAME;
const managerRefreshTokenName = process.env.MANAGER_REFRESH_TOKEN_NAME;
const adminAccessTokenName = process.env.ADMIN_ACCESS_TOKEN_NAME;
const adminRefreshTokenName = process.env.ADMIN_REFRESH_TOKEN_NAME;
const userRole = process.env.USER_ROLE;
const managerRole = process.env.MANAGER_ROLE;
const adminRole = process.env.ADMIN_ROLE;
const createToken = (user_id, role) => {
    try {
        return jsonwebtoken_1.default.sign({ user_id, role }, secret_key, { expiresIn: accessTokenExpiry });
    }
    catch (error) {
        console.error("Error Creating Token:", error);
        throw error;
    }
};
exports.createToken = createToken;
const createRefreshToken = (user_id, role) => {
    try {
        return jsonwebtoken_1.default.sign({ user_id, role }, secret_key, { expiresIn: refreshTokenExpiry });
    }
    catch (error) {
        console.error("Error Creating Refresh Token:", error);
        throw error;
    }
};
exports.createRefreshToken = createRefreshToken;
const getTokenFromRequest = (req) => {
    if (req.cookies[managerAccessTokenName]) {
        return req.cookies[managerAccessTokenName];
    }
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
};
const jwtverifyToken = (accessTokenName, refreshTokenName, expectedRole) => {
    return async (req, res, next) => {
        try {
            const accessToken = getTokenFromRequest(req);
            if (accessToken) {
                const decoded = jsonwebtoken_1.default.verify(accessToken, secret_key);
                const { user_id, role } = decoded;
                if (role !== expectedRole) {
                    console.log('Invalid role. Access denied.');
                    res.status(httpStatusCodes_1.default.Unauthorized).json({ message: 'Access denied. Invalid role.' });
                    return;
                }
                req.user_id = user_id;
                return next();
            }
            await handleRefreshToken(req, res, next, accessTokenName, refreshTokenName, expectedRole);
        }
        catch (error) {
            console.log('Error in jwtverifyToken:', error);
            await handleRefreshToken(req, res, next, accessTokenName, refreshTokenName, expectedRole);
        }
    };
};
const handleRefreshToken = async (req, res, next, accessTokenName, refreshTokenName, expectedRole) => {
    const refreshToken = req.cookies[refreshTokenName];
    if (refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, secret_key);
            const { user_id, role } = decoded;
            if (!user_id || role !== expectedRole) {
                console.log('Invalid refresh token payload. Access denied.');
                res.status(httpStatusCodes_1.default.Unauthorized).json({ message: 'Access denied. Token payload invalid.' });
                return;
            }
            const newAccessToken = createToken(user_id, role);
            res.cookie(accessTokenName, newAccessToken, {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                maxAge: 15 * 60 * 1000,
            });
            req.user_id = user_id;
            next();
        }
        catch (err) {
            console.log('Error in refresh token verification:', err);
            res.status(httpStatusCodes_1.default.Unauthorized).json({ message: 'Access denied. Refresh token not valid.' });
            return;
        }
    }
    else {
        console.log('No refresh token provided.');
        res.status(httpStatusCodes_1.default.Unauthorized).json({ message: 'Access denied. Refresh token not provided.' });
        return;
    }
};
exports.verifyToken = jwtverifyToken(userAccessTokenName, userRefreshTokenName, userRole);
exports.managerVerifyToken = jwtverifyToken(managerAccessTokenName, managerRefreshTokenName, managerRole);
exports.adminVerifyToken = jwtverifyToken(adminAccessTokenName, adminRefreshTokenName, adminRole);
