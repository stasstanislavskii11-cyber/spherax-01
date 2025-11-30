import React, { createContext, useContext, useState, useRef } from 'react';
import { useUsername, useRoom } from '../hooks/useLocalStorage';
import { useSocket } from '../hooks/useSocket';
import { saveUsernameToStorage, saveRoomToStorage } from '../services/storageService';
import { DEFAULT_ROOM } from '../utils/constants';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [username, setUsername] = useUsername();
  const [selectedRoom, setSelectedRoom] = useRoom();
  const [messageInput, setMessageInput] = useState('');
  const messageFormRef = useRef(null);

  const {
    socket,
    isConnected,
    messages,
    allUsers
  } = useSocket(username, selectedRoom);

  const handleUsernameSubmit = (trimmedUsername) => {
    // Save username and room first
    setUsername(trimmedUsername);
    saveUsernameToStorage(trimmedUsername);
    saveRoomToStorage(selectedRoom);
    // The useSocket hook will automatically handle joining when username is set
  };

  const handleMessageSubmit = (trimmedMessage) => {
    if (socket && socket.connected) {
      socket.emit('message', { text: trimmedMessage });
      setMessageInput('');
    }
  };

  const handleRoomChange = (room) => {
    // Always focus input when room button is clicked, even if it's the same room
    if (messageFormRef.current) {
      messageFormRef.current.focus();
    }
    if (room !== selectedRoom && username) {
      setSelectedRoom(room);
    }
  };

  const handleLogout = () => {
    if (socket) {
      // Disconnect the socket - this will trigger server to update status to disconnected
      socket.disconnect();
    }
    // Clear username and room
    setUsername('');
    setSelectedRoom(DEFAULT_ROOM);
    saveUsernameToStorage('');
    saveRoomToStorage(DEFAULT_ROOM);
  };

  const value = {
    // State
    username,
    selectedRoom,
    messageInput,
    setMessageInput,
    isConnected,
    messages,
    allUsers,
    socket,
    messageFormRef,
    // Functions
    handleUsernameSubmit,
    handleMessageSubmit,
    handleRoomChange,
    handleLogout,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

