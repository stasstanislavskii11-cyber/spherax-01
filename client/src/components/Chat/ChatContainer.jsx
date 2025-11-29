import React from 'react';
import ChatHeader from './ChatHeader';
import ChatSidebar from './ChatSidebar';
import ChatContent from './ChatContent';
import './Chat.css';

const ChatContainer = ({
  username,
  isConnected,
  onLogout,
  selectedRoom,
  onRoomChange,
  allUsers,
  messages,
  messageInput,
  setMessageInput,
  onMessageSubmit
}) => {
  return (
    <div className="chat-container">
      <ChatHeader
        username={username}
        isConnected={isConnected}
        onLogout={onLogout}
      />
      <div className="chat-main">
        <ChatSidebar
          selectedRoom={selectedRoom}
          onRoomChange={onRoomChange}
          allUsers={allUsers}
          isConnected={isConnected}
        />
        <ChatContent
          selectedRoom={selectedRoom}
          messages={messages}
          username={username}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          onMessageSubmit={onMessageSubmit}
          isConnected={isConnected}
        />
      </div>
    </div>
  );
};

export default ChatContainer;

