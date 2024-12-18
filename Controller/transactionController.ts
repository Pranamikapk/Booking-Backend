import { Request, Response } from 'express';
import HTTP_statusCode from '../Enums/httpStatusCodes';
import { ITransactionService } from '../Interfaces/transaction.interface';

export class TransactionController {
  constructor(private transactionService: ITransactionService) {}

  getUserTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user_id;
      if (!userId) {
        res.status(HTTP_statusCode.Unauthorized).json({ message: 'Unauthorized' });
        return;
      }

      const transactions = await this.transactionService.getUserTransactions(userId);
      console.log(transactions);
      
      res.status(HTTP_statusCode.OK).json(transactions);
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: 'Internal server error' });
    }
  };

  getAdminTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const transactions = await this.transactionService.getAdminTransactions();
      console.log(transactions);
      
      res.status(HTTP_statusCode.OK).json(transactions);
    } catch (error) {
      console.error("Error fetching admin transactions:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: 'Error fetching admin transactions' });
    }
  }

  getManagerTransactions = async (req: Request, res: Response): Promise<void> => {
    const managerId = req.user_id;

    if (!managerId) {
      res.status(HTTP_statusCode.Unauthorized).json({ message: 'Unauthorized' });
      return;
    }

    try {
      const transactions = await this.transactionService.getManagerTransactions(managerId);
      res.status(HTTP_statusCode.OK).json(transactions);
    } catch (error) {
      console.error("Error fetching manager transactions:", error);
      if (error instanceof Error && error.message === 'Manager not found') {
        res.status(HTTP_statusCode.NotFound).json({ message: 'Manager not found' });
      } else {
        res.status(HTTP_statusCode.InternalServerError).json({ message: 'Error fetching manager transactions' });
      }
    }
  }
}