/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const http = require("http");
const path = require("path");
const app = express();
const server = http.createServer(app);
const cors = require("cors");

// Apply CORS middleware to Express
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const io = require("socket.io")(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : "*",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["my-custom-header"],
  },
});

// Add a simple route to verify the server is running
app.get("/", (req, res) => {
  res.send("Video call server is running");
});

// Store rooms and users
const rooms = {};
// Store user to room mapping for quick lookup
const userRooms = {};
// Store user ID to socket ID mapping
const userSocketMap = {};
// Store partner connections
const partnerConnections = {};

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);
  socket.emit("me", socket.id);

  // Log all active connections
  console.log("Active connections:", Object.keys(io.sockets.sockets).length);
  console.log("User socket map:", userSocketMap);

  // Handle room joining
  socket.on("joinRoom", (data) => {
    const { roomId, userId, socketId } = data;
    console.log(`User ${userId} (${socketId}) joining room ${roomId}`);

    // Store the user's room for quick lookup
    userRooms[socket.id] = roomId;

    // Join the socket.io room
    socket.join(roomId);

    // Initialize room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    // Remove any existing entries for this user (in case of reconnect)
    rooms[roomId] = rooms[roomId].filter((user) => user.userId !== userId);

    // Add user to room
    rooms[roomId].push({ userId, socketId: socket.id });

    console.log(`Room ${roomId} now has users:`, rooms[roomId]);

    // Notify all users in the room about the updated user list
    io.to(roomId).emit("usersInRoom", rooms[roomId]);
  });

  // Handle request for users in a room
  socket.on("getUsersInRoom", (data) => {
    const { roomId } = data;
    console.log(`Getting users in room ${roomId}`);

    if (rooms[roomId]) {
      socket.emit("usersInRoom", rooms[roomId]);
    } else {
      socket.emit("usersInRoom", []);
    }
  });

  // Handle user authentication
  socket.on("authenticate", (data) => {
    const { userId, userEmail } = data;
    console.log(
      `User ${userId} (${userEmail}) authenticated with socket ${socket.id}`
    );

    // Store the user ID to socket ID mapping
    userSocketMap[userId] = socket.id;

    // Broadcast to all clients that this user is online
    socket.broadcast.emit("userOnline", { userId, socketId: socket.id });

    // Log all authenticated users
    console.log("Authenticated users:", userSocketMap);

    // Check if this user has any partner connections
    for (const [connectionId, connection] of Object.entries(
      partnerConnections
    )) {
      if (connection.userId === userId || connection.partnerId === userId) {
        const partnerId =
          connection.userId === userId
            ? connection.partnerId
            : connection.userId;
        const partnerSocketId = userSocketMap[partnerId];

        if (partnerSocketId) {
          console.log(
            `Found partner ${partnerId} with socket ID ${partnerSocketId}`
          );

          // Send the partner's socket ID to this user
          socket.emit("partnerFound", {
            partnerId,
            partnerSocketId,
          });

          // Send this user's socket ID to the partner
          io.to(partnerSocketId).emit("partnerFound", {
            partnerId: userId,
            partnerSocketId: socket.id,
          });
        }
      }
    }
  });

  // Handle direct partner connection
  socket.on("connectToPartner", (data) => {
    const { userId, partnerId, roomId } = data;
    console.log(
      `User ${userId} connecting to partner ${partnerId} in room ${roomId}`
    );

    // Store the connection info
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    // Store the partner connection
    partnerConnections[roomId] = { userId, partnerId, roomId };

    // Add this user to the room
    const existingUser = rooms[roomId].find((user) => user.userId === userId);
    if (!existingUser) {
      rooms[roomId].push({ userId, socketId: socket.id });
    } else {
      existingUser.socketId = socket.id;
    }

    // Update the user socket map
    userSocketMap[userId] = socket.id;

    // Find the partner's socket ID directly from the map
    const partnerSocketId = userSocketMap[partnerId];

    if (partnerSocketId) {
      console.log(
        `Found partner ${partnerId} with socket ID ${partnerSocketId}`
      );

      // Send the partner's socket ID to this user
      socket.emit("partnerFound", {
        partnerId,
        partnerSocketId,
      });

      // Send this user's socket ID to the partner
      io.to(partnerSocketId).emit("partnerFound", {
        partnerId: userId,
        partnerSocketId: socket.id,
      });
    } else {
      console.log(`Partner ${partnerId} not found in socket map`);
      socket.emit("partnerNotFound", { partnerId });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Find the user ID from the socket ID
    let disconnectedUserId = null;
    for (const [userId, socketId] of Object.entries(userSocketMap)) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }

    if (disconnectedUserId) {
      console.log(`User ${disconnectedUserId} disconnected`);

      // Remove from user socket map
      delete userSocketMap[disconnectedUserId];

      // Notify all clients that this user is offline
      socket.broadcast.emit("userOffline", {
        userId: disconnectedUserId,
        socketId: socket.id,
      });

      // Find any partner connections for this user
      for (const [roomId, connection] of Object.entries(partnerConnections)) {
        if (
          connection.userId === disconnectedUserId ||
          connection.partnerId === disconnectedUserId
        ) {
          const partnerId =
            connection.userId === disconnectedUserId
              ? connection.partnerId
              : connection.userId;
          const partnerSocketId = userSocketMap[partnerId];

          if (partnerSocketId) {
            console.log(
              `Notifying partner ${partnerId} that user ${disconnectedUserId} disconnected`
            );
            io.to(partnerSocketId).emit("partnerDisconnected", {
              partnerId: disconnectedUserId,
              socketId: socket.id,
            });
          }
        }
      }
    }

    // Get the room this user was in
    const roomId = userRooms[socket.id];
    if (roomId && rooms[roomId]) {
      // Find the user in the room
      const userIndex = rooms[roomId].findIndex(
        (user) => user.socketId === socket.id
      );

      if (userIndex !== -1) {
        const userId = rooms[roomId][userIndex].userId;
        console.log(`Removing user ${userId} from room ${roomId}`);

        // Remove the user from the room
        rooms[roomId].splice(userIndex, 1);

        // Notify remaining users
        io.to(roomId).emit("usersInRoom", rooms[roomId]);
      }

      // Clean up empty rooms
      if (rooms[roomId].length === 0) {
        console.log(`Room ${roomId} is now empty, removing it`);
        delete rooms[roomId];
      }
    }

    // Clean up user room mapping
    delete userRooms[socket.id];

    // Log remaining connections
    console.log(
      "Remaining connections:",
      Object.keys(io.sockets.sockets).length
    );
    console.log("Remaining authenticated users:", userSocketMap);

    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", (data) => {
    console.log("Call user:", data.userToCall, "from:", data.from);
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    console.log("Answer call to:", data.to);
    io.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("rejectCall", (data) => {
    console.log("Reject call to:", data.to);
    io.to(data.to).emit("callRejected");
  });

  socket.on("callEnded", (data) => {
    console.log("Call ended notification to:", data.to);
    io.to(data.to).emit("callEnded");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
