import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';
const DEFAULT_ROOM = 'general';
const GLOBAL_ROOM = 'global';
const ROOMS = ['global', 'general', 'random', 'tech', 'gaming'];
const STORAGE_KEY = 'spherax-chat-history';
const USERNAME_KEY = 'spherax-username';
const ROOM_KEY = 'spherax-selected-room';

// Helper functions for localStorage
const saveMessagesToStorage = (room, messages) => {
  try {
    const storage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    storage[room] = messages;
    // Limit to last 200 messages per room to avoid storage issues
    if (storage[room].length > 200) {
      storage[room] = storage[room].slice(-200);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const loadMessagesFromStorage = (room) => {
  try {
    const storage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return storage[room] || [];
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return [];
  }
};

const saveUsernameToStorage = (username) => {
  try {
    if (username) {
      localStorage.setItem(USERNAME_KEY, username);
    } else {
      localStorage.removeItem(USERNAME_KEY);
    }
  } catch (error) {
    console.error('Error saving username to localStorage:', error);
  }
};

const loadUsernameFromStorage = () => {
  try {
    return localStorage.getItem(USERNAME_KEY) || '';
  } catch (error) {
    console.error('Error loading username from localStorage:', error);
    return '';
  }
};

const saveRoomToStorage = (room) => {
  try {
    if (room) {
      localStorage.setItem(ROOM_KEY, room);
    }
  } catch (error) {
    console.error('Error saving room to localStorage:', error);
  }
};

const loadRoomFromStorage = () => {
  try {
    return localStorage.getItem(ROOM_KEY) || DEFAULT_ROOM;
  } catch (error) {
    console.error('Error loading room from localStorage:', error);
    return DEFAULT_ROOM;
  }
};

function App() {
  // Load username and room from localStorage on initial render
  const [username, setUsername] = useState(() => loadUsernameFromStorage());
  const [usernameInput, setUsernameInput] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(() => loadRoomFromStorage());
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // Track all users (online and offline)
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const currentRoomRef = useRef(selectedRoom);
  const previousRoomRef = useRef(null);
  const usernameRef = useRef(username);

  // Update room ref when selectedRoom changes
  useEffect(() => {
    currentRoomRef.current = selectedRoom;
    saveRoomToStorage(selectedRoom);
  }, [selectedRoom]);

  // Update username ref when username changes
  useEffect(() => {
    usernameRef.current = username;
    saveUsernameToStorage(username);
  }, [username]);


  // Load messages from localStorage on mount and when room changes
  useEffect(() => {
    if (username) {
      const storedMessages = loadMessagesFromStorage(selectedRoom);
      // Filter to only include messages for the current room
      const filteredMessages = storedMessages.filter(msg => msg.room === selectedRoom);
      if (filteredMessages.length > 0) {
        setMessages(filteredMessages);
      } else {
        setMessages([]);
      }
    }
  }, [selectedRoom, username]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (username && messages.length > 0) {
      // Only save messages that belong to the current room
      const roomMessages = messages.filter(msg => msg.room === selectedRoom);
      if (roomMessages.length > 0) {
        saveMessagesToStorage(selectedRoom, roomMessages);
      }
    }
  }, [messages, selectedRoom, username]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      
      // Auto-join if username was restored from localStorage
      // Use refs to get the latest values
      const currentUsername = usernameRef.current;
      const currentRoom = currentRoomRef.current;
      if (currentUsername) {
        newSocket.emit('join', { username: currentUsername, room: currentRoom });
        previousRoomRef.current = currentRoom;
      }
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
        // Ensure room is set on the message
        const messageWithRoom = { ...data, room: currentRoomRef.current };
        setMessages((prev) => {
          // Filter out any messages that don't belong to current room (safety check)
          const filtered = prev.filter(msg => msg.room === currentRoomRef.current);
          return [...filtered, messageWithRoom];
        });
      }
    };

    // Listen for system messages
    const handleSystem = (data) => {
      // System messages (join/leave) only appear in global room
      if (data.room === GLOBAL_ROOM) {
        // Always store global room messages in localStorage
        const globalMessages = loadMessagesFromStorage(GLOBAL_ROOM);
        const systemMessageWithRoom = { ...data, room: GLOBAL_ROOM };
        globalMessages.push(systemMessageWithRoom);
        if (globalMessages.length > 200) {
          globalMessages.shift();
        }
        saveMessagesToStorage(GLOBAL_ROOM, globalMessages);
        
        // Only display if we're currently viewing the global room
        if (currentRoomRef.current === GLOBAL_ROOM) {
          setMessages((prev) => {
            // Filter out any messages that don't belong to current room (safety check)
            const filtered = prev.filter(msg => msg.room === GLOBAL_ROOM);
            return [...filtered, systemMessageWithRoom];
          });
        }
        
      }
    };

    // Listen for message history
    const handleHistory = (data) => {
      if (data.room === currentRoomRef.current) {
        // Merge server history with localStorage history
        const storedMessages = loadMessagesFromStorage(data.room);
        // Filter stored messages to only include messages for this room
        const filteredStored = storedMessages.filter(msg => msg.room === data.room);
        const serverMessages = (data.messages || []).map(msg => ({ ...msg, room: data.room }));
        
        // Combine and deduplicate by timestamp and text
        const allMessages = [...filteredStored, ...serverMessages];
        const uniqueMessages = allMessages.filter((msg, index, self) =>
          index === self.findIndex((m) => 
            m.timestamp === msg.timestamp && 
            m.text === msg.text &&
            m.room === msg.room &&
            (m.username === msg.username || (m.type === 'system' && msg.type === 'system'))
          )
        );
        
        // Sort by timestamp
        uniqueMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        setMessages(uniqueMessages);
      }
    };

    // Listen for users list updates (room-specific)
    const handleUsers = (data) => {
      // Update onlineUsers only for current room
      if (data.room === currentRoomRef.current) {
        setOnlineUsers(data.users);
      }
    };

    // Listen for global user list updates from backend
    const handleAllUsers = (data) => {
      // Convert backend format to client format
      const usersList = (data.users || []).map(user => ({
        username: user.username,
        isOnline: user.status === 'connected'
      }));
      
      // Sort: online users first, then offline users, both alphabetically
      const sortedUsers = usersList.sort((a, b) => {
        if (a.isOnline !== b.isOnline) {
          return a.isOnline ? -1 : 1;
        }
        return a.username.localeCompare(b.username);
      });
      
      setAllUsers(sortedUsers);
    };

    newSocket.on('message', handleMessage);
    newSocket.on('system', handleSystem);
    newSocket.on('history', handleHistory);
    newSocket.on('users', handleUsers);
    newSocket.on('allUsers', handleAllUsers);

    // Listen for errors
    newSocket.on('error', (data) => {
      console.error('Server error:', data.message);
      // Log error but don't block UI with alert
      // Errors are now non-blocking - user can continue using the app
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // Auto-join when socket connects and username exists (for page reload scenario)
  useEffect(() => {
    if (socket && socket.connected && username && previousRoomRef.current === null) {
      // User was restored from localStorage and socket just connected
      socket.emit('join', { username, room: selectedRoom });
      previousRoomRef.current = selectedRoom;
    }
  }, [socket, username, selectedRoom]);

  // Handle room change (only when user has already joined and is actually switching rooms)
  useEffect(() => {
    if (socket && socket.connected && username && previousRoomRef.current !== null && previousRoomRef.current !== selectedRoom) {
      // Clear current messages first to ensure isolation
      setMessages([]);
      setOnlineUsers([]);
      // Don't reset allUsers - keep global user list across all rooms
      
      // Load messages from localStorage for the new room (filtered by room)
      const storedMessages = loadMessagesFromStorage(selectedRoom);
      const filteredMessages = storedMessages.filter(msg => msg.room === selectedRoom);
      if (filteredMessages.length > 0) {
        setMessages(filteredMessages);
      }
      
      // Join the new room (server will send history and users list)
      socket.emit('join', { username, room: selectedRoom });
    }
    // Update previous room reference only if it's not null (to track room switches)
    if (previousRoomRef.current !== null) {
      previousRoomRef.current = selectedRoom;
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
      previousRoomRef.current = selectedRoom;
      saveUsernameToStorage(trimmedUsername);
      saveRoomToStorage(selectedRoom);
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
                <h3>Users ({allUsers.length})</h3>
                <div className="users-list">
                  {allUsers.length === 0 ? (
                    <p className="no-users">No users</p>
                  ) : (
                    allUsers.map((user, index) => (
                      <div key={index} className="user-item">
                        <span className={`user-indicator ${user.isOnline ? 'online' : 'offline'}`}>●</span>
                        <span className="user-name">{user.username}</span>
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
                  messages
                    .filter(msg => msg.room === selectedRoom || !msg.room) // Filter by room (allow legacy messages without room)
                    .map((msg, index) => {
                      const isOwnMessage = msg.type === 'message' && msg.username === username;
                      const isGlobalRoom = selectedRoom === GLOBAL_ROOM;
                      
                      // Show "You" for own messages in all rooms
                      let displayText = msg.text;
                      let displayUsername = msg.username;
                      
                      if (msg.type === 'system') {
                        // For system messages in global room: replace username with "You" if it's the current user
                        if (isGlobalRoom && msg.username === username) {
                          displayText = displayText.replace(`${username}`, 'You');
                        }
                      } else if (isOwnMessage) {
                        // For own messages in all rooms: show "You" instead of username
                        displayUsername = 'You';
                      }
                      
                      // In global room, own messages are displayed like other messages (left-aligned)
                      // In other rooms, own messages are right-aligned
                      const messageClass = msg.type === 'system' 
                        ? 'system-message' 
                        : isGlobalRoom 
                          ? 'other-message' // In global room, all messages are left-aligned
                          : isOwnMessage 
                            ? 'own-message' 
                            : 'other-message';
                      
                      return (
                        <div
                          key={index}
                          className={`message ${messageClass}`}
                        >
                          {msg.type === 'message' && (
                            <div className="message-header">
                              <span className="message-username">{displayUsername}</span>
                              <span className="message-timestamp">{formatTimestamp(msg.timestamp)}</span>
                            </div>
                          )}
                          <div className="message-text">{displayText}</div>
                        </div>
                      );
                    })
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
