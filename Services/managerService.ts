import bcrypt from 'bcryptjs';
import sendOTPmail from '../Config/email_config';
import { createRefreshToken, createToken } from '../Config/jwt_config';
import { IManager } from '../Interfaces/common.interface';
import { IManagerRepository } from '../Interfaces/manager.repository';
import { IManagerService } from '../Interfaces/manager.service';


export class ManagerService implements IManagerService {
  constructor(private managerRepository: IManagerRepository) {}

  private generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  async register(managerData: Partial<IManager>): Promise<IManager> {
    const { hotel ,name ,email ,phone ,licence ,password} = managerData

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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = this.generateOTP();

    let manager : IManager = await this.managerRepository.create({
      ...managerData,
      password: hashedPassword,
      otp,
      otpExpires :  new Date(Date.now() + 10 * 60 * 1000),
      isApproved: false,
      isVerified: false,
      isBlocked: false
    })as IManager
  
    await sendOTPmail(manager.email, `<p>Your OTP is: ${otp}</p>`);

    return manager;
  }

  async verifyOtp(email: string, otp: string): Promise<IManager> {
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
  
      return updatedManager as IManager;
  }

  async resendOtp(email: string): Promise<void> {
    const manager = await this.managerRepository.findByEmail(email);
    if (!manager) {
      throw new Error('Manager not found');
    }

    const otp = this.generateOTP();
    manager.otp = otp;
    manager.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await this.managerRepository.update(manager._id.toString(), manager);

    await sendOTPmail(manager.email, otp);
  }

  async login(email: string, password: string): Promise<{ manager: Partial<IManager>; token: string; refreshToken: string }> {
    const manager = await this.managerRepository.findByEmail(email);
    if (!manager) {
      throw new Error('Invalid manager data');
    }

    if (!manager || !(await bcrypt.compare(password, manager.password!))) {
        throw new Error('Invalid email or password.');
      }
  
      if (manager.isBlocked) {
        throw new Error('Manager is blocked.');
      }
  
      const { password: _, ...userWithoutPassword } = manager;
  
       const token = createToken(manager._id, 'manager');
      const refreshToken = createRefreshToken(manager._id, 'manager');
      return { manager: userWithoutPassword, token, refreshToken };
    }

  async updateProfile(managerId: string, updateData: Partial<IManager>): Promise<IManager> {
    const updatedManager = await this.managerRepository.update(managerId, updateData);
    if (!updatedManager) {
      throw new Error('Manager update failed.');
    }
    return updatedManager;
  }
}