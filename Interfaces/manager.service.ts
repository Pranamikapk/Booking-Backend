import { IManager } from "./common.interface";

export interface IManagerService {
  register(managerData: Partial<IManager>): Promise<IManager>;
  verifyOtp(email: string, otp: string): Promise<IManager>;
  resendOtp(email: string): Promise<void>;
  login(email: string, password: string): Promise<{ manager: Partial<IManager>; token: string; refreshToken: string }>;
  updateProfile(managerId: string, updateData: Partial<IManager>): Promise<IManager>;
}