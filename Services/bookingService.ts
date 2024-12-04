import crypto from "crypto";
import { Types } from "mongoose";
import Razorpay from "razorpay";
import { v4 as uuidv4 } from "uuid";
import {
  IBookingRepository,
  IBookingService,
} from "../Interfaces/booking.interface";
import { IBooking, IHotel } from "../Interfaces/common.interface";
import { IManagerRepository } from "../Interfaces/manager.repository";
import { IUserRepository } from "../Interfaces/user.repository.interface";
import CancellationModel from "../Model/cancellationModel";

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
    this.bookingRepository = bookingRepository;
    this.userRepository = userRepository;
    this.managerRepository = managerRepository;
  }

  async createBooking(bookingData: any, user: any) {
    console.log("BookingData:", bookingData);

    const {
      hotelId,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      idType,
      idPhoto,
      paymentOption,
    } = bookingData;
    console.log("user:", user);

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const totalDays = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    const amountPaid =
      paymentOption === "partial" ? totalPrice * 0.2 : totalPrice;
    const remainingAmount = totalPrice - amountPaid;

    const adminShare = (amountPaid * ADMIN_COMMISSION_PERCENTAGE) / 100;
    const managerShare = amountPaid - adminShare;

    const newBooking = await this.bookingRepository.create({
      user: user,
      hotel: hotelId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests,
      totalPrice,
      totalDays,
      transactionId: uuidv4(),
      status: "Pending",
      userCredentials: {
        name: bookingData.userCredentials.name,
        email: bookingData.userCredentials.email,
        phone: bookingData.userCredentials.phone,
        idType: bookingData.userCredentials.idType || "Aadhar",
        idPhoto: bookingData.userCredentials.idPhoto || "No image uploaded",
      },
      amountPaid,
      remainingAmount,
      revenueDistribution: {
        admin: adminShare,
        manager: managerShare,
      },
    });

    console.log("newBooking: ", newBooking);

    const options = {
      amount: amountPaid * 100,
      currency: "INR",
      receipt: newBooking._id.toString(),
    };

    const order = await this.razorpay.orders.create(options);

    return {
      booking: newBooking,
      orderId: order.id,
      amountPaid,
      remainingAmount,
    };
  }

async verifyPayment(paymentData: any, bookingId: string) {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentData;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    throw new Error("Payment verification failed");
  }

  const booking = await this.bookingRepository.findById(bookingId);
  if (!booking) {
    throw new Error("Booking not found");
  }

  const hotel = booking.hotel;
  if (!hotel || typeof hotel === 'string') {
    throw new Error("Hotel not populated correctly");
  }

  // const managerId = hotel.manager instanceof Types.ObjectId ? hotel.manager.toString() : hotel.manager._id.toString();

  booking.status = "Completed";
  booking.transactionId = razorpayPaymentId;
  booking.paymentDate = new Date();

  const updatedBooking = await this.bookingRepository.update(bookingId, booking);
  if (!updatedBooking) {
    throw new Error("Failed to update booking");
  }

  await this.userRepository.updateWallet(process.env.ADMIN_ID!, updatedBooking.revenueDistribution.admin);
  // await this.managerRepository.updateWallet(managerId, updatedBooking.revenueDistribution.manager);

  return updatedBooking;
}


