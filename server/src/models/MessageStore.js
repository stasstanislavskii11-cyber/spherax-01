// Store messages per room (in-memory history)
// Map: room -> Array of messages (max 100 messages per room)
const roomMessages = new Map();

const { MAX_MESSAGES_PER_ROOM } = require('../config/constants');

const initializeRooms = (rooms) => {
  rooms.forEach(room => {
    if (!roomMessages.has(room)) {
      roomMessages.set(room, []);
    }
  });
};

const addMessage = (room, message) => {
  const history = roomMessages.get(room) || [];
  history.push(message);
  if (history.length > MAX_MESSAGES_PER_ROOM) {
    history.shift(); // Remove oldest message
  }
  roomMessages.set(room, history);
};

const getMessages = (room) => {
  return roomMessages.get(room) || [];
};

module.exports = {
  initializeRooms,
  addMessage,
  getMessages
};

