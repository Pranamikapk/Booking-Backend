import { Request, Response } from "express";
import { io } from "../Config/socket_config";
import HTTP_statusCode from "../Enums/httpStatusCodes";
import { IMessage } from "../Interfaces/common.interface";
import ChatService from "../Services/chatService";

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
          message: "Sender ID, Receiver ID, and Booking ID are required.",
        });
        return;
      }
      console.log("req.body:", req.body);

      const message: IMessage = {
        content,
        sender: senderId,
        timestamp: new Date(),
      };
      console.log("Message to be sent:", message);

      const chat = await this.chatService.getOrCreateChat(
        senderId,
        receiver._id,
        bookingId
      );
      if (!chat || !chat._id) {
        res.status(HTTP_statusCode.InternalServerError).json({
          message: "Chat creation or retrieval failed.",
        });
        return;
      }
      const savedChat = await this.chatService.saveMessage(
        chat._id.toString(),
        message
      );
      if (!savedChat) {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json({ message: "Failed to save message." });
        return;
      }

      io.to(chat._id.toString()).emit("new message", {
        ...message,
        chatId: chat._id,
      });
      console.log("Emitting new message to chat:", chat._id.toString());
      console.log("Emitting new message to receiver:", `user-${receiver}`);

      io.to(`user-${receiver}`).emit("new message", {
        ...message,
        chatId: chat._id,
      });
      io.to(`manager-${senderId}`).emit("new message", {
        ...message,
        chatId: chat._id,
      });
      res.status(HTTP_statusCode.OK).json({
        chatId: chat._id,
        message: "Message sent successfully.",
        chat: savedChat,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      res
        .status(HTTP_statusCode.InternalServerError)
        .json({ message: "Error sending message" });
    }
  };

  getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bookingId } = req.params;
      const userId = req.user_id;

      if (!userId) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json({ message: "User ID is required" });
        return;
      }

      const messages = await this.chatService.getChatByBookingId(bookingId);
      res.status(HTTP_statusCode.OK).json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res
        .status(HTTP_statusCode.InternalServerError)
        .json({ message: "Error fetching messages" });
    }
  };

  getChatRooms = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user_id;
      if (!userId) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json({ message: "User ID is required" });
        return;
      }

      const chatRooms = await this.chatService.getChatByBookingId(userId);
      res.status(HTTP_statusCode.OK).json(chatRooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      res
        .status(HTTP_statusCode.InternalServerError)
        .json({ message: "Error fetching chat rooms" });
    }
  };
}
