import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { createRefreshToken, createToken } from '../Config/jwt_config';
import { IAdminRepository } from '../Interfaces/admin.repository.interface';
import { IAdminService } from '../Interfaces/admin.service.interface';
import { IHotel, IManager, IUser } from '../Interfaces/common.interface';

export class AdminService implements IAdminService {
  constructor(private adminRepository: IAdminRepository) {}

  async registerAdmin(adminData: { name: string; email: string; password: string }): Promise<void> {
    const adminExists = await this.adminRepository.findAdminByEmail(adminData.email);
    if (adminExists) {
      throw new Error('Admin already exists');
    }

    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    await this.adminRepository.createAdmin({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      role: 'admin',
    });
  }

  async loginAdmin(email: string, password: string): Promise<{ user: Partial<IUser>; token: string ;refreshToken: string}> {
    const user = await this.adminRepository.findAdminByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password!))) {
        throw new Error('Invalid email or password.');
      }
      const token = createToken(user._id, 'admin');
      const refreshToken = createRefreshToken(user._id, 'admin');
      return { user, token, refreshToken };  
    }

  async listUsers(): Promise<IUser[]> {
    return this.adminRepository.findAllClients();
  }

  async listManagers(): Promise<IManager[]> {
    return this.adminRepository.findAllManagers();
  }

  async toggleUserBlock(userId: Types.ObjectId): Promise<IUser[]> {
    const user = await this.adminRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.isBlocked = !user.isBlocked;
    await this.adminRepository.updateUser(user);
    return this.adminRepository.findAllClients();
  }

  async listHotels(): Promise<IHotel[]> {
    return this.adminRepository.findAllHotels();
  }

  async approveHotel(hotelId: Types.ObjectId, status: boolean): Promise<IHotel> {
    const hotel = await this.adminRepository.findHotelById(hotelId);
    if (!hotel) {
      throw new Error('Hotel not found');
    }
    hotel.isVerified = status;
    return this.adminRepository.updateHotel(hotel);
  }

  async listUnlistHotel(hotelId: Types.ObjectId, status: boolean): Promise<IHotel> {
    const hotel = await this.adminRepository.findHotelById(hotelId);
    if (!hotel) {
      throw new Error('Hotel not found');
    }
    hotel.isListed = status;
    return this.adminRepository.updateHotel(hotel);
  }
}