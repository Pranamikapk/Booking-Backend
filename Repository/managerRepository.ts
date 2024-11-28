import { Model } from 'mongoose';
import { IManager } from '../Interfaces/common.interface';
import { IManagerRepository } from '../Interfaces/manager.repository';

export class ManagerRepository implements IManagerRepository {
  constructor(private managerModel: Model<IManager>) {}

  async findByEmail(email: string): Promise<IManager | null> {
    const manager = this.managerModel.findOne({ email }).lean()
    return manager;
  }

  async findByHotel(hotel: string): Promise<IManager | null> {
    return this.managerModel.findOne({ hotel });
  }

  async create(managerData: Partial<IManager>): Promise<IManager> {
    const manager = new this.managerModel(managerData);
    return manager.save();
  }

  async findById(id: string): Promise<IManager | null> {
    const manager = await this.managerModel.findById(id)
    return manager
  }

  async update(id: string, updateData: Partial<IManager>): Promise<IManager | null> {
    return this.managerModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async updateWallet(managerId: string, amount: number): Promise<IManager | null> {
    const updatedManager = await this.managerModel.findByIdAndUpdate(
      managerId,
      { $inc: { wallet: amount } },
      { new: true }
    ).populate('hotel')
    return updatedManager;
  }
}