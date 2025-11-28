const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Store connected users (in-memory)
// Map: socket.id -> { username, room }
const connectedUsers = new Map();

// Store messages per room (in-memory history)
// Map: room -> Array of messages (max 100 messages per room)
const roomMessages = new Map();

// Store users per room
// Map: room -> Set of usernames
const roomUsers = new Map();

// Default rooms
const DEFAULT_ROOM = 'general';
const ROOMS = ['general', 'random', 'tech', 'gaming'];

// Initialize default rooms
ROOMS.forEach(room => {
  roomMessages.set(room, []);
  roomUsers.set(room, new Set());
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get available rooms
app.get('/rooms', (req, res) => {
  res.json({ rooms: ROOMS });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle join event
  socket.on('join', (data) => {
    try {
      const { username, room = DEFAULT_ROOM } = data;

      // Validate username
      if (!username || typeof username !== 'string' || username.trim().length === 0) {
        socket.emit('error', {
          type: 'error',
          message: 'Username is required'
        });
        return;
      }

      const trimmedUsername = username.trim();
      const trimmedRoom = room.trim().toLowerCase();

      // Validate room
      if (!ROOMS.includes(trimmedRoom)) {
        socket.emit('error', {
          type: 'error',
          message: `Invalid room. Available rooms: ${ROOMS.join(', ')}`
        });
        return;
      }

      // Leave previous room if user was in one (before checking username uniqueness)
      if (socket.room) {
        const prevRoom = socket.room;
        roomUsers.get(prevRoom)?.delete(socket.username);
        socket.leave(prevRoom);
        
        // Notify previous room
        io.to(prevRoom).emit('system', {
          type: 'system',
          text: `${socket.username} left the chat`,
          timestamp: new Date().toISOString(),
          room: prevRoom
        });

        // Send updated user list to previous room
        const prevRoomUsers = Array.from(roomUsers.get(prevRoom) || []);
        io.to(prevRoom).emit('users', {
          type: 'users',
          users: prevRoomUsers,
          room: prevRoom
        });
      }

      // Check if username is already taken (excluding current user if they're switching rooms)
      const existingUser = Array.from(connectedUsers.entries()).find(
        ([id, user]) => user.username === trimmedUsername && id !== socket.id
      );
      
      if (existingUser) {
        socket.emit('error', {
          type: 'error',
          message: 'Username is already taken'
        });
        return;
      }

      // Join new room
      socket.join(trimmedRoom);
      socket.username = trimmedUsername;
      socket.room = trimmedRoom;
      
      // Store user
      connectedUsers.set(socket.id, { username: trimmedUsername, room: trimmedRoom });
      roomUsers.get(trimmedRoom)?.add(trimmedUsername);

      console.log(`User ${trimmedUsername} joined room ${trimmedRoom} (socket: ${socket.id})`);

      // Send message history to the new user
      const history = roomMessages.get(trimmedRoom) || [];
      socket.emit('history', {
        type: 'history',
        messages: history,
        room: trimmedRoom
      });

      // Send current users list to the new user
      const roomUsersList = Array.from(roomUsers.get(trimmedRoom) || []);
      socket.emit('users', {
        type: 'users',
        users: roomUsersList,
        room: trimmedRoom
      });

      // Notify all clients in the room
      io.to(trimmedRoom).emit('system', {
        type: 'system',
        text: `${trimmedUsername} joined the chat`,
        timestamp: new Date().toISOString(),
        room: trimmedRoom
      });

      // Send updated user list to all users in the room
      io.to(trimmedRoom).emit('users', {
        type: 'users',
        users: roomUsersList,
        room: trimmedRoom
      });
    } catch (error) {
      console.error('Error handling join:', error);
      socket.emit('error', {
        type: 'error',
        message: 'Failed to join chat'
      });
    }
  });

  // Handle message event
  socket.on('message', (data) => {
    try {
      const { text } = data;
      const userData = connectedUsers.get(socket.id);

      // Validate message
      if (!userData || !socket.room) {
        socket.emit('error', {
          type: 'error',
          message: 'You must join a room first'
        });
        return;
      }

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        socket.emit('error', {
          type: 'error',
          message: 'Message text is required'
        });
        return;
      }

      const trimmedText = text.trim();
      const message = {
        type: 'message',
        username: userData.username,
        text: trimmedText,
        timestamp: new Date().toISOString(),
        room: socket.room
      };

      // Store message in room history (max 100 messages per room)
      const history = roomMessages.get(socket.room) || [];
      history.push(message);
      if (history.length > 100) {
        history.shift(); // Remove oldest message
      }
      roomMessages.set(socket.room, history);

      // Broadcast message to all clients in the room
      io.to(socket.room).emit('message', message);

      console.log(`Message from ${userData.username} in ${socket.room}: ${trimmedText}`);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', {
        type: 'error',
        message: 'Failed to send message'
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const userData = connectedUsers.get(socket.id);
    
    if (userData && socket.room) {
      const { username, room } = userData;
      connectedUsers.delete(socket.id);
      roomUsers.get(room)?.delete(username);
      
      console.log(`User ${username} disconnected from room ${room} (socket: ${socket.id})`);

      // Notify all remaining clients in the room
      io.to(room).emit('system', {
        type: 'system',
        text: `${username} left the chat`,
        timestamp: new Date().toISOString(),
        room: room
      });

      // Send updated user list to all users in the room
      const roomUsersList = Array.from(roomUsers.get(room) || []);
      io.to(room).emit('users', {
        type: 'users',
        users: roomUsersList,
        room: room
      });
    } else {
      console.log('Client disconnected:', socket.id);
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

