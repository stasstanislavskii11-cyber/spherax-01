import React from 'react';
import RoomList from '../RoomList/RoomList';
import UserList from '../UserList/UserList';
import './Chat.css';

const ChatSidebar = () => {
  return (
    <div className="chat-sidebar">
      <RoomList />
      <UserList />
    </div>
  );
};

export default ChatSidebar;

