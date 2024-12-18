import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Types } from 'mongoose';
import { createToken } from '../Config/jwt_config';
import HTTP_statusCode from '../Enums/httpStatusCodes';
import { IManager } from '../Interfaces/common.interface';
import { IManagerDashboardService } from '../Interfaces/manager.dashboard.interface';
import { IManagerService } from '../Interfaces/manager.service';

export class ManagerController {
  constructor(private managerService: IManagerService,
    private managerDashboardService: IManagerDashboardService
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_statusCode.BadRequest).json({ errors: errors.array() });
        return;
      }

      const managerData: Partial<IManager> = req.body;
      const newManager = await this.managerService.register(managerData);

      res.status(HTTP_statusCode.CREATED).json({
        message: "OTP sent successfully. Please verify to complete registration.",
        name: newManager.name,
        email: newManager.email,
        phone: newManager.phone,
        licence: newManager.licence,
        token: createToken(newManager._id, "manager"),
      });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong. Please try again later." });
    }
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, otp } = req.body;
      const manager = await this.managerService.verifyOtp(email, otp);

      res.status(HTTP_statusCode.OK).json({
        success: true,
        message: "OTP verified successfully",
        id: manager._id,
        name: manager.name,
        email: manager.email,
        token: createToken(manager._id, 'manager'),
      });
    } catch (error:any) {
      console.error("Error verifying OTP:", error);
      res.status(HTTP_statusCode.BadRequest).json({ success: false, message: error.message });
    }
  };

  resendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      await this.managerService.resendOtp(email);
      res.status(HTTP_statusCode.OK).json({ message: "OTP resent successfully" });
    } catch (error) {
      console.error("Error resending OTP:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong" });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const {email,password} = req.body;
      if (!email || !password) {
        console.error('Missing email or password in request');
        res.status(HTTP_statusCode.BadRequest).json({ message: 'Email and password are required.' });
        return;
      }
      const  { manager, token, refreshToken }  = await this.managerService.login(email,password);
      console.log("Manager:", manager, "Token:", token, "RefreshToken:", refreshToken);
      
      res.cookie('manager_refresh_token', refreshToken, { 
        httpOnly: true ,
        sameSite: 'none',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie('manager_access_token', token, { 
        httpOnly: true ,
        sameSite: 'none',
        secure: true,
        maxAge: 15 * 60 ,
      });
      res.json({...manager,token});
    } catch (error:any) {
      console.error(error);
      res.status(HTTP_statusCode.BadRequest).json({ message: error.message });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const {name,email,phone} = req.body;
      const managerId = req.user_id;

      if (!managerId) {
        res.status(HTTP_statusCode.BadRequest).json({ message: "Manager ID is missing." });
        return; 
      }

      const updatedManager = await this.managerService.updateProfile(managerId, {
        name,
        email,
        phone
      });

      res.status(HTTP_statusCode.OK).json({
        _id: updatedManager._id,
        name: updatedManager.name,
        email: updatedManager.email,
        phone: updatedManager.phone,
        licence: updatedManager.licence,
        token: createToken(updatedManager._id, "manager"),
      });
    } catch (error) {
      console.error(error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong" });
    }
  };

  getManagerDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user_id; 
      if (!userId) {
        res.status(HTTP_statusCode.Unauthorized).json({ message: 'Unauthorized: User ID not found' });
        return;
      }
      const managerId = new Types.ObjectId(userId);
      const stats = await this.managerDashboardService.getManagerDashboardStats(managerId);
      res.status(HTTP_statusCode.OK).json(stats);
    } catch (error) {
      console.error('Error fetching manager dashboard stats:', error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: 'Error fetching dashboard stats' });
    }
  };
}