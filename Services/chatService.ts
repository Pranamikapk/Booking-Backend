import { IChatRepository } from "../Interfaces/chat.interface";
import { IChat, IMessage } from "../Interfaces/common.interface";


class ChatService {
  private chatRepository: IChatRepository;

  constructor(chatRepository: IChatRepository) {
    this.chatRepository = chatRepository;
  }

  async getOrCreateChat(sender: string, receiver: string, bookingId: string): Promise<IChat> {
    try {
      let chat = await this.chatRepository.getChat(sender, receiver, bookingId);
      if (!chat) {
        chat = await this.chatRepository.createChat(sender, receiver, bookingId);
      }
      return chat;
    } catch (error) {
      throw error;
    }
  }

  async saveMessage(chatId: string, message: IMessage): Promise<IChat | null> {
    try {
      const updatedChat = await this.chatRepository.saveMessage(chatId, message);
      if (!updatedChat) {
        throw new Error("Failed to save message");
      }
      return updatedChat;  
    } catch (error) {
        throw error;
      }    
  }

  async getChatByBookingId(bookingId: string): Promise<IChat | null> {
    try {
      return await this.chatRepository.getChatByBookingId(bookingId);
    } catch (error) {
      throw error;
    }
  }

  async getChatsByUser(userId: string): Promise<IChat[]> {
    return this.chatRepository.getChatsByUserId(userId);
  }

  async getChatsByManager(managerId: string): Promise<IChat[]> {
    return this.chatRepository.getChatsByManagerId(managerId);
  }
}

export default ChatService;


// class ChatService {
//   async getOrCreateChat(bookingId: string, managerId: string, userId: string): Promise<IChat> {
//     let chat = await chatModel.findOne({ bookingId });
//     if (!chat) {
//       chat = new chatModel({ bookingId, managerId, userId, messages: [] });
//       await chat.save();
//     }
//     return chat;
//   }

//   async addMessage(chatId: string, message: IMessage): Promise<IChat> {
//     const chat = await chatModel.findById(chatId);
//     if (!chat) {
//       throw new Error('Chat not found');
//     }
//     chat.messages.push(message);
//     await chat.save();
//     return chat;
//   }

//   async getChatsByUser(userId: string): Promise<IChat[]> {
//     return chatModel.find({ userId });
//   }

//   async getChatsByManager(managerId: string): Promise<IChat[]> {
//     return chatModel.find({ managerId });
//   }
// }
// export default ChatService

