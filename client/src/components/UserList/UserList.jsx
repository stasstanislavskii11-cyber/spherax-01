import React from 'react';
import UserItem from './UserItem';
import './UserList.css';

const UserList = ({ users }) => {
  return (
    <div className="users-section">
      <h3>Users ({users.length})</h3>
      <div className="users-list">
        {users.length === 0 ? (
          <p className="no-users">No users</p>
        ) : (
          users.map((user, index) => (
            <UserItem key={index} user={user} />
          ))
        )}
      </div>
    </div>
  );
};

export default UserList;

