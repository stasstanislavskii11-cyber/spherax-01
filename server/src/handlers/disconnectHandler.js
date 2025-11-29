const userService = require('../services/userService');
const messageService = require('../services/messageService');
const broadcastService = require('../services/broadcastService');
const userStore = require('../models/UserStore');
const { GLOBAL_ROOM, RECONNECT_WINDOW } = require('../config/constants');

const handleDisconnect = (socket, io) => {
  const { userData, hasOtherSessions } = userService.handleUserDisconnect(socket);
  
  if (userData) {
    const { username, room } = userData;
    
    console.log(`User ${username} disconnected from room ${room} (socket: ${socket.id})`);

    // Only send leave message if this was the last session of this username
    if (!hasOtherSessions) {
      // Use a delayed leave message to allow for quick reconnects
      setTimeout(() => {
        // Check if user has reconnected (if so, don't send leave message)
        const hasReconnected = userStore.hasUserInAnyRoom(username);
        const stillRecentDisconnect = userStore.getRecentDisconnect(username);
        
        if (!hasReconnected && stillRecentDisconnect) {
          // User hasn't reconnected - send leave message
          const globalLeaveMessage = messageService.createSystemMessage(
            username,
            `System: ${username} left the chat`,
            GLOBAL_ROOM
          );
          io.to(GLOBAL_ROOM).emit('system', globalLeaveMessage);
          messageService.saveMessage(GLOBAL_ROOM, globalLeaveMessage);
          
          // Clean up the recent disconnect entry
          userStore.clearRecentDisconnect(username);
          
          // Send updated global user list to all clients
          broadcastService.broadcastAllUsers(io);
        }
      }, RECONNECT_WINDOW);
    }

    // Send updated user list to all users in the room
    const roomUsersList = userStore.getRoomUsers(room);
    io.to(room).emit('users', {
      type: 'users',
      users: roomUsersList,
      room: room
    });
    
    // Send updated global user list to all clients
    broadcastService.broadcastAllUsers(io);
  } else {
    console.log('Client disconnected:', socket.id);
  }
};

module.exports = {
  handleDisconnect
};

