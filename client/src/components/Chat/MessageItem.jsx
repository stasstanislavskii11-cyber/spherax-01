import React from 'react';
import { formatTimestamp } from '../../utils/formatters';
import { GLOBAL_ROOM } from '../../utils/constants';
import { useChat } from '../../contexts/ChatContext';
import './Chat.css';

const MessageItem = ({ message }) => {
  const { username, selectedRoom } = useChat();
  const isOwnMessage = message.type === 'message' && message.username === username;
  const isGlobalRoom = selectedRoom === GLOBAL_ROOM;

  let displayText = message.text;
  let displayUsername = message.username;

  if (message.type === 'system') {
    if (isGlobalRoom && message.username === username) {
      displayText = displayText.replace(`${username}`, 'You');
    }
  } else if (isOwnMessage) {
    displayUsername = 'You';
  }

  const messageClass = message.type === 'system'
    ? 'system-message'
    : isGlobalRoom
      ? 'other-message'
      : isOwnMessage
        ? 'own-message'
        : 'other-message';

  return (
    <div className={`message ${messageClass}`}>
      {message.type === 'message' && (
        <div className="message-header">
          <span className="message-username">{displayUsername}</span>
          <span className="message-timestamp">{formatTimestamp(message.timestamp)}</span>
        </div>
      )}
      <div className="message-text">{displayText}</div>
    </div>
  );
};

export default MessageItem;

