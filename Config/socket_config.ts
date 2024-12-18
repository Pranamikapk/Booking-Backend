import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import chatModel from '../Model/chatModel';
import ChatRepository from '../Repository/chatRepository';
import ChatService from '../Services/chatService';

const chatRepository = new ChatRepository(chatModel);
const chatService = new ChatService(chatRepository);

let io: SocketServer;
let onlineUser: { [key: string]: string } = {};

const configSocketIO = (server: HttpServer) => {
  io = new SocketServer(server, {
    cors: {
      origin: ['http://localhost:5173'],
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);
    onlineUser[socket.id] = socket.id; // Track online user

    socket.on('join chat', async ({ managerId, userId, bookingId }) => {
      if (!managerId || !userId || !bookingId) {
        console.error('Missing required data: managerId, userId, or bookingId');
        socket.emit('error', { message: 'Missing required data' });
        return;
      }

      try {
        const chat = await chatService.getOrCreateChat(managerId, userId, bookingId);
        if (chat && chat._id) {
          socket.join(chat._id.toString());
          console.log(`User ${socket.id} joined chat ${chat._id}`);
        } else {
          console.error('Chat creation or retrieval failed');
          socket.emit('error', { message: 'Failed to create or retrieve chat' });
        }
      } catch (error) {
        console.error('Error during chat creation or retrieval:', error);
        socket.emit('error', { message: 'Error during chat creation or retrieval' });
      }
    });

    // Send message
    socket.on('send message', async ({ chatId, message }) => {
      if (!chatId || !message) {
        console.error('Missing required data: chatId or message');
        socket.emit('error', { message: 'Missing required data: chatId or message' });
        return;
      }

      try {
        const updatedChat = await chatService.saveMessage(chatId, message);
        if (updatedChat) {
          io.to(chatId).emit('new message', message); // Emit to all users in the chat room
          console.log(`Message sent to chat ${chatId}`);
        } else {
          console.error('Failed to save message');
          socket.emit('error', { message: 'Failed to save message' });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('A user disconnected');
      delete onlineUser[socket.id]; // Remove the user from the onlineUser object
    });
  });
};

export { configSocketIO, io };
