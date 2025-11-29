import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import './Chat.css';

const MessageList = ({ messages, username, selectedRoom }) => {
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
              username={username}
              selectedRoom={selectedRoom}
            />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageList;

