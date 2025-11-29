const { ROOMS, DEFAULT_ROOM, GLOBAL_ROOM } = require('../config/constants');

const validateRoom = (room) => {
  const trimmedRoom = room.trim().toLowerCase();
  return ROOMS.includes(trimmedRoom) ? trimmedRoom : null;
};

const getDefaultRoom = () => DEFAULT_ROOM;

const getGlobalRoom = () => GLOBAL_ROOM;

const getAllRooms = () => ROOMS;

module.exports = {
  validateRoom,
  getDefaultRoom,
  getGlobalRoom,
  getAllRooms
};

