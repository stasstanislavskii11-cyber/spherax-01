import React, { useState, useRef } from 'react';
import './App.css';
import { useUsername, useRoom } from './hooks/useLocalStorage';
import { useSocket } from './hooks/useSocket';
import { saveUsernameToStorage, saveRoomToStorage } from './services/storageService';
import { DEFAULT_ROOM } from './utils/constants';
import UsernameForm from './components/UsernameForm/UsernameForm';
import ChatContainer from './components/Chat/ChatContainer';

function App() {
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
    
    // If socket is connected, join immediately
    if (socket && socket.connected) {
      socket.emit('join', { username: trimmedUsername, room: selectedRoom });
    } else if (socket) {
      // If socket exists but not connected, try to reconnect
      if (!socket.connected) {
        socket.connect();
      }
      // Wait for connection and then join
      const connectHandler = () => {
        socket.emit('join', { username: trimmedUsername, room: selectedRoom });
        socket.off('connect', connectHandler);
      };
      socket.on('connect', connectHandler);
    }
    // If socket doesn't exist yet, the useSocket hook will handle it when it connects
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

  return (
    <div className="App">
      {!username ? (
        <UsernameForm
          onSubmit={handleUsernameSubmit}
          isConnected={isConnected}
        />
      ) : (
        <ChatContainer
          username={username}
          isConnected={isConnected}
          onLogout={handleLogout}
          selectedRoom={selectedRoom}
          onRoomChange={handleRoomChange}
          allUsers={allUsers}
          messages={messages}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          onMessageSubmit={handleMessageSubmit}
          messageFormRef={messageFormRef}
        />
      )}
    </div>
  );
}

export default App;
