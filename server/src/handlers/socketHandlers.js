const joinHandler = require('./joinHandler');
const messageHandler = require('./messageHandler');
const disconnectHandler = require('./disconnectHandler');

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle join event
    socket.on('join', (data) => {
      joinHandler.handleJoin(socket, io, data);
    });

    // Handle message event
    socket.on('message', (data) => {
      messageHandler.handleMessage(socket, io, data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      disconnectHandler.handleDisconnect(socket, io);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

module.exports = {
  setupSocketHandlers
};

