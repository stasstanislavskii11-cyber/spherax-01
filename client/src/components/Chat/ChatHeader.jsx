import React from 'react';
import { getInitialLetter } from '../../utils/formatters';
import { useChat } from '../../contexts/ChatContext';
import './Chat.css';

const ChatHeader = () => {
  const { username, isConnected, handleLogout } = useChat();

  return (
    <header className="chat-header">
      <h1>SpheraX Chat</h1>
      {username && (
        <div className="user-controls">
          <div className="user-icon-container" title={username}>
            <div className="user-icon">
              {getInitialLetter(username)}
            </div>
            <div className={`connection-badge ${isConnected ? 'connected' : 'disconnected'}`}></div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default ChatHeader;

