import React, { useState } from 'react';
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

  const {
    socket,
    isConnected,
    messages,
    allUsers
  } = useSocket(username, selectedRoom);

  const handleUsernameSubmit = (trimmedUsername) => {
    if (socket && socket.connected) {
      socket.emit('join', { username: trimmedUsername, room: selectedRoom });
      setUsername(trimmedUsername);
      saveUsernameToStorage(trimmedUsername);
      saveRoomToStorage(selectedRoom);
    }
  };

  const handleMessageSubmit = (trimmedMessage) => {
    if (socket && socket.connected) {
      socket.emit('message', { text: trimmedMessage });
      setMessageInput('');
    }
  };

  const handleRoomChange = (room) => {
    setTimeout(() => {
      // Focus will be handled by MessageForm component
    }, 100);
    if (room !== selectedRoom && username) {
      setSelectedRoom(room);
    }
  };

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
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
        />
      )}
    </div>
  );
}

export default App;
