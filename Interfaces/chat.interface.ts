import { IChat, IMessage } from "./common.interface";

export interface IChatRepository {
    getChat(managerId: string, userId: string, hotelId: string): Promise<IChat | null> 
    createChat(managerId: string, userId: string, hotelId: string ): Promise<IChat> 
    saveMessage(chatId: string, message: IMessage): Promise<IChat | null> 
    getChatByBookingId(bookingId: string): Promise<IChat | null> 
    getChatsByManagerId(managerId: string): Promise<IChat[]> 
    getChatsByUserId(userId: string): Promise<IChat[]>

  }

export interface IChatService {
    getOrCreateChat(managerId: string, userId: string, hotelId: string): Promise<IChat> 
    saveMessage(chatId: string, message: IMessage): Promise<IChat | null> 
    getChatByBookingId(bookingId: string): Promise<IChat | null> 
    }
  