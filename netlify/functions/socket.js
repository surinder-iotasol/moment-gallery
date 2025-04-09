const { Server } = require('socket.io');

exports.handler = async (event, context) => {
  // Only handle WebSocket connections
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const io = new Server({
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Socket.IO event handlers
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a room
    socket.on('join-room', (roomId, userId) => {
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
    socket.on('offer', (roomId, offer, userId) => {
      console.log(`Offer from ${userId} in room ${roomId}`);
      // Broadcast the offer to all other clients in the room
      socket.to(roomId).emit('offer', offer, userId);
    });

    socket.on('answer', (roomId, answer, userId) => {
      console.log(`Answer from ${userId} in room ${roomId}`);
      // Broadcast the answer to all other clients in the room
      socket.to(roomId).emit('answer', answer, userId);
    });

    socket.on('ice-candidate', (roomId, candidate, userId) => {
      console.log(`ICE candidate from ${userId} in room ${roomId}`);
      // Broadcast the ICE candidate to all other clients in the room
      socket.to(roomId).emit('ice-candidate', candidate, userId);
    });

    // Handle call end
    socket.on('end-call', (roomId, userId) => {
      console.log(`User ${userId} ended call in room ${roomId}`);
      socket.to(roomId).emit('call-ended', userId);
    });
  });

  // Return a 200 response to keep the connection alive
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: 'Socket.IO server running' }),
  };
};
