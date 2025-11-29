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

// Store all users globally with their connection status
// Map: username -> { status: 'connected' | 'disconnected', lastSeen: timestamp }
const allUsers = new Map();

// Track recent disconnects to detect reloads (suppress leave/join messages)
// Map: username -> timestamp of last disconnect
const recentDisconnects = new Map();
const RECONNECT_WINDOW = 5000; // 5 seconds - if user reconnects within this time, treat as reload

// Default rooms
const DEFAULT_ROOM = 'general';
const GLOBAL_ROOM = 'global';
const ROOMS = ['global', 'general', 'random', 'tech', 'gaming'];

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

// Get all users with their status
app.get('/users', (req, res) => {
  const usersList = Array.from(allUsers.entries()).map(([username, data]) => ({
    username,
    status: data.status,
    lastSeen: data.lastSeen
  }));
  res.json({ users: usersList });
});

// Helper function to broadcast global user list to all clients
const broadcastAllUsers = () => {
  const globalUsersList = Array.from(allUsers.entries()).map(([username, data]) => ({
    username,
    status: data.status
  }));
  io.emit('allUsers', {
    type: 'allUsers',
    users: globalUsersList
  });
};

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

      // Check if this is a first-time join (before we update socket.room)
      // Leave messages only appear on disconnect/logout, not when switching rooms
      // A user is joining for the first time if their username is not in any room's user list
      // Also check if this is a quick reconnect (reload) - if so, don't send join message
      const usernameInAnyRoom = Array.from(roomUsers.values()).some(users => users.has(trimmedUsername));
      const recentDisconnectTime = recentDisconnects.get(trimmedUsername);
      const isQuickReconnect = recentDisconnectTime && (Date.now() - recentDisconnectTime) < RECONNECT_WINDOW;
      const isFirstJoin = !usernameInAnyRoom && !isQuickReconnect;
      
      // Clear the recent disconnect entry if user is reconnecting
      if (isQuickReconnect) {
        recentDisconnects.delete(trimmedUsername);
      }
      
      // Leave previous room if user was in one (before checking username uniqueness)
      // Don't send "left" message when switching rooms - only on disconnect
      if (socket.room) {
        const prevRoom = socket.room;
        const prevUsername = socket.username;
        socket.leave(prevRoom);

        // Check if there are other sessions with the same username in the previous room
        const otherSessionsInPrevRoom = Array.from(connectedUsers.entries()).filter(
          ([id, user]) => user.username === prevUsername && user.room === prevRoom && id !== socket.id
        );
        
        // Only remove from roomUsers if this was the last session of this username in that room
        if (otherSessionsInPrevRoom.length === 0 && prevUsername) {
          roomUsers.get(prevRoom)?.delete(prevUsername);
        }

        // Send updated user list to previous room
        const prevRoomUsers = Array.from(roomUsers.get(prevRoom) || []);
        io.to(prevRoom).emit('users', {
          type: 'users',
          users: prevRoomUsers,
          room: prevRoom
        });
      }

      // Allow multiple sessions with the same username (like Telegram)
      // No username uniqueness check - users can login from multiple devices

      // Join new room
      socket.join(trimmedRoom);
      // Also join global room to receive join/leave messages
      if (trimmedRoom !== GLOBAL_ROOM) {
        socket.join(GLOBAL_ROOM);
      }
      socket.username = trimmedUsername;
      socket.room = trimmedRoom;
      
      // Store user (allow multiple sessions with same username)
      connectedUsers.set(socket.id, { username: trimmedUsername, room: trimmedRoom });
      // Add username to room users (Set automatically handles duplicates)
      roomUsers.get(trimmedRoom)?.add(trimmedUsername);

      // Update global user list - mark as connected
      if (!allUsers.has(trimmedUsername)) {
        // New user - add to global list
        allUsers.set(trimmedUsername, {
          status: 'connected',
          lastSeen: new Date().toISOString()
        });
      } else {
        // Existing user - update status to connected
        const userData = allUsers.get(trimmedUsername);
        userData.status = 'connected';
        userData.lastSeen = new Date().toISOString();
      }

      console.log(`User ${trimmedUsername} joined room ${trimmedRoom} (socket: ${socket.id})`);

      // Send message history to the new user
      const history = roomMessages.get(trimmedRoom) || [];
      socket.emit('history', {
        type: 'history',
        messages: history,
        room: trimmedRoom
      });

      // Send current users list to the new user (room-specific)
      const roomUsersList = Array.from(roomUsers.get(trimmedRoom) || []);
      socket.emit('users', {
        type: 'users',
        users: roomUsersList,
        room: trimmedRoom
      });

      // Send global user list with status to all clients
      broadcastAllUsers();

      // Only send join message to global room on first join (not when switching rooms)
      // Join/leave messages are only shown in global room
      // Leave messages only appear on disconnect/logout
      if (isFirstJoin) {
        const globalJoinMessage = {
          type: 'system',
          text: `System: ${trimmedUsername} joined the chat`,
          timestamp: new Date().toISOString(),
          room: GLOBAL_ROOM,
          username: trimmedUsername
        };
        io.to(GLOBAL_ROOM).emit('system', globalJoinMessage);
        
        // Store system message in global room history
        const globalHistory = roomMessages.get(GLOBAL_ROOM) || [];
        globalHistory.push(globalJoinMessage);
        if (globalHistory.length > 100) {
          globalHistory.shift();
        }
        roomMessages.set(GLOBAL_ROOM, globalHistory);
      }

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
      
      // Check if there are other sessions with the same username in this room
      const otherSessionsInRoom = Array.from(connectedUsers.values()).filter(
        user => user.username === username && user.room === room
      );
      
      // Only remove from roomUsers if this was the last session of this username in this room
      if (otherSessionsInRoom.length === 0) {
        roomUsers.get(room)?.delete(username);
      }
      
      console.log(`User ${username} disconnected from room ${room} (socket: ${socket.id})`);

      // Only send leave message if this was the last session of this username
      // Check across all rooms to see if user has any other active sessions
      const otherSessionsAnywhere = Array.from(connectedUsers.values()).filter(
        user => user.username === username
      );
      
      if (otherSessionsAnywhere.length === 0) {
        // This was the last session - user has completely left
        // Update global user list - mark as disconnected
        if (allUsers.has(username)) {
          const userData = allUsers.get(username);
          userData.status = 'disconnected';
          userData.lastSeen = new Date().toISOString();
        }
        
        // Track the disconnect time to detect quick reconnects (reloads)
        recentDisconnects.set(username, Date.now());
        
        // Use a delayed leave message to allow for quick reconnects
        // If user reconnects within RECONNECT_WINDOW, the join handler will clear this
        setTimeout(() => {
          // Check if user has reconnected (if so, don't send leave message)
          const hasReconnected = Array.from(roomUsers.values()).some(users => users.has(username));
          const stillRecentDisconnect = recentDisconnects.get(username);
          
          if (!hasReconnected && stillRecentDisconnect) {
            // User hasn't reconnected - send leave message
            const globalLeaveMessage = {
              type: 'system',
              text: `System: ${username} left the chat`,
              timestamp: new Date().toISOString(),
              room: GLOBAL_ROOM,
              username: username
            };
            io.to(GLOBAL_ROOM).emit('system', globalLeaveMessage);
            
            // Store system message in global room history
            const globalHistory = roomMessages.get(GLOBAL_ROOM) || [];
            globalHistory.push(globalLeaveMessage);
            if (globalHistory.length > 100) {
              globalHistory.shift();
            }
            roomMessages.set(GLOBAL_ROOM, globalHistory);
            
            // Clean up the recent disconnect entry
            recentDisconnects.delete(username);
            
            // Send updated global user list to all clients
            broadcastAllUsers();
          }
        }, RECONNECT_WINDOW);
      }

      // Note: Room-specific leave messages are now handled in the delayed timeout above
      // This prevents showing leave messages on reload

      // Send updated user list to all users in the room
      const roomUsersList = Array.from(roomUsers.get(room) || []);
      io.to(room).emit('users', {
        type: 'users',
        users: roomUsersList,
        room: room
      });
      
      // Send updated global user list to all clients
      broadcastAllUsers();
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

