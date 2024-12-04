import { Request, Response } from 'express';
import { ITransactionService } from '../Interfaces/transaction.interface';

export class TransactionController {
  constructor(private transactionService: ITransactionService) {}

  getAdminTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const transactions = await this.transactionService.getAdminTransactions();
      console.log(transactions);
      
      res.status(200).json(transactions);
    } catch (error) {
      console.error("Error fetching admin transactions:", error);
      res.status(500).json({ message: 'Error fetching admin transactions' });
    }
  }

  getManagerTransactions = async (req: Request, res: Response): Promise<void> => {
    const managerId = req.user_id;

    if (!managerId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    try {
      const transactions = await this.transactionService.getManagerTransactions(managerId);
      res.status(200).json(transactions);
    } catch (error) {
      console.error("Error fetching manager transactions:", error);
      if (error instanceof Error && error.message === 'Manager not found') {
        res.status(404).json({ message: 'Manager not found' });
      } else {
        res.status(500).json({ message: 'Error fetching manager transactions' });
      }
    }
  }
}