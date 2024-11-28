import { Types } from "mongoose";
import { IChatRepository } from "../Interfaces/chat.interface";
import { ChatRoom, Message } from "../Interfaces/common.interface";


export class ChatService implements ChatService {
  private chatRepository: IChatRepository;

  constructor(chatRepository: IChatRepository) {
    this.chatRepository = chatRepository;
  }

  async sendMessage(messageData: {
    sender: string;
    receiver: string;
    content: string;
    bookingId: string;
  }): Promise<Message> {
    const message = await this.chatRepository.createMessage({
      ...messageData,
      timestamp: new Date(),
      read: false
    });

    await this.chatRepository.updateChatRoom(messageData.bookingId,new Types.ObjectId(message._id));
    return message;
  }

  async getMessages(bookingId: string, userId: string): Promise<Message[]> {
    return this.chatRepository.getMessagesByBookingId(bookingId, userId);
  }

  async getChatRooms(userId: string): Promise<ChatRoom[]> {
    return this.chatRepository.getChatRoomsByUserId(userId);
  }
}

