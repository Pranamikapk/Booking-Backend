import crypto from 'crypto';
import { Types } from 'mongoose';
import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';
import { IBookingRepository, IBookingService } from '../Interfaces/booking.interface';
import { IManagerRepository } from '../Interfaces/manager.repository';
import { IUserRepository } from '../Interfaces/user.repository.interface';

const ADMIN_COMMISSION_PERCENTAGE = 20;

export class BookingService implements IBookingService {
  private razorpay: Razorpay;
  private bookingRepository: IBookingRepository;
  private userRepository: IUserRepository;
  private managerRepository: IManagerRepository;

  constructor(
     bookingRepository: IBookingRepository,
     userRepository: IUserRepository,
     managerRepository: IManagerRepository
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
    this.bookingRepository =  bookingRepository
    this.userRepository = userRepository
    this.managerRepository = managerRepository
  }

  async createBooking(bookingData: any, user: any) {
    const {
      hotelId,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      idType,
      idPhoto,
      paymentOption
    } = bookingData;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const totalDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    const amountPaid = paymentOption === 'partial' ? totalPrice * 0.2 : totalPrice;
    const remainingAmount = totalPrice - amountPaid;

    const adminShare = (amountPaid * ADMIN_COMMISSION_PERCENTAGE) / 100;
    const managerShare = amountPaid - adminShare;

    const newBooking = await this.bookingRepository.create({
      user: user._id,
      hotel: hotelId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests,
      totalPrice,
      totalDays,
      transactionId: uuidv4(),
      status: 'pending',
      userCredentials: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        idType: idType || 'Aadhar',
        idPhoto
      },
      amountPaid,
      remainingAmount,
      revenueDistribution: {
        admin: adminShare,
        manager: managerShare
      }
    });

    const options = {
      amount: amountPaid * 100,
      currency: 'INR',
      receipt: newBooking._id.toString(),
    };

    const order = await this.razorpay.orders.create(options);

    return {
      booking: newBooking,
      orderId: order.id,
      amountPaid,
      remainingAmount
    };
  }

  async verifyPayment(paymentData: any, bookingId: string) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentData;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      throw new Error('Payment verification failed');
    }

    const updatedBooking = await this.bookingRepository.update(bookingId, {
      status: 'completed',
      transactionId: razorpayPaymentId,
      paymentDate: new Date(),
    });

    if (!updatedBooking || !updatedBooking.hotel) {
      throw new Error('Booking or hotel not found');
    }

    // Uncomment these lines when ready to implement wallet updates
    // await this.userRepository.updateWallet(process.env.ADMIN_ID!, updatedBooking.revenueDistribution.admin);
    // await this.managerRepository.updateWallet(updatedBooking.hotel.manager.toString(), updatedBooking.revenueDistribution.manager);

    return updatedBooking;
  }

  async listBookings(userId: string) {
    return await this.bookingRepository.findByUserId(userId);
  }

  async getBookingDetails(bookingId: string) {
    const booking = await this.bookingRepository.findById(bookingId);
    console.log("booking:",booking);
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    return booking;
  }

  async listReservations(managerId: string) {
    const manager = await this.managerRepository.findById(managerId);
    console.log(manager , manager?.hotels , manager?.hotels.length);
    
    if (!manager || !manager.hotels || manager.hotels.length === 0) {
      throw new Error('Manager has no associated hotel');
    }
    return await this.bookingRepository.findByHotelIds(manager.hotels.map(id => id.toString()));
  }

  async cancelRequest(bookingId: string, reason: string) {
    const updatedBooking = await this.bookingRepository.update(bookingId, {
      status: 'cancellation_pending',
      cancellationRequest: {
        _id: new Types.ObjectId(),
        bookingId: new Types.ObjectId(bookingId),
        reason: reason,
        status: 'pending'
      }
    });

    if (!updatedBooking) {
      throw new Error('Booking not found');
    }

    const cancellationRequest = updatedBooking.cancellationRequest;
    if (!cancellationRequest || cancellationRequest instanceof Types.ObjectId) {
      throw new Error('Cancellation request not created properly');
    }

    return {
      cancellationRequest: {
        id: cancellationRequest._id,
        bookingId: updatedBooking._id,
        reason: cancellationRequest.reason,
        status: cancellationRequest.status,
        createdAt: cancellationRequest.createdAt || new Date()
      },
      updatedBooking: {
        id: updatedBooking._id,
        status: updatedBooking.status
      }
    };
  }

  async cancelApprove(bookingId: string) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.cancellationRequest && !(booking.cancellationRequest instanceof Types.ObjectId)) {
        booking.cancellationRequest.status = 'approved';
        await this.bookingRepository.update(bookingId, booking);
      } else {
        throw new Error('Invalid cancellation request');
      }

    const checkInDate = new Date(booking.checkInDate);
    const currentDate = new Date();
    const timeDiff = checkInDate.getTime() - currentDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);

    let refundPercentage = 100;
    if (daysDiff < 2) {
      refundPercentage = Math.max(0, 100 - (2 * (2 - daysDiff)));
    }

    const refundAmount = (booking.amountPaid * refundPercentage) / 100;

    return { message: 'Cancellation approved and refund processed.', refundAmount };
  }

  async cancelReject(bookingId: string) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.cancellationRequest && !(booking.cancellationRequest instanceof Types.ObjectId)) {
        booking.cancellationRequest.status = 'rejected';
        await this.bookingRepository.update(bookingId, booking);
      } else {
        throw new Error('Invalid cancellation request');
      }

    return { message: 'Cancellation request rejected.' };
  }
}