import React from 'react';
import './App.css';
import { ChatProvider, useChat } from './contexts/ChatContext';
import UsernameForm from './components/UsernameForm/UsernameForm';
import ChatContainer from './components/Chat/ChatContainer';

const AppContent = () => {
  const { username, handleUsernameSubmit } = useChat();

  return (
    <div className="App">
      {!username ? (
        <UsernameForm onSubmit={handleUsernameSubmit} />
      ) : (
        <ChatContainer />
      )}
    </div>
  );
};

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

export default App;
