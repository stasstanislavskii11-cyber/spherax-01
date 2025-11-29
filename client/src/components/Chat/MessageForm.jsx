import React, { useRef, useEffect } from 'react';
import { validateMessage } from '../../utils/validators';
import './Chat.css';

const MessageForm = ({ messageInput, setMessageInput, onSubmit, selectedRoom, isConnected, username, onRoomChange }) => {
  const messageInputRef = useRef(null);

  useEffect(() => {
    if (username && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [username]);

  useEffect(() => {
    if (username && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [selectedRoom]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedMessage = messageInput.trim();

    if (!validateMessage(trimmedMessage)) {
      return;
    }

    if (!isConnected) {
      alert('Not connected to server');
      return;
    }

    onSubmit(trimmedMessage);
    setMessageInput('');
    messageInputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="message-form">
      <input
        ref={messageInputRef}
        type="text"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        placeholder={`Message ${selectedRoom}...`}
        maxLength={500}
        className="message-input"
        disabled={!isConnected}
      />
      <button
        type="submit"
        disabled={!isConnected || messageInput.trim().length === 0}
        className="message-submit-btn"
      >
        Send
      </button>
    </form>
  );
};

export default MessageForm;

