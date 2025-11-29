import React from 'react';
import MessageList from './MessageList';
import MessageForm from './MessageForm';
import './Chat.css';

const ChatContent = ({
  selectedRoom,
  messages,
  username,
  messageInput,
  setMessageInput,
  onMessageSubmit,
  isConnected
}) => {
  return (
    <div className="chat-content">
      <div className="chat-room-header">
        <h2>{selectedRoom}</h2>
      </div>
      <MessageList
        messages={messages}
        username={username}
        selectedRoom={selectedRoom}
      />
      <MessageForm
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        onSubmit={onMessageSubmit}
        selectedRoom={selectedRoom}
        isConnected={isConnected}
        username={username}
      />
    </div>
  );
};

export default ChatContent;

