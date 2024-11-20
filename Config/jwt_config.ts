import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import HTTP_statusCode from '../Enums/httpStatusCodes';

dotenv.config();

const secret_key = process.env.JWT_SECRET_KEY as string;
if (!secret_key) {
  console.error("JWT_SECRET_KEY is not defined");
  throw new Error("JWT_SECRET_KEY is required");
}

const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY_TIME as string;
const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY_TIME as string;
const userAccessTokenName = process.env.USER_ACCESS_TOKEN_NAME as string;
const userRefreshTokenName = process.env.USER_REFRESH_TOKEN_NAME as string;
const managerAccessTokenName = process.env.MANAGER_ACCESS_TOKEN_NAME as string;
const managerRefreshTokenName = process.env.MANAGER_REFRESH_TOKEN_NAME as string;
const adminAccessTokenName = process.env.ADMIN_ACCESS_TOKEN_NAME as string;
const adminRefreshTokenName = process.env.ADMIN_REFRESH_TOKEN_NAME as string;
const userRole = process.env.USER_ROLE as string;
const managerRole = process.env.MANAGER_ROLE as string;
const adminRole = process.env.ADMIN_ROLE as string;

const createToken = (user_id: Types.ObjectId, role: string): string => {
  try {
    return jwt.sign({ user_id, role }, secret_key, { expiresIn: accessTokenExpiry });
  } catch (error) {
    console.error("Error Creating Token:", error);
    throw error;
  }
};

const createRefreshToken = (user_id: Types.ObjectId, role: string): string => {
  try {
    return jwt.sign({ user_id, role }, secret_key, { expiresIn: refreshTokenExpiry });
  } catch (error) {
    console.error("Error Creating Refresh Token:", error);
    throw error;
  }
};

const getTokenFromRequest = (req: Request): string | null => {
  if (req.cookies[managerAccessTokenName]) {
    return req.cookies[managerAccessTokenName];
  }

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
};

const jwtverifyToken = (
  accessTokenName: string,
  refreshTokenName: string,
  expectedRole: string
): ((req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
 

    try {
      const accessToken = getTokenFromRequest(req);
      if (accessToken) {
        const decoded = jwt.verify(accessToken, secret_key) as jwt.JwtPayload;
        const { user_id, role } = decoded;

        if (role !== expectedRole) {
          console.log('Invalid role. Access denied.');
          res.status(HTTP_statusCode.Unauthorized).json({ message: 'Access denied. Invalid role.' });
          return;
        }

        req.user_id = user_id;
        return next();
      }

      await handleRefreshToken(req, res, next, accessTokenName, refreshTokenName, expectedRole);
    } catch (error) {
      console.log('Error in jwtverifyToken:', error);
      await handleRefreshToken(req, res, next, accessTokenName, refreshTokenName, expectedRole);
    }
  };
};

const handleRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
  accessTokenName: string,
  refreshTokenName: string,
  expectedRole: string
): Promise<void> => {
  
  
  const refreshToken = req.cookies[refreshTokenName];
  
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, secret_key) as jwt.JwtPayload;
      const { user_id, role } = decoded;
      
      if (!user_id || role !== expectedRole) {
        console.log('Invalid refresh token payload. Access denied.');
        res.status(HTTP_statusCode.Unauthorized).json({ message: 'Access denied. Token payload invalid.' });
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
    } catch (err: any) {
      console.log('Error in refresh token verification:', err);
      res.status(HTTP_statusCode.Unauthorized).json({ message: 'Access denied. Refresh token not valid.' });
      return;
    }
  } else {
    console.log('No refresh token provided.');
    res.status(HTTP_statusCode.Unauthorized).json({ message: 'Access denied. Refresh token not provided.' });
    return;
  }
};

export const verifyToken = jwtverifyToken(userAccessTokenName, userRefreshTokenName, userRole);
export const managerVerifyToken = jwtverifyToken(managerAccessTokenName, managerRefreshTokenName, managerRole);
export const adminVerifyToken = jwtverifyToken(adminAccessTokenName, adminRefreshTokenName, adminRole);
export { createRefreshToken, createToken };
