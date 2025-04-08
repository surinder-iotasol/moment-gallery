import { NextApiRequest, NextApiResponse } from 'next';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Socket.IO server
const ioHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (!(res.socket as any).server.io) {
    console.log('Initializing Socket.IO server...');
    
    const httpServer: NetServer = (res.socket as any).server;
    const io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
    });
    
    (res.socket as any).server.io = io;
  }
  
  res.end();
};

export default ioHandler;
