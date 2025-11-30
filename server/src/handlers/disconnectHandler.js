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
      // Don't broadcast global user list immediately - wait for reconnect window
      // Use a delayed leave message to allow for quick reconnects
      const timeoutId = setTimeout(() => {
        // Check if user has reconnected (if so, don't send leave message)
        const hasReconnected = userStore.hasUserInAnyRoom(username);
        const stillRecentDisconnect = userStore.getRecentDisconnect(username);
        
        if (!hasReconnected && stillRecentDisconnect) {
          // User hasn't reconnected - update status and send leave message
          userStore.updateGlobalUserStatus(username, 'disconnected');
          
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
        
        // Clear the timeout entry
        userStore.clearDisconnectTimeout(username);
      }, RECONNECT_WINDOW);
      
      // Store the timeout ID so we can cancel it if user reconnects
      userStore.setDisconnectTimeout(username, timeoutId);
    } else {
      // User has other sessions - send updated global user list immediately
      broadcastService.broadcastAllUsers(io);
    }
  } else {
    console.log('Client disconnected:', socket.id);
  }
};

module.exports = {
  handleDisconnect
};

