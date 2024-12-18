import { ITransaction } from "./common.interface";

export interface ITransactionRepository {
    getUserTransactions(userId: string): Promise<ITransaction[]> 
    getAdminTransactions(): Promise<ITransaction[]>;
    getManagerTransactions(managerId: string): Promise<ITransaction[]>;
  }
  
  export interface ITransactionService {
    getUserTransactions(userId: string): Promise<ITransaction[]> 
    getAdminTransactions(): Promise<ITransaction[]>;
    getManagerTransactions(managerId: string): Promise<ITransaction[]>;
  }