const userService = require('../services/userService');
const roomService = require('../services/roomService');
const messageService = require('../services/messageService');
const broadcastService = require('../services/broadcastService');
const userStore = require('../models/UserStore');
const { GLOBAL_ROOM, DEFAULT_ROOM } = require('../config/constants');

const handleJoin = (socket, io, data) => {
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
    const validatedRoom = roomService.validateRoom(room);

    // Validate room
    if (!validatedRoom) {
      socket.emit('error', {
        type: 'error',
        message: `Invalid room. Available rooms: ${roomService.getAllRooms().join(', ')}`
      });
      return;
    }

    // Check if this is a first-time join before handling room switch
    const isFirstJoin = userService.isFirstJoin(trimmedUsername);
    
    // Handle leaving previous room if user was in one
    if (socket.room) {
      const prevRoom = socket.room;
      socket.leave(prevRoom);

      // Update user store for room change
      userStore.updateSocketRoom(socket, validatedRoom);
      
      // Update socket properties for room switch
      socket.username = trimmedUsername;
      socket.room = validatedRoom;
      
      // Update global user status (in case username changed)
      userStore.updateGlobalUserStatus(trimmedUsername, 'connected');
    } else {
      // First time joining - use handleUserJoin
      userService.handleUserJoin(socket, trimmedUsername, validatedRoom);
    }

    // Join new room
    socket.join(validatedRoom);
    // Also join global room to receive join/leave messages
    if (validatedRoom !== GLOBAL_ROOM) {
      socket.join(GLOBAL_ROOM);
    }

    console.log(`User ${trimmedUsername} joined room ${validatedRoom} (socket: ${socket.id})`);

    // Send message history to the new user
    const history = messageService.getMessageHistory(validatedRoom);
    socket.emit('history', {
      type: 'history',
      messages: history,
      room: validatedRoom
    });

    // Broadcast global user list with status to all clients
    broadcastService.broadcastAllUsers(io);

    // Only send join message to global room on first join (not when switching rooms)
    if (isFirstJoin) {
      const globalJoinMessage = messageService.createSystemMessage(
        trimmedUsername,
        `System: ${trimmedUsername} joined the chat`,
        GLOBAL_ROOM
      );
      io.to(GLOBAL_ROOM).emit('system', globalJoinMessage);
      messageService.saveMessage(GLOBAL_ROOM, globalJoinMessage);
    }
  } catch (error) {
    console.error('Error handling join:', error);
    socket.emit('error', {
      type: 'error',
      message: 'Failed to join chat'
    });
  }
};

module.exports = {
  handleJoin
};

