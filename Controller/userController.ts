import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { createToken } from "../Config/jwt_config";
import HTTP_statusCode from "../Enums/httpStatusCodes";
import { IUserService } from "../Interfaces/user.service.interface";

export class UserController {
  constructor(private readonly userService: IUserService) {}

  userRegister = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(HTTP_statusCode.BadRequest)
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

      res.status(HTTP_statusCode.OK).json({
        message: "OTP sent successfully. Please verify to complete registration.",
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: createToken(user._id, user.role),
      });
    } catch (error: any) {
      console.error("Error in user registration:", error);
      res
        .status(HTTP_statusCode.InternalServerError)
        .json({ message: "Something went wrong" });
    }
  };


  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, otp } = req.body;
      const user = await this.userService.verifyOtp(email, otp);

      res.status(HTTP_statusCode.OK).json({
        success: true,
        message: "OTP verified successfully",
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        token: createToken(user._id, user.role),
      });
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      res
        .status(HTTP_statusCode.BadRequest)
        .json({ success: false, message: error.message });
    }
  };

  resendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      await this.userService.resendOtp(email);

      res.status(HTTP_statusCode.OK).json({
        message: "OTP resent successfully",
      });
    } catch (error: any) {
      console.error("Error resending OTP:", error);
      res
        .status(HTTP_statusCode.InternalServerError)
        .json({ message: "Something went wrong" });
    }
  };


  login = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Login request received with payload:', req.body);
      const { email, password } = req.body;
      if (!email || !password) {
        console.error('Missing email or password in request');
        res.status(HTTP_statusCode.BadRequest).json({ message: 'Email and password are required.' });
        return;
      }
  
      const { user, token, refreshToken } = await this.userService.login(email, password);
  
      console.log('Login successful for user:', user);
      res.cookie('user_access_token', token, { 
        httpOnly: true ,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60,
      });
      res.cookie('user_refresh_token', refreshToken, { 
        httpOnly: true ,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json(user);
    } catch (error: any) {
      console.error('Error during login:', error.message);
      res.status(HTTP_statusCode.Unauthorized).json({ message: 'Invalid credentials' });
    }
  };
  


  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, phone } = req.body;
      const userId = req.user_id;

      if (!userId) {
        res.status(HTTP_statusCode.BadRequest).json({ message: "User ID is missing." });
        return; 
      }
  
      const updatedUser = await this.userService.updateUser(userId, {
        name,
        email,
        phone,
      });

      res.status(HTTP_statusCode.OK).json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        token: createToken(updatedUser._id, updatedUser.role),
      });
    } catch (error: any) {
      console.error("Error updating user:", error);
      res
        .status(HTTP_statusCode.InternalServerError)
        .json({ message: "Something went wrong" });
    }
  };


  googleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email } = req.body;
      console.log('Google OAuth response:', req.body);     
      if (!name || !email) {
       res.status(HTTP_statusCode.BadRequest).json({ message: 'Name and email are required' });
       return
      }  
      const user = await this.userService.googleLogin(name, email);

      res.status(HTTP_statusCode.OK).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          token: user.token,
        },
      });
    } catch (error: any) {
      console.error("Google login error:", error);
      res
        .status(HTTP_statusCode.InternalServerError)
        .json({ message: "Server error" });
    }
  };


  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      await this.userService.forgotPassword(email);

      res.status(HTTP_statusCode.OK).json({
        message: "Password reset link sent to your email.",
      });
    } catch (error: any) {
      console.error("Error sending reset email:", error);
      res
        .status(HTTP_statusCode.InternalServerError)
        .json({ message: "Server error", error: error.message });
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, newPassword } = req.body;
      await this.userService.resetPassword(token, newPassword);

      res.status(HTTP_statusCode.OK).json({
        message: "Password has been reset successfully.",
        
      });
    } catch (error: any) {
      console.error("Error resetting password:", error);
      res
        .status(HTTP_statusCode.InternalServerError)
        .json({ message: "Server error", error: error.message });
    }
  };

  
}
