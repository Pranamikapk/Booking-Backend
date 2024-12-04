import { Model } from 'mongoose';
import { IBooking, IHotel, IManager, ITransaction, IUser } from '../Interfaces/common.interface';
import { ITransactionRepository } from '../Interfaces/transaction.interface';

export class TransactionRepository implements ITransactionRepository {
  constructor(
    private bookingModel: Model<IBooking>,
    private managerModel: Model<IManager>
  ) {}

  async getAdminTransactions(): Promise<ITransaction[]> {
    const transactions = await this.bookingModel
      .find({ status: 'Completed' })
      .populate({
        path: 'user',
        select: 'name email',
      })
      .populate({
        path: 'hotel',
        select: 'name address',
      })
      .sort({ createdAt: -1 });

    return transactions.map((transaction) => this.mapToAdminTransaction(transaction));
  }

  async getManagerTransactions(managerId: string): Promise<ITransaction[]> {
    const manager = await this.managerModel.findById(managerId);
    if (!manager) {
      throw new Error('Manager not found');
    }

    const transactions = await this.bookingModel
      .find({
        hotel: { $in: manager.hotels },
        status: { $in :['Completed','Cancelled']},
      })
      .populate({
        path: 'user',
        select: 'name email',
      })
      .populate({
        path: 'hotel',
        select: 'name address',
      })
      .sort({ createdAt: -1 });

      return transactions.map((transaction) => {
        if (transaction.status === 'Cancelled') {
          transaction.totalPrice = 0;  
          transaction.revenueDistribution.admin = 0;
        }
        return this.mapToAdminTransaction(transaction);
      });  }

  private mapToAdminTransaction(transaction: IBooking): ITransaction {
    const hotel = transaction.hotel as IHotel;
    const user = transaction.user as IUser; 

    return {
      bookingId: transaction._id,
      hotelName: hotel.name,
      guestName: user.name || 'Unknown Guest',
      checkInDate: transaction.checkInDate,
      checkOutDate: transaction.checkOutDate,
      totalPrice: transaction.totalPrice,
      adminRevenue: transaction.revenueDistribution.admin,
      createdAt: transaction.createdAt!,
    };
  }

  private mapToManagerTransaction(transaction: IBooking): ITransaction {
    const hotel = transaction.hotel as IHotel;
    const user = transaction.user as IUser;

    return {
      bookingId: transaction._id,
      hotelName: hotel.name,
      guestName: user.name || 'Unknown Guest',
      checkInDate: transaction.checkInDate,
      checkOutDate: transaction.checkOutDate,
      totalPrice: transaction.totalPrice,
      managerRevenue: transaction.revenueDistribution.manager,
      createdAt: transaction.createdAt!,
    };
  }
}
