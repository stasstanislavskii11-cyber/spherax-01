const userStore = require('../models/UserStore');
const { RECONNECT_WINDOW } = require('../config/constants');

const isQuickReconnect = (username) => {
  const recentDisconnectTime = userStore.getRecentDisconnect(username);
  return recentDisconnectTime && (Date.now() - recentDisconnectTime) < RECONNECT_WINDOW;
};

const isFirstJoin = (username) => {
  const usernameInAnyRoom = userStore.hasUserInAnyRoom(username);
  const isQuickReconnectUser = isQuickReconnect(username);
  return !usernameInAnyRoom && !isQuickReconnectUser;
};

const handleUserJoin = (socket, username, room) => {
  const isQuickReconnectUser = isQuickReconnect(username);
  
  // Clear the recent disconnect entry if user is reconnecting
  if (isQuickReconnectUser) {
    userStore.clearRecentDisconnect(username);
  }
  
  // Update socket properties
  socket.username = username;
  socket.room = room;
  
  // Add user to stores
  userStore.addConnectedUser(socket.id, username, room);
  
  // Update global user status
  userStore.updateGlobalUserStatus(username, 'connected');
  
  return {
    isFirstJoin: isFirstJoin(username),
    isQuickReconnect: isQuickReconnectUser
  };
};

const handleUserDisconnect = (socket) => {
  const userData = userStore.removeConnectedUser(socket.id);
  
  if (userData) {
    const { username, room } = userData;
    
    // Check if user has other sessions anywhere
    const hasOtherSessions = userStore.hasOtherSessionsAnywhere(username);
    
    if (!hasOtherSessions) {
      // This was the last session - user has completely left
      userStore.updateGlobalUserStatus(username, 'disconnected');
      userStore.setRecentDisconnect(username, Date.now());
    }
    
    return { userData, hasOtherSessions };
  }
  
  return { userData: null, hasOtherSessions: false };
};

module.exports = {
  isQuickReconnect,
  isFirstJoin,
  handleUserJoin,
  handleUserDisconnect
};

