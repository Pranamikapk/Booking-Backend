import { Types } from 'mongoose';
import { IChatRepository } from '../Interfaces/chat.interface';
import { ChatRoom, Message } from '../Interfaces/common.interface';
import { ChatRoomModel, MessageModel } from '../Model/chatModel';


export class ChatRepository implements IChatRepository {
  async createMessage(messageData: Partial<Message>): Promise<Message> {
    const message = new MessageModel(messageData);
    await message.save();
    return message;
  }

  async getMessagesByBookingId(bookingId: string, userId: string): Promise<Message[]> {
    return MessageModel.find({
      bookingId,
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ timestamp: 1 });
  }

  async getChatRoomsByUserId(userId: string): Promise<ChatRoom[]> {
    return ChatRoomModel.find({
      $or: [{ userId }, { managerId: userId }]
    })
    .populate('lastMessage')
    .sort({ updatedAt: -1 });
  }

  async updateChatRoom(bookingId: string, lastMessageId: Types.ObjectId): Promise<void> {
    await ChatRoomModel.findOneAndUpdate(
      { bookingId },
      {
        lastMessage: lastMessageId,
        updatedAt: new Date()
      },
      { upsert: true }
    );
  }

  async createChatRoom(chatRoomData: Partial<ChatRoom>): Promise<ChatRoom> {
    const chatRoom = new ChatRoomModel(chatRoomData);
    await chatRoom.save();
    return chatRoom;
  }
}

