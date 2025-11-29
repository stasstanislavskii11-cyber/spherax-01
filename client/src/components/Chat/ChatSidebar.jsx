import React from 'react';
import RoomList from '../RoomList/RoomList';
import UserList from '../UserList/UserList';
import './Chat.css';

const ChatSidebar = ({ selectedRoom, onRoomChange, allUsers, isConnected }) => {
  return (
    <div className="chat-sidebar">
      <RoomList
        selectedRoom={selectedRoom}
        onRoomChange={onRoomChange}
        isConnected={isConnected}
      />
      <UserList users={allUsers} />
    </div>
  );
};

export default ChatSidebar;

