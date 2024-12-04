import { Request, Response } from 'express';
import HTTP_statusCode from '../Enums/httpStatusCodes';
import { IMessage } from '../Interfaces/common.interface';
import ChatService from '../Services/chatService';

export class ChatController {
  private chatService: ChatService;

  constructor(chatService: ChatService) {
    this.chatService = chatService;
  }

  sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { content, receiver, bookingId } = req.body;
      const senderId = req.user_id;  

      if (!senderId || !receiver || !bookingId) {
         res.status(HTTP_statusCode.BadRequest).json({
          message: 'Sender ID, Receiver ID, and Booking ID are required.',
        });
        return
      }

      const message  : IMessage = {
        content , 
        sender: senderId,
        timestamp: new Date()
      }

      const chat = await this.chatService.getOrCreateChat(senderId, receiver, bookingId);
      const savedChat = await this.chatService.saveMessage(chat._id.toString(), message);

      res.status(HTTP_statusCode.OK).json(savedChat);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: 'Error sending message' });
    }
  };

  getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bookingId } = req.params;
      const userId = req.user_id;

      if (!userId) {
        res.status(HTTP_statusCode.BadRequest).json({ message: 'User ID is required' });
        return;
      }

      const messages = await this.chatService.getChatByBookingId(bookingId);
      res.status(HTTP_statusCode.OK).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: 'Error fetching messages' });
    }
  };

  getChatRooms = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user_id;
      if (!userId) {
        res.status(HTTP_statusCode.BadRequest).json({ message: 'User ID is required' });
        return;
      }

      const chatRooms = await this.chatService.getChatByBookingId(userId);
      res.status(HTTP_statusCode.OK).json(chatRooms);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: 'Error fetching chat rooms' });
    }
  };
}


// import { Request, Response } from 'express';
// import ChatService from '../Services/chatService';

// const chatService = new ChatService();

// export class ChatController {
//   async getOrCreateChat(req: Request, res: Response) {
//     try {
//       const { bookingId, managerId, userId } = req.body;
//       const chat = await chatService.getOrCreateChat(bookingId, managerId, userId);
//       res.json(chat);
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to get or create chat' });
//     }
//   }

//   async addMessage(req: Request, res: Response) {
//     try {
//       const { chatId, message } = req.body;
//       const updatedChat = await chatService.addMessage(chatId, message);
//       res.json(updatedChat);
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to add message' });
//     }
//   }

//   async getChatsByUser(req: Request, res: Response) {
//     try {
//       const { userId } = req.params;
//       const chats = await chatService.getChatsByUser(userId);
//       res.json(chats);
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to get chats' });
//     }
//   }

//   async getChatsByManager(req: Request, res: Response) {
//     try {
//       const { managerId } = req.params;
//       const chats = await chatService.getChatsByManager(managerId);
//       res.json(chats);
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to get chats' });
//     }
//   }
// }

