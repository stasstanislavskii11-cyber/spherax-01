// Default rooms
const DEFAULT_ROOM = 'general';
const GLOBAL_ROOM = 'global';
const ROOMS = ['global', 'general', 'random', 'tech', 'gaming'];

// Reconnect window for detecting page reloads (in milliseconds)
const RECONNECT_WINDOW = 5000; // 5 seconds

// Message history limits
const MAX_MESSAGES_PER_ROOM = 100;

module.exports = {
  DEFAULT_ROOM,
  GLOBAL_ROOM,
  ROOMS,
  RECONNECT_WINDOW,
  MAX_MESSAGES_PER_ROOM
};

