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
    });

    // Socket.IO event handlers
    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);

      // Join a room
      socket.on('join-room', (roomId: string, userId: string) => {
        console.log(`User ${userId} joined room ${roomId}`);
        socket.join(roomId);

        // Notify other users in the room that a new user has joined
        socket.to(roomId).emit('user-connected', userId);

        // Handle disconnection
        socket.on('disconnect', () => {
          console.log(`User ${userId} disconnected from room ${roomId}`);
          socket.to(roomId).emit('user-disconnected', userId);
        });
      });

      // Handle WebRTC signaling
      socket.on('offer', (roomId: string, offer: any, userId: string) => {
        console.log(`Offer from ${userId} in room ${roomId}`);
        // Broadcast the offer to all other clients in the room
        socket.to(roomId).emit('offer', offer, userId);
      });

      socket.on('answer', (roomId: string, answer: any, userId: string) => {
        console.log(`Answer from ${userId} in room ${roomId}`);
        // Broadcast the answer to all other clients in the room
        socket.to(roomId).emit('answer', answer, userId);
      });

      socket.on('ice-candidate', (roomId: string, candidate: any, userId: string) => {
        console.log(`ICE candidate from ${userId} in room ${roomId}`);
        // Broadcast the ICE candidate to all other clients in the room
        socket.to(roomId).emit('ice-candidate', candidate, userId);
      });

      // Handle call end
      socket.on('end-call', (roomId: string, userId: string) => {
        console.log(`User ${userId} ended call in room ${roomId}`);
        socket.to(roomId).emit('call-ended', userId);
      });
    });
  }

  res.end();
};

export default SocketHandler;
