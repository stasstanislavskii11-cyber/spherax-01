// Store connected users (in-memory)
// Map: socket.id -> { username, room }
const connectedUsers = new Map();

// Store users per room
// Map: room -> Set of usernames
const roomUsers = new Map();

// Store all users globally with their connection status
// Map: username -> { status: 'connected' | 'disconnected', lastSeen: timestamp }
const allUsers = new Map();

// Track recent disconnects to detect reloads (suppress leave/join messages)
// Map: username -> timestamp of last disconnect
const recentDisconnects = new Map();

// Store pending disconnect timeouts to cancel them on quick reconnect
// Map: username -> timeout ID
const disconnectTimeouts = new Map();

const initializeRooms = (rooms) => {
  rooms.forEach(room => {
    if (!roomUsers.has(room)) {
      roomUsers.set(room, new Set());
    }
  });
};

const addConnectedUser = (socketId, username, room) => {
  connectedUsers.set(socketId, { username, room });
  roomUsers.get(room)?.add(username);
};

const removeConnectedUser = (socketId) => {
  const userData = connectedUsers.get(socketId);
  if (userData) {
    const { username, room } = userData;
    connectedUsers.delete(socketId);
    
    // Check if there are other sessions with the same username in this room
    const otherSessionsInRoom = Array.from(connectedUsers.values()).filter(
      user => user.username === username && user.room === room
    );
    
    // Only remove from roomUsers if this was the last session of this username in this room
    if (otherSessionsInRoom.length === 0) {
      roomUsers.get(room)?.delete(username);
    }
    
    return userData;
  }
  return null;
};

const getUserData = (socketId) => {
  return connectedUsers.get(socketId);
};

const getRoomUsers = (room) => {
  return Array.from(roomUsers.get(room) || []);
};

const hasUserInAnyRoom = (username) => {
  return Array.from(roomUsers.values()).some(users => users.has(username));
};

const updateGlobalUserStatus = (username, status) => {
  if (!allUsers.has(username)) {
    allUsers.set(username, {
      status,
      lastSeen: new Date().toISOString()
    });
  } else {
    const userData = allUsers.get(username);
    userData.status = status;
    userData.lastSeen = new Date().toISOString();
  }
};

const getAllUsers = () => {
  return Array.from(allUsers.entries()).map(([username, data]) => ({
    username,
    status: data.status,
    lastSeen: data.lastSeen
  }));
};

const setRecentDisconnect = (username, timestamp) => {
  recentDisconnects.set(username, timestamp);
};

const getRecentDisconnect = (username) => {
  return recentDisconnects.get(username);
};

const clearRecentDisconnect = (username) => {
  recentDisconnects.delete(username);
};

// New functions for timeout management
const setDisconnectTimeout = (username, timeoutId) => {
  // Clear any existing timeout for this user
  const existingTimeout = disconnectTimeouts.get(username);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }
  disconnectTimeouts.set(username, timeoutId);
};

const clearDisconnectTimeout = (username) => {
  const timeoutId = disconnectTimeouts.get(username);
  if (timeoutId) {
    clearTimeout(timeoutId);
    disconnectTimeouts.delete(username);
  }
};

const hasOtherSessionsAnywhere = (username) => {
  return Array.from(connectedUsers.values()).some(
    user => user.username === username
  );
};

const updateSocketRoom = (socket, newRoom) => {
  const userData = connectedUsers.get(socket.id);
  if (userData) {
    // Remove from old room
    const oldRoom = userData.room;
    const username = userData.username;
    
    // Check if there are other sessions with the same username in the old room
    const otherSessionsInOldRoom = Array.from(connectedUsers.entries()).filter(
      ([id, user]) => user.username === username && user.room === oldRoom && id !== socket.id
    );
    
    // Only remove from roomUsers if this was the last session of this username in that room
    if (otherSessionsInOldRoom.length === 0 && oldRoom) {
      roomUsers.get(oldRoom)?.delete(username);
    }
    
    // Add to new room
    userData.room = newRoom;
    roomUsers.get(newRoom)?.add(username);
    
    return { oldRoom, username };
  }
  return null;
};

module.exports = {
  initializeRooms,
  addConnectedUser,
  removeConnectedUser,
  getUserData,
  getRoomUsers,
  hasUserInAnyRoom,
  updateGlobalUserStatus,
  getAllUsers,
  setRecentDisconnect,
  getRecentDisconnect,
  clearRecentDisconnect,
  hasOtherSessionsAnywhere,
  updateSocketRoom,
  setDisconnectTimeout,
  clearDisconnectTimeout
};

