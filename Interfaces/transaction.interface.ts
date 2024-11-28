import { ITransaction } from "./common.interface";

export interface ITransactionRepository {
    getAdminTransactions(): Promise<ITransaction[]>;
    getManagerTransactions(managerId: string): Promise<ITransaction[]>;
  }
  
  export interface ITransactionService {
    getAdminTransactions(): Promise<ITransaction[]>;
    getManagerTransactions(managerId: string): Promise<ITransaction[]>;
  }