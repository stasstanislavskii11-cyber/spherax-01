import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';
const DEFAULT_ROOM = 'general';
const ROOMS = ['general', 'random', 'tech', 'gaming'];

function App() {
  const [username, setUsername] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(DEFAULT_ROOM);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const currentRoomRef = useRef(selectedRoom);

  // Update room ref when selectedRoom changes
  useEffect(() => {
    currentRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    // Listen for messages
    const handleMessage = (data) => {
      // Only add message if it's for the current room
      if (data.room === currentRoomRef.current) {
        setMessages((prev) => [...prev, data]);
      }
    };

    // Listen for system messages
    const handleSystem = (data) => {
      // Only add system message if it's for the current room
      if (data.room === currentRoomRef.current) {
        setMessages((prev) => [...prev, data]);
      }
    };

    // Listen for message history
    const handleHistory = (data) => {
      if (data.room === currentRoomRef.current) {
        setMessages(data.messages);
      }
    };

    // Listen for users list updates
    const handleUsers = (data) => {
      if (data.room === currentRoomRef.current) {
        setOnlineUsers(data.users);
      }
    };

    newSocket.on('message', handleMessage);
    newSocket.on('system', handleSystem);
    newSocket.on('history', handleHistory);
    newSocket.on('users', handleUsers);

    // Listen for errors
    newSocket.on('error', (data) => {
      console.error('Server error:', data.message);
      alert(`Error: ${data.message}`);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // Handle room change
  useEffect(() => {
    if (socket && socket.connected && username) {
      // Clear messages and users for the new room
      setMessages([]);
      setOnlineUsers([]);
      
      // Join the new room (server will send history and users list)
      socket.emit('join', { username, room: selectedRoom });
    }
  }, [selectedRoom, username, socket]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus message input when username is set
  useEffect(() => {
    if (username && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [username]);

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    const trimmedUsername = usernameInput.trim();
    
    if (trimmedUsername.length === 0) {
      alert('Please enter a username');
      return;
    }

    if (socket && socket.connected) {
      socket.emit('join', { username: trimmedUsername, room: selectedRoom });
      setUsername(trimmedUsername);
      setUsernameInput('');
    } else {
      alert('Not connected to server. Please wait...');
    }
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    const trimmedMessage = messageInput.trim();
    
    if (trimmedMessage.length === 0) {
      return;
    }

    if (socket && socket.connected) {
      socket.emit('message', { text: trimmedMessage });
      setMessageInput('');
      messageInputRef.current?.focus();
    } else {
      alert('Not connected to server');
    }
  };

  const handleRoomChange = (room) => {
    if (room !== selectedRoom && username) {
      setSelectedRoom(room);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="App">
      <div className="chat-container">
        <header className="chat-header">
          <h1>SpheraX Chat</h1>
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '●' : '○'}
            </span>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </header>

        {!username ? (
          <div className="username-form-container">
            <form onSubmit={handleUsernameSubmit} className="username-form">
              <h2>Enter your username</h2>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Username"
                maxLength={50}
                autoFocus
                className="username-input"
              />
              <button type="submit" className="username-submit-btn">
                Join Chat
              </button>
            </form>
          </div>
        ) : (
          <div className="chat-main">
            <div className="chat-sidebar">
              <div className="rooms-section">
                <h3>Rooms</h3>
                <div className="rooms-list">
                  {ROOMS.map((room) => (
                    <button
                      key={room}
                      className={`room-button ${selectedRoom === room ? 'active' : ''}`}
                      onClick={() => handleRoomChange(room)}
                      disabled={!isConnected}
                    >
                      # {room}
                    </button>
                  ))}
                </div>
              </div>
              <div className="users-section">
                <h3>Online ({onlineUsers.length})</h3>
                <div className="users-list">
                  {onlineUsers.length === 0 ? (
                    <p className="no-users">No users online</p>
                  ) : (
                    onlineUsers.map((user, index) => (
                      <div key={index} className="user-item">
                        <span className="user-indicator">●</span>
                        <span className="user-name">{user}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="chat-content">
              <div className="chat-room-header">
                <h2>#{selectedRoom}</h2>
              </div>
              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="empty-messages">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`message ${msg.type === 'system' ? 'system-message' : 'user-message'}`}
                    >
                      {msg.type === 'message' && (
                        <div className="message-header">
                          <span className="message-username">{msg.username}</span>
                          <span className="message-timestamp">{formatTimestamp(msg.timestamp)}</span>
                        </div>
                      )}
                      <div className="message-text">{msg.text}</div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleMessageSubmit} className="message-form">
                <input
                  ref={messageInputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Message #${selectedRoom}...`}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
