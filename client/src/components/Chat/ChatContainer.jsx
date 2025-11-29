import React from 'react';
import ChatHeader from './ChatHeader';
import ChatSidebar from './ChatSidebar';
import ChatContent from './ChatContent';
import './Chat.css';

const ChatContainer = () => {
  return (
    <div className="chat-container">
      <ChatHeader />
      <div className="chat-main">
        <ChatSidebar />
        <ChatContent />
      </div>
    </div>
  );
};

export default ChatContainer;

