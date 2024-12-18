import { ITransaction } from "../Interfaces/common.interface";
import { ITransactionRepository, ITransactionService } from "../Interfaces/transaction.interface";

export class TransactionService implements ITransactionService {
  constructor(private transactionRepository: ITransactionRepository) {}

  async getUserTransactions(userId: string): Promise<ITransaction[]> {
    return this.transactionRepository.getUserTransactions(userId);
  }

  async getAdminTransactions(): Promise<ITransaction[]> {
    return this.transactionRepository.getAdminTransactions();
  }

  async getManagerTransactions(managerId: string): Promise<ITransaction[]> {
    return this.transactionRepository.getManagerTransactions(managerId);
  }
}