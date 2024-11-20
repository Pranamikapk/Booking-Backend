import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import sendOTPmail from '../Config/email_config';
import { createRefreshToken, createToken } from '../Config/jwt_config';
import { IUser } from '../Interfaces/common.interface';
import { IUserRepository } from '../Interfaces/user.repository.interface';
import { IUserService } from '../Interfaces/user.service.interface';
dotenv.config();

export class UserService implements IUserService {
  constructor(
    private userRepository: IUserRepository,
  ) {}

  private generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  async register(userData: Partial<IUser>): Promise<IUser> {
    const { email, phone, password } = userData;

    if (!email || !password || !phone) {
      throw new Error('Email and password are required.');
    }

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser?.isVerified) {
      throw new Error('User already exists and is verified.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = this.generateOTP();
    console.log("otp: ",otp);
    
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 

    let user: IUser;

  if (existingUser && !existingUser.isVerified) {
    user = await this.userRepository.update(existingUser._id.toString(), {
      ...userData,
      password: hashedPassword,
      otp,
      otpExpires
    }) as IUser;
  } else {
    user = await this.userRepository.create({
      ...userData,
      password: hashedPassword,
      otp,
      otpExpires,
      role: 'client',
      isVerified: false,
    }) as IUser;
  }
    await sendOTPmail(user.email, `<p>Your OTP is: ${otp}</p>`);
    return user;
  }

  async verifyOtp(email: string, otp: string): Promise<IUser> {
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

    return updatedUser as IUser;
  }

  async resendOtp(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found.');
    }

    const otp = this.generateOTP();
    console.log('OTP:',otp);
    
    await this.userRepository.update(user._id.toString(), {
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOTPmail(user.email, `<p>Your OTP is: ${otp}</p>`);
  }

  async login(email: string, password: string): Promise<{ user: Partial<IUser>; token: string; refreshToken: string }> {
    const user = await this.userRepository.findByEmail(email);
    console.log('Inside');
    
    if (!user || !(await bcrypt.compare(password, user.password!))) {
      throw new Error('Invalid email or password.');
    }

    if (user.isBlocked) {
      throw new Error('User is blocked.');
    }

    const { password: _, ...userWithoutPassword } = user;

     const token = createToken(user._id, user.role);
    const refreshToken = createRefreshToken(user._id, user.role);
  
    return { user: userWithoutPassword, token, refreshToken };
  }

  async updateUser(userId: string, userData: Partial<IUser>): Promise<IUser> {
    const updatedUser = await this.userRepository.update(userId, userData);
    if (!updatedUser) {
      throw new Error('User update failed.');
    }
    return updatedUser;
  }

  async googleLogin(name: string, email: string): Promise<IUser> {
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

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 3600000);

    await this.userRepository.reset(email, resetToken, tokenExpires);

    const resetUrl = `${process.env.CLIENT_BASE_URL}/resetPassword?token=${resetToken}`;
    await sendOTPmail(
      user.email,
      `<p>To reset your password, click the link below:</p><a href="${resetUrl}">${resetUrl}</a>`
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findByResetToken(token);
    if (!user) {
      throw new Error('Invalid or expired token.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user._id.toString(), {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
  }

}
