import { NextFunction, Request, Response } from 'express';
import HTTP_statusCode from '../Enums/httpStatusCodes';
import { IBookingService } from '../Interfaces/booking.interface';

export class BookingController {
  constructor(private bookingService: IBookingService) {
    if (!bookingService) {
        console.error('Booking service is not injected!');
      }
  }
 
  async createBooking(req: Request, res: Response) {
    try {
      const user = req.body.user
      const result = await this.bookingService.createBooking(req.body, user);
      console.log("Result:",result);
      
      res.status(200).json(result);
    } catch (error:any) {
      console.error('Error creating booking:', error);
      res.status(500).json({ message: 'Error creating booking', error: error.message });
    }
  }

  async verifyPayment(req: Request, res: Response) {
    try {
      const updatedBooking = await this.bookingService.verifyPayment(req.body, req.body.bookingId);
      res.status(200).json({
        message: 'Payment verified and booking completed successfully',
        booking: updatedBooking,
      });
    } catch (error:any) {
      console.error('Error verifying payment:', error);
      res.status(500).json({ message: 'Failed to verify payment', error: error.message });
    }
  }

  async walletPayment(req: Request, res: Response) {
    try {
      const { bookingId, amount } = req.body;
      const userId = req.user_id as string 
      if(!userId){
        res.status(HTTP_statusCode.BadRequest).json({ message: 'User not authenticated' })
      }
      const result = await this.bookingService.walletPayment(bookingId, userId, amount);
      res.status(200).json({ message: "Wallet payment successful", booking: result });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async listBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user_id;
      if (!userId) {
         res.status(401).json({ message: 'User not authenticated' });
         return
      }
      const bookings = await this.bookingService.listBookings(userId);
      res.status(200).json(bookings);
    } catch (error:any) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
  }

  async bookingDetails(req: Request, res: Response) {
    try {
      const { bookingId } = req.params ;
      const userId = req.user_id ;
      console.log('User ID from token:', req.user_id); 
      console.log('BookingId:', bookingId, 'UserId:', userId);
      
      const booking = await this.bookingService.getBookingDetails(bookingId, userId);
      res.status(200).json(booking);
    } catch (error:any) {
      console.error("Error fetching booking details:", error);
      res.status(500).json({ message: 'Error fetching booking details', error: error.message });
    }
  }

  async listReservations(req: Request, res: Response, next: NextFunction): Promise<void>{
    try {
      const managerId = req.user_id;      
      if (!managerId) {
         res.status(401).json({ message: 'Manager not authenticated' });
         return
      }
      const reservations = await this.bookingService.listReservations(managerId);
      if (!reservations || reservations.length === 0) {
        res.status(200).json([]);
        return;  
      }
      res.status(200).json(reservations);
    } catch (error:any) {
      console.error("Error fetching reservations:", error);
      next(error); 
    }
  }

  async reservationDetails(req: Request, res: Response) {
    try {
      console.log("Insideeeeee");
      const { bookingId } = req.params ;
      const userId = req.user_id ;
      console.log('BookingId:', bookingId, 'ManagerId:', userId);
      
      const booking = await this.bookingService.getReservationDetails(bookingId, userId);
      res.status(200).json(booking);
    } catch (error:any) {
      console.error("Error fetching booking details:", error);
      res.status(500).json({ message: 'Error fetching booking details', error: error.message });
    }
  }

  async cancelRequest(req: Request, res: Response) {
    try {
      const { bookingId, reason } = req.body;
      const result = await this.bookingService.cancelRequest(bookingId, reason);
      res.status(201).json({
        message: 'Cancellation request submitted successfully.',
        ...result
      });
    } catch (error:any) {
      console.error('Error in cancelRequest:', error);
      res.status(500).json({ message: 'Error submitting cancellation request', error: error.message });
    }
  }

  async cancelApprove(req: Request, res: Response) {
    try {
      const result = await this.bookingService.cancelApprove(req.params.bookingId);
      res.status(200).json(result);
    } catch (error:any) {
      console.error('Error approving cancellation:', error);
      res.status(500).json({ message: 'Error approving cancellation', error: error.message });
    }
  }

  async cancelReject(req: Request, res: Response) {
    try {
      const result = await this.bookingService.cancelReject(req.params.bookingId);
      res.status(200).json(result);
    } catch (error:any) {
      console.error('Error rejecting cancellation:', error);
      res.status(500).json({ message: 'Error rejecting cancellation', error: error.message });
    }
  }
}