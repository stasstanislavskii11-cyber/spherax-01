const express = require('express');
const router = express.Router();
const userStore = require('../models/UserStore');

router.get('/', (req, res) => {
  const usersList = userStore.getAllUsers();
  res.json({ users: usersList });
});

module.exports = router;

