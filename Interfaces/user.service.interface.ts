import { IUser } from "./common.interface";

export interface IUserService {
    register(userData: Partial<IUser>): Promise<IUser>;
    verifyOtp(email: string, otp: string): Promise<IUser>;
    resendOtp(email: string): Promise<void>;
    login(email: string, password: string): Promise<{ user: Partial<IUser>; token: string; refreshToken: string }>;
    generateNewAccessToken(userId: string): Promise<string> 
    updateUser(userId: string, userData: Partial<IUser>): Promise<IUser>;
    googleLogin(name: string, email: string): Promise<IUser>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    
}
