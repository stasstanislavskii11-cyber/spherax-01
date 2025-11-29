import React from 'react';
import './UserList.css';

const UserItem = ({ user }) => {
  return (
    <div className="user-item">
      <span className={`user-indicator ${user.isOnline ? 'online' : 'offline'}`}>●</span>
      <span className="user-name">{user.username}</span>
    </div>
  );
};

export default UserItem;

