import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import chatModel from '../Model/chatModel';
import ChatRepository from '../Repository/chatRepository';
import ChatService from '../Services/chatService';

const chatRepository = new ChatRepository(chatModel)
const chatService = new ChatService(chatRepository)

let io: SocketServer;
let onlineUser : { [key: string]: string } = {}

const configSocketIO = (server: HttpServer) => {
    io = new SocketServer(server, {
        cors: {
            origin: ["http://localhost:5173"],
            methods: ["GET","POST"]
        }
    })

    io.on("connection",(socket)=>{
        console.log(`User Connected: ${socket.id}`);

        socket.on('join chat', async ({ managerId, userId, bookingId }) => {
          if (!managerId || !userId || !bookingId) {
            console.error("Missing required data: managerId, userId, or bookingId");
            return;
          }
            const chat = await chatService.getOrCreateChat( managerId, userId , bookingId);
            if (chat && chat._id) {
              socket.join(chat._id.toString());
            } else {
              console.error("Chat creation or retrieval failed");
            }          
          });
        
          socket.on('send message', async ({ chatId, message }) => {
            try {
              const updatedChat = await chatService.saveMessage(chatId, message);
              if (updatedChat) {
                io.to(chatId).emit('new message', message);
                console.log(`Message sent to chat ${chatId}`);
              }
            } catch (error) {
              console.error("Error sending message:", error);
            }
          });
        
          socket.on('disconnect', () => {
            console.log('A user disconnected');
          });
    })
}

export { configSocketIO, io };

