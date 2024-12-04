import { IBooking } from "./common.interface";

export interface IBookingRepository {
    create(bookingData: Partial<IBooking>): Promise<IBooking>;
    findById(id: string): Promise<IBooking | null>;
    update(id: string, updateData: Partial<IBooking>): Promise<IBooking | null>;
    findByUserId(userId: string): Promise<IBooking[]>;
    findByHotelIds(hotelIds: string[]): Promise<IBooking[]>;
  }
  
  export interface IBookingService {
    createBooking(bookingData: any, user: any): Promise<{ booking: IBooking; orderId: string; amountPaid: number; remainingAmount: number }>;
    verifyPayment(paymentData: any, bookingId: string): Promise<IBooking>;
    walletPayment(bookingId: string, userId: string, amount: number): Promise<IBooking> 
    listBookings(userId: string): Promise<IBooking[]>;
    getBookingDetails(bookingId: string , managerId : any): Promise<IBooking>;
    listReservations(managerId: string): Promise<IBooking[]>;
    getReservationDetails(bookingId: string , managerId : any): Promise<IBooking>;
    cancelRequest(bookingId: string, reason: string): Promise<{ cancellationRequest: any; updatedBooking: any }>;
    cancelApprove(bookingId: string): Promise<{ message: string; refundAmount: number }>;
    cancelReject(bookingId: string): Promise<{ message: string }>;
  }