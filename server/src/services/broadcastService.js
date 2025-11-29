const userStore = require('../models/UserStore');

const broadcastAllUsers = (io) => {
  const globalUsersList = userStore.getAllUsers().map(({ username, status }) => ({
    username,
    status
  }));
  io.emit('allUsers', {
    type: 'allUsers',
    users: globalUsersList
  });
};

module.exports = {
  broadcastAllUsers
};

