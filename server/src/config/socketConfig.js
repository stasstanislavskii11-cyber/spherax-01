const { Server } = require('socket.io');

const createSocketServer = (httpServer) => {
  return new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });
};

module.exports = {
  createSocketServer
};

