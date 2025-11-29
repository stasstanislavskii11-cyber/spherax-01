import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import { useChat } from '../../contexts/ChatContext';
import './Chat.css';

const MessageList = () => {
  const { messages, selectedRoom } = useChat();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredMessages = messages.filter(
    msg => msg.room === selectedRoom || !msg.room
  );

  return (
    <div className="messages-container">
      {filteredMessages.length === 0 ? (
        <div className="empty-messages">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <>
          {filteredMessages.map((msg, index) => (
            <MessageItem
              key={index}
              message={msg}
            />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageList;

