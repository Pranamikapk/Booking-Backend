import mongoose, { Document, Schema } from 'mongoose';
import { ChatRoom, Message } from '../Interfaces/common.interface';

3

const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  receiver: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  bookingId: { type: Schema.Types.ObjectId, required: true, ref: 'Booking' },
  read: { type: Boolean, default: false }
});

const chatRoomSchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, required: true, ref: 'Booking' },
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  managerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  updatedAt: { type: Date, default: Date.now }
});

export const MessageModel = mongoose.model<Message & Document>('Message', messageSchema);
export const ChatRoomModel = mongoose.model<ChatRoom & Document>('ChatRoom', chatRoomSchema);

