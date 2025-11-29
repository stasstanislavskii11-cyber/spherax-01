import React from 'react';
import UserItem from './UserItem';
import { useChat } from '../../contexts/ChatContext';
import './UserList.css';

const UserList = () => {
  const { allUsers } = useChat();

  return (
    <div className="users-section">
      <h3>Users ({allUsers.length})</h3>
      <div className="users-list">
        {allUsers.length === 0 ? (
          <p className="no-users">No users</p>
        ) : (
          allUsers.map((user, index) => (
            <UserItem key={index} user={user} />
          ))
        )}
      </div>
    </div>
  );
};

export default UserList;

