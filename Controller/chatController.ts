import { Request, Response } from 'express';
import { IChatService } from '../Interfaces/chat.interface';

export class ChatController {
  private chatService: IChatService;

  constructor(chatService: IChatService) {
    this.chatService = chatService;
  }

  sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { content, receiver, bookingId } = req.body;
      const senderId = req.user_id;

      if (!senderId) {
         res.status(400).json({ message: 'Sender ID is required' });
         return
      }

      const message = await this.chatService.sendMessage({
        sender: senderId,
        receiver,
        content,
        bookingId
      });

      res.status(200).json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Error sending message' });
    }
  };

  getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bookingId } = req.params;
      const userId = req.user_id;
    

    if (!userId) {
         res.status(400).json({ message: 'User ID is required' });
         return
      }

      const messages = await this.chatService.getMessages(bookingId, userId);
      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Error fetching messages' });
    }
  };

  getChatRooms = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user_id;
      if (!userId) {
        res.status(400).json({ message: 'User ID is required' });
        return
     }
      const chatRooms = await this.chatService.getChatRooms(userId);
      res.status(200).json(chatRooms);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      res.status(500).json({ message: 'Error fetching chat rooms' });
    }
  };
}

