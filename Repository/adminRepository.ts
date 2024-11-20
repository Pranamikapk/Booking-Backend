import { Model, Types } from 'mongoose';
import { IAdminRepository } from '../Interfaces/admin.repository.interface';
import { IHotel, IManager, IUser } from '../Interfaces/common.interface';

export class AdminRepository implements IAdminRepository {
  constructor(
    private userModel: Model<IUser >,
    private managerModel: Model<IManager>,
    private hotelModel: Model<IHotel>
  ) {}

  async findAdminByEmail(email: string): Promise<IUser | null> {
    return this.userModel.findOne({ email });
  }

  async createAdmin(adminData: Partial<IUser>): Promise<IUser> {
    const admin = new this.userModel(adminData);
    return admin.save();
  }

  async findUserById(id: Types.ObjectId): Promise<IUser | null> {
    return this.userModel.findById(id);
  }

  async findAllClients(): Promise<IUser[]> {
    return this.userModel.find({ role: 'client' });
  }

  async findAllManagers(): Promise<IManager[]> {
    return this.managerModel.find();
  }

  async updateUser(user: IUser): Promise<IUser> {
    const userData = new this.userModel(user)
    return userData.save();
  }

  async findAllHotels(): Promise<IHotel[]> {
    return this.hotelModel.find();
  }

  async findHotelById(id: Types.ObjectId): Promise<IHotel | null> {
    return this.hotelModel.findById(id);
  }

  async updateHotel(hotel: IHotel): Promise<IHotel> {
    const newHotel = new this.hotelModel(hotel)
    return newHotel.save();
  }
}