import { Model } from "mongoose";
import { IChatRepository } from "../Interfaces/chat.interface";
import { IChat, IMessage } from "../Interfaces/common.interface";

class ChatRepository implements IChatRepository {
  private chatModel: Model<IChat>;

  constructor(chatModel: Model<IChat>) {
    this.chatModel = chatModel;
  }

  async getChat(managerId: string, userId: string, bookingId: string): Promise<IChat | null> {
    try {
      return await this.chatModel.findOne({ manager: managerId, user: userId, bookingId: bookingId });
    } catch (error) {
      throw error;
    }
  }

  async createChat(managerId: string, userId: string, bookingId: string): Promise<IChat> {
    try {
      if (!managerId || !userId || !bookingId) {
        console.error("Missing required fields in createChat",{ managerId, userId, bookingId });
        throw new Error("All fields are required");
      }
      const newChat: IChat = new this.chatModel({
        manager: managerId,
        user: userId,
        bookingId,
        messages: []
      });
      return await newChat.save();
    } catch (error) {
      throw error;
    }
  }

  async saveMessage(chatId: string, message: IMessage): Promise<IChat | null> {
    try {
      console.log("Saving message to chatId:", chatId);
      if (!message) {
        console.error("Message content missing:", message);
        throw new Error("Message content is required");
      }
        const updatedChat = await this.chatModel.findByIdAndUpdate(
        chatId,
        { $push: { messages: message } },
        { new: true }
      );
      if (!updatedChat) {
        console.error("Chat not found");
      }
      return updatedChat;
    } catch (error) {
      throw error;
    }
  }

  async getChatByBookingId(bookingId: string): Promise<IChat | null> {
    try {
      return await this.chatModel.findOne({ bookingId: bookingId });
    } catch (error) {
      throw error;
    }
  }

  async getChatsByManagerId(managerId: string): Promise<IChat[]> {
    try {
      return await this.chatModel.find({ manager: managerId });
    } catch (error) {
      throw error;
    }
  }

  async getChatsByUserId(userId: string): Promise<IChat[]> {
    try {
      return await this.chatModel.find({ user: userId });
    } catch (error) {
      throw error;
    }
  }
}

export default ChatRepository;

