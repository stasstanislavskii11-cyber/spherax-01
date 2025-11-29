import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { validateMessage } from '../../utils/validators';
import { useChat } from '../../contexts/ChatContext';
import './Chat.css';

const MessageForm = (props, ref) => {
  const { messageInput, setMessageInput, handleMessageSubmit, selectedRoom, isConnected, username, messageFormRef } = useChat();
  const messageInputRef = useRef(null);
  const isConnectedRef = useRef(isConnected);

  // Expose focus method to parent components
  useImperativeHandle(ref, () => ({
    focus: () => {
      if (messageInputRef.current && isConnected) {
        setTimeout(() => {
          if (messageInputRef.current && isConnected) {
            messageInputRef.current.focus();
          }
        }, 100);
      }
    }
  }));

  // Callback ref to sync messageFormRef with the input element
  const setInputRef = (element) => {
    messageInputRef.current = element;
    if (messageFormRef) {
      messageFormRef.current = element;
    }
  };

  // Keep ref updated
  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  // Focus on mount if username exists (for refresh scenarios)
  useEffect(() => {
    if (username && messageInputRef.current) {
      const timer = setTimeout(() => {
        if (messageInputRef.current && isConnectedRef.current) {
          messageInputRef.current.focus();
        }
      }, 200);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Focus input when username is set (first join), room changes, or connection is established
  useEffect(() => {
    if (username && messageInputRef.current) {
      // Small delay to ensure input is fully rendered and enabled
      const timer = setTimeout(() => {
        if (messageInputRef.current && isConnected) {
          messageInputRef.current.focus();
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [username, selectedRoom, isConnected]);

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

    handleMessageSubmit(trimmedMessage);
    messageInputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="message-form">
      <input
        ref={setInputRef}
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

export default forwardRef(MessageForm);

