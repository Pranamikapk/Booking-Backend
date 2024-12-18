import { Document, ObjectId, Types } from "mongoose";

export interface IUser extends Document{
  _id: Types.ObjectId;
  name?: string;
  email: string;
  phone?: string;
  password?: string;
  token?: string;
  role: "client" | "admin";
  wallet?: number;
  isBlocked?: boolean;
  otp?: string;
  otpExpires?: Date;
  isVerified?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IManager {
  _id: Types.ObjectId;
  hotel: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  licence?: string;
  hotels: Types.ObjectId[];
  token?: string;
  wallet?: number;
  isBlocked?: boolean;
  isVerified?: boolean;
  otp?: string;
  otpExpires?: Date;
  isApproved?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface IRooms {
  bedrooms: number;
  beds: number;
  bathrooms: number;
}

export interface RoomCategory {
  name: string;
  bedType: string;
  capacity: number;
  quantity: number;
  rate: number;
  description?: string;
}


export interface IHotel {
  _id: Types.ObjectId;
  manager: Types.ObjectId | IManager;
  propertyType: "Resort" | "Flat/Apartment" | "House" | "Beach House";
  placeType: "Room" | "Entire Place" | "Shared Space";
  roomCategories: RoomCategory[];
  name: string;
  address: IAddress;
  rooms: IRooms;
  amenities: string[];
  photos: string[];
  price: number;
  description: string;
  isVerified?: boolean;
  isListed?: boolean;
  availability: {
    date: Date;
    isAvailable: boolean;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateHotelDTO {
  propertyType: IHotel['propertyType'];
  placeType: IHotel['placeType'];
  roomCategories: RoomCategory[];
  name: string;
  address: IAddress;
  rooms: IRooms;
  amenities: string[];
  photos: string[];
  price: number;
  description: string;
  availability: IHotel['availability'];
}

export interface IUpdateHotelDTO {
  propertyType?: IHotel['propertyType'];
  placeType?: IHotel['placeType'];
  roomCategories: RoomCategory[];
  name?: string;
  address?: Partial<IAddress>;
  rooms?: Partial<IRooms>;
  amenities?: string[];
  photos?: string[];
  price?: number;
  description?: string;
  isVerified?: boolean;
  isListed?: boolean;
  availability?: IHotel['availability'];
}

export interface ICancellation {
  _id: Types.ObjectId;
  bookingId: Types.ObjectId;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt?: Date;
}

export interface IUserCredentials {
  name: string;
  email: string;
  phone: string;
  idType: "Aadhar" | "Passport" | "Driving License";
  idPhoto: string[];
}

export interface IRevenueDistribution {
  admin: number;
  manager: number;
}

export interface IBooking {
  _id: Types.ObjectId;
  user: Types.ObjectId | IUser;
  hotel: Types.ObjectId | IHotel;
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  totalPrice: number;
  totalDays: number;
  transactionType: string;
  transactionId: string;
  status: "Pending" | "Cancelled" | "Completed" | "Cancellation_pending" | "Approved" | "Rejected";
  amountPaid: number;
  remainingAmount: number;
  revenueDistribution: IRevenueDistribution;
  userCredentials: IUserCredentials;
  cancellationRequest?: Types.ObjectId | ICancellation;
  paymentDate ?: Date;
  createdAt?: Date;
}

export interface ITransaction {
  bookingId: Types.ObjectId;
  hotelName: string;
  guestName: string;
  checkInDate: Date;
  checkOutDate: Date;
  status?: string;
  transactionType: string;
  totalPrice: number;
  adminRevenue?: number;
  managerRevenue?: number;
  createdAt: Date;
}

// export interface IMessage {
//   sender: string;
//   receiver: string;
//   content: string;
//   timestamp: Date;
// }

// export interface IChat extends Document {
//   _id: ObjectId; 
//   manager: string;
//   user: string;
//   hotelId: string;
//   messages: IMessage[];
//   createdAt?: Date;
//   updatedAt?: Date;
// }

export interface IMessage {
  sender: string;
  content: string;
  timestamp: Date;
}

export interface IChat extends Document {
  _id: string | ObjectId;
  bookingId: string;
  managerId: string;
  userId: string;
  messages: IMessage[];
}