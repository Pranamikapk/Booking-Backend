import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import HTTP_statusCode from '../Enums/httpStatusCodes';

dotenv.config();

const secret_key = process.env.JWT_SECRET_KEY as string;
const refresh_key = process.env.JWT_REFRESH_KEY as string;
if (!secret_key || !refresh_key) {
  console.error("JWT keys are not defined");
  throw new Error("JWT keys are required");
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
    return jwt.sign({ user_id, role }, secret_key, { expiresIn: '30d' });
  } catch (error) {
    console.error("Error Creating Token:", error);
    throw error;
  }
};

const createRefreshToken = (user_id: Types.ObjectId, role: string): string => {
  console.log('Created RefreshToken:',user_id,role);
  
  try {
    return jwt.sign({ user_id, role }, refresh_key, { expiresIn: refreshTokenExpiry });
  } catch (error) {
    console.error("Error Creating Refresh Token:", error);
    throw error;
  }
};

const getTokenFromRequest = (req: Request, tokenName: string): string | null => {  
  if (req.cookies && req.cookies[tokenName]) {
    return req.cookies[tokenName];
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
      const accessToken = getTokenFromRequest(req, accessTokenName);      
      if (accessToken) {
        try {
          const decoded = jwt.verify(accessToken, secret_key) as jwt.JwtPayload;
          const { user_id, role } = decoded;

          if (role !== expectedRole) {
            console.log('Invalid role. Access denied.', 'Role:', role, 'Expected:', expectedRole);
            res.status(HTTP_statusCode.Unauthorized).json({ message: 'Access denied. Invalid role.' });
            return;
          }

          req.user_id = user_id;
          return next();
        } catch (error) {
          if (error instanceof jwt.TokenExpiredError) {
            console.log('Access token expired. Attempting to refresh...');
            return await handleRefreshToken(req, res, next, accessTokenName, refreshTokenName, expectedRole);
          }
          throw error;
        }
      }

      await handleRefreshToken(req, res, next, accessTokenName, refreshTokenName, expectedRole);
    } catch (error) {
      console.log('Error in jwtverifyToken:', error);
      res.status(HTTP_statusCode.Unauthorized).json({ message: 'Authentication failed.' });
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
  try {
    console.log('Refresh token function reached');
    const refreshToken = getTokenFromRequest(req, refreshTokenName);
    if (!refreshToken) {
      throw new Error('No refresh token provided');
    }
    console.log('Refresh Token:', refreshToken,'Secret:',refresh_key);
    console.log('Decoded Token:', jwt.decode(refreshToken));
    const decoded = jwt.verify(refreshToken, refresh_key) as jwt.JwtPayload;
    console.log('Decoded refresh token:', decoded);
    
    if (decoded.role !== expectedRole) {
      throw new Error('Invalid refresh token role');
    }

    const newAccessToken = createToken(decoded.user_id, decoded.role);
    res.cookie(accessTokenName, newAccessToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: parseInt(accessTokenExpiry) * 1000,
    });

    req.user_id = decoded.user_id;
    next();
  } catch (err: any) {
    console.error('Error in handleRefreshToken:', err);

    if (err.name === 'JsonWebTokenError') {
      res.status(HTTP_statusCode.Unauthorized).json({ error: 'Invalid refresh token.' });
      return;
    }

    if (err.name === 'TokenExpiredError') {
      res.status(HTTP_statusCode.Unauthorized).json({ error: 'Refresh token expired. Please log in again.' });
      return;
    }

    res.status(HTTP_statusCode.InternalServerError).json({ error: 'Internal server error.' });
  }
};

export const verifyToken = jwtverifyToken(userAccessTokenName, userRefreshTokenName, userRole);
export const managerVerifyToken = jwtverifyToken(managerAccessTokenName, managerRefreshTokenName, managerRole);
export const adminVerifyToken = jwtverifyToken(adminAccessTokenName, adminRefreshTokenName, adminRole);
export { createRefreshToken, createToken };

