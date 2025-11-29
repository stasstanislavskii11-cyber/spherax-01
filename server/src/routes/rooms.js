const express = require('express');
const router = express.Router();
const roomService = require('../services/roomService');

router.get('/', (req, res) => {
  res.json({ rooms: roomService.getAllRooms() });
});

module.exports = router;

