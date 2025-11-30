const messageStore = require('../models/MessageStore');

const createMessage = (username, text, room) => {
  return {
    type: 'message',
    username,
    text: text.trim(),
    timestamp: new Date().toISOString(),
    room
  };
};

const createSystemMessage = (username, text, room) => {
  return {
    type: 'system',
    text,
    timestamp: new Date().toISOString(),
    room,
    username
  };
};

const saveMessage = (room, message) => {
  messageStore.addMessage(room, message);
};

const getMessageHistory = (room) => {
  return messageStore.getMessages(room);
};

module.exports = {
  createMessage,
  createSystemMessage,
  saveMessage,
  getMessageHistory
};

