const express = require('express');
const http = require('http');
const cors = require('cors');
const { createSocketServer } = require('./config/socketConfig');
const { setupSocketHandlers } = require('./handlers/socketHandlers');
const routes = require('./routes');
const { ROOMS } = require('./config/constants');
const userStore = require('./models/UserStore');
const messageStore = require('./models/MessageStore');

const app = express();
const server = http.createServer(app);
const io = createSocketServer(server);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize stores
userStore.initializeRooms(ROOMS);
messageStore.initializeRooms(ROOMS);

// Routes
app.use('/', routes);

// Setup socket handlers
setupSocketHandlers(io);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = { app, server, io };

