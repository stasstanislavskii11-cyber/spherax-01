import React from 'react';
import MessageList from './MessageList';
import MessageForm from './MessageForm';
import { useChat } from '../../contexts/ChatContext';
import './Chat.css';

const ChatContent = () => {
  const { selectedRoom } = useChat();

  return (
    <div className="chat-content">
      <div className="chat-room-header">
        <h2>{selectedRoom}</h2>
      </div>
      <MessageList />
      <MessageForm />
    </div>
  );
};

export default ChatContent;

