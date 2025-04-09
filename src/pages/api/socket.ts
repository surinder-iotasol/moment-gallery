import { NextApiRequest, NextApiResponse } from 'next';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export const config = {
  api: {
    bodyParser: false,
  },
};

let io: SocketIOServer | null = null;

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (!io) {
    console.log('Initializing Socket.IO server in pages/api...');

    const httpServer: NetServer = (res.socket as any).server;
    io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);

      socket.on('join-room', (roomId: string, userId: string) => {
        console.log(`User ${userId} joined room ${roomId}`);
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
      });

      socket.on('offer', (roomId: string, offer: any, userId: string) => {
        socket.to(roomId).emit('offer', offer, userId);
      });

      socket.on('answer', (roomId: string, answer: any, userId: string) => {
        socket.to(roomId).emit('answer', answer, userId);
      });

      socket.on('ice-candidate', (roomId: string, candidate: any, userId: string) => {
        socket.to(roomId).emit('ice-candidate', candidate, userId);
      });

      socket.on('end-call', (roomId: string, userId: string) => {
        socket.to(roomId).emit('call-ended', userId);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }

  res.end();
};

export default SocketHandler;