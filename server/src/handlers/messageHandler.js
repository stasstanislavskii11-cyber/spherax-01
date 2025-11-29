const messageService = require('../services/messageService');
const userStore = require('../models/UserStore');

const handleMessage = (socket, io, data) => {
  try {
    const { text } = data;
    const userData = userStore.getUserData(socket.id);

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

    const message = messageService.createMessage(
      userData.username,
      text,
      socket.room
    );

    // Store message in room history
    messageService.saveMessage(socket.room, message);

    // Broadcast message to all clients in the room
    io.to(socket.room).emit('message', message);

    console.log(`Message from ${userData.username} in ${socket.room}: ${message.text}`);
  } catch (error) {
    console.error('Error handling message:', error);
    socket.emit('error', {
      type: 'error',
      message: 'Failed to send message'
    });
  }
};

module.exports = {
  handleMessage
};

