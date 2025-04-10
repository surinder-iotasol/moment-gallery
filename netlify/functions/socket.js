const { Server } = require('socket.io');

exports.handler = async (event, context) => {
  const io = new Server({
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-connected', userId);
    });

    socket.on('offer', (roomId, offer, userId) => {
      socket.to(roomId).emit('offer', offer, userId);
    });

    socket.on('answer', (roomId, answer, userId) => {
      socket.to(roomId).emit('answer', answer, userId);
    });

    socket.on('ice-candidate', (roomId, candidate, userId) => {
      socket.to(roomId).emit('ice-candidate', candidate, userId);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: JSON.stringify({ message: 'Socket server running' })
  };
};