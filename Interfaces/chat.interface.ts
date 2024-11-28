import { Types } from "mongoose";
import { ChatRoom, Message } from "./common.interface";

export interface IChatRepository {
    createMessage(messageData: Partial<Message>): Promise<Message>;
    getMessagesByBookingId(bookingId: string, userId: string): Promise<Message[]>;
    getChatRoomsByUserId(userId: string): Promise<ChatRoom[]>;
    updateChatRoom(bookingId: string, lastMessageId: Types.ObjectId): Promise<void>;
    createChatRoom(chatRoomData: Partial<ChatRoom>): Promise<ChatRoom>;
  }

export interface IChatService {
    sendMessage(messageData: {
        sender: string;
        receiver: string;
        content: string;
        bookingId: string;
    }): Promise<Message>;
    getMessages(bookingId: string, userId: string): Promise<Message[]>;
    getChatRooms(userId: string): Promise<ChatRoom[]>;
}
  