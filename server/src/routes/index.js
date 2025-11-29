const express = require('express');
const healthRoutes = require('./health');
const roomsRoutes = require('./rooms');
const usersRoutes = require('./users');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/rooms', roomsRoutes);
router.use('/users', usersRoutes);

module.exports = router;