async walletPayment(bookingId: string, userId: string, amount: number): Promise<IBooking> {
  const user = await this.userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.wallet || user.wallet < amount) {
    throw new Error("Insufficient wallet balance");
  }

  const booking = await this.bookingRepository.findById(bookingId);
  if (!booking) {
    throw new Error("Booking not found");
  }

  await this.userRepository.updateWallet(userId, -amount);

  booking.status = "Completed";
  booking.amountPaid = amount;
  booking.remainingAmount = 0;
  booking.paymentDate = new Date();

  const updatedBooking = await this.bookingRepository.update(bookingId, booking);
  if (!updatedBooking) {
    throw new Error("Failed to update booking");
  }

  const adminShare = (amount * ADMIN_COMMISSION_PERCENTAGE) / 100;
  const managerShare = amount - adminShare;

  await this.userRepository.updateWallet(process.env.ADMIN_ID!, adminShare);
  
  if (booking.hotel && typeof booking.hotel === 'object' && 'manager' in booking.hotel) {
    const hotel = booking.hotel as IHotel;
    if (hotel.manager instanceof Types.ObjectId) {
      await this.managerRepository.updateWallet(hotel.manager.toString(), managerShare);
    } else if (typeof hotel.manager === 'object' && '_id' in hotel.manager) {
      await this.managerRepository.updateWallet(hotel.manager._id.toString(), managerShare);
    } else {
      throw new Error("Invalid hotel data: Manager not found");
    }
  } else {
    throw new Error("Invalid hotel data");
  }

  return updatedBooking;
}

  

  async listBookings(userId: string) {
    return await this.bookingRepository.findByUserId(userId);
  }

  async getBookingDetails(
    bookingId: string,
    userId: string
  ): Promise<IBooking> {
    console.log("userId:", userId);

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found!!");
    }

    const booking = await this.bookingRepository.findById(bookingId);
    console.log("Booking:", booking);

    if (!booking) {
      throw new Error("Booking not found");
    }
    return booking;
  }

  async listReservations(managerId: string) {
    const manager = await this.managerRepository.findById(managerId);
    if (!manager) {
      throw new Error("Manager not found");
    }

    if (!manager.hotels || manager.hotels.length === 0) {
      throw new Error("Manager has no associated hotels");
    }
    return await this.bookingRepository.findByHotelIds(
      manager.hotels.map((id) => id.toString())
    );
  }

  async getReservationDetails(
    bookingId: string,
    managerId: string
  ): Promise<IBooking> {
    console.log("managerId:", managerId);
    const manager = await this.managerRepository.findById(managerId);
    if (!manager) {
      throw new Error("Manager not found!!");
    }
    const booking = await this.bookingRepository.findById(bookingId);
    console.log("Booking:", booking);
    if (!booking) {
      throw new Error("Booking not found");
    }
    if (!manager.hotels.includes(booking.hotel._id)) {
      throw new Error("Booking does not belong to any of the manager's hotels");
    }
    return booking;
  }

  async cancelRequest(bookingId: string, reason: string) {
    const cancellationRequest = await CancellationModel.create({
      bookingId: new Types.ObjectId(bookingId),
      reason: reason,
      status: "Pending",
    });

    const updatedBooking = await this.bookingRepository.update(bookingId, {
      status: "Cancellation_pending",
      cancellationRequest: cancellationRequest._id,
    });

    if (!updatedBooking) {
      throw new Error("Booking not found");
    }

    return {
      cancellationRequest: {
        id: cancellationRequest._id,
        bookingId: updatedBooking._id,
        reason: cancellationRequest.reason,
        status: cancellationRequest.status,
        createdAt: cancellationRequest.createdAt,
      },
      updatedBooking: {
        id: updatedBooking._id,
        status: updatedBooking.status,
      },
    };
  }

  async cancelApprove(bookingId: string) {
    try {
      const booking = await this.bookingRepository.findById(bookingId);
      if (!booking) throw new Error("Booking not found");
      console.log("Booking:", booking);  
  
      await this.bookingRepository.update(bookingId, {
        status: "Approved",
      });
      
      if (booking.cancellationRequest) {
        await CancellationModel.updateOne(
          { _id: booking.cancellationRequest._id },
          {  status: "Approved"  }
        );
      } else {
        throw new Error("Cancellation request not found");
      }

      const checkInDate = new Date(booking.checkInDate);
      const currentDate = new Date();
      const daysDiff = (checkInDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24);
  
      let refundPercentage = 100;
      if (daysDiff < 2) {
        refundPercentage = Math.max(0, 100 - 20 * (2 - daysDiff));
      }
  
      const refundAmount = (booking.amountPaid * refundPercentage) / 100;
  
      if (booking.user && '_id' in booking.user) {
        await this.userRepository.updateWallet(booking.user._id.toString(), refundAmount);
      } else {
        throw new Error("Invalid user data: User not found");
      }
  
      if (booking.hotel && typeof booking.hotel === 'object' && 'manager' in booking.hotel) {
        const hotel = booking.hotel as IHotel;
        if (hotel.manager instanceof Types.ObjectId) {
          await this.managerRepository.updateWallet(hotel.manager.toString(), -refundAmount * 0.8);
        } else if (typeof hotel.manager === 'object' && '_id' in hotel.manager) {
          await this.managerRepository.updateWallet(hotel.manager._id.toString(), -refundAmount * 0.8);
        } else {
          throw new Error("Invalid hotel data: Manager not found");
        }
      } else {
        throw new Error("Invalid hotel data");
      }
  
      if (process.env.ADMIN_ID) {
        await this.userRepository.updateWallet(process.env.ADMIN_ID, -refundAmount * 0.2);
      } else {
        throw new Error("Admin ID is missing from environment variables");
      }
  
      return {
        message: "Cancellation approved and refund processed.",
        refundAmount,
        booking
      };
  
    } catch (error:any) {
      console.error("Error during cancellation approval:", error);  
      throw new Error(`Cancellation approval failed: ${error.message}`);
    }
  }
  
  
  async cancelReject(bookingId: string) {
    try {
      const booking = await this.bookingRepository.findById(bookingId);
      if (!booking) throw new Error("Booking not found");
  
      if (!booking.cancellationRequest || !(booking.cancellationRequest instanceof Object)) {
        throw new Error("Invalid cancellation request");
      }

      if (booking.cancellationRequest) {
        await CancellationModel.updateOne(
          { _id: booking.cancellationRequest._id },
          { $set: { status: "rejected" } }
        );
      } else {
        throw new Error("Cancellation request not found");
      }

      await this.bookingRepository.update(bookingId, {
        status: "Rejected",
      });
      return {
        message: "Cancellation request rejected.",
        booking
      };
    } catch (error : any) {
      throw new Error(`Cancellation rejection failed: ${error.message}`);
    }
  }
  
}
