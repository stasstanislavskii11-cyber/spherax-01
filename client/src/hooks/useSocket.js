import { useState, useEffect, useRef } from 'react';
import { createSocketConnection } from '../services/socketService';
import { GLOBAL_ROOM } from '../utils/constants';
import { loadMessagesFromStorage, saveMessagesToStorage } from '../services/storageService';
import { mergeMessageHistory, saveSystemMessage } from '../services/messageService';

export const useSocket = (username, selectedRoom) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  
  const currentRoomRef = useRef(selectedRoom);
  const previousRoomRef = useRef(null);
  const usernameRef = useRef(username);

  // Update refs when values change
  useEffect(() => {
    currentRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = createSocketConnection();

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      
      // Update current user's status in allUsers list when connected
      if (usernameRef.current) {
        setAllUsers((prev) => {
          const userExists = prev.some(user => user.username === usernameRef.current);
          if (userExists) {
            return prev.map((user) => 
              user.username === usernameRef.current 
                ? { ...user, isOnline: true }
                : user
            );
          } else {
            return [...prev, { username: usernameRef.current, isOnline: true }];
          }
        });
      }

      // Auto-join if username was restored from localStorage
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
      
      // Update current user's status in allUsers list when disconnected
      if (usernameRef.current) {
        setAllUsers((prev) => {
          const userExists = prev.some(user => user.username === usernameRef.current);
          if (userExists) {
            return prev.map((user) => 
              user.username === usernameRef.current 
                ? { ...user, isOnline: false }
                : user
            );
          } else {
            return [...prev, { username: usernameRef.current, isOnline: false }];
          }
        });
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    // Listen for messages
    const handleMessage = (data) => {
      if (data.room === currentRoomRef.current) {
        const messageWithRoom = { ...data, room: currentRoomRef.current };
        setMessages((prev) => {
          const filtered = prev.filter(msg => msg.room === currentRoomRef.current);
          return [...filtered, messageWithRoom];
        });
      }
    };

    // Listen for system messages
    const handleSystem = (data) => {
      if (data.room === GLOBAL_ROOM) {
        saveSystemMessage(data);
        
        if (currentRoomRef.current === GLOBAL_ROOM) {
          setMessages((prev) => {
            const filtered = prev.filter(msg => msg.room === GLOBAL_ROOM);
            return [...filtered, { ...data, room: GLOBAL_ROOM }];
          });
        }
      }
    };

    // Listen for message history
    const handleHistory = (data) => {
      if (data.room === currentRoomRef.current) {
        const mergedMessages = mergeMessageHistory(data.room, data.messages);
        setMessages(mergedMessages);
      }
    };

    // Listen for users list updates (room-specific)
    const handleUsers = (data) => {
      if (data.room === currentRoomRef.current) {
        setOnlineUsers(data.users);
      }
    };

    // Listen for global user list updates from backend
    const handleAllUsers = (data) => {
      const usersList = (data.users || []).map(user => ({
        username: user.username,
        isOnline: user.status === 'connected'
      }));

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

    newSocket.on('error', (data) => {
      console.error('Server error:', data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Auto-join when socket connects and username exists
  useEffect(() => {
    if (socket && socket.connected && username && previousRoomRef.current === null) {
      socket.emit('join', { username, room: selectedRoom });
      previousRoomRef.current = selectedRoom;
    }
  }, [socket, username, selectedRoom]);

  // Handle room change
  useEffect(() => {
    if (socket && socket.connected && username && previousRoomRef.current !== null && previousRoomRef.current !== selectedRoom) {
      setMessages([]);
      setOnlineUsers([]);

      const storedMessages = loadMessagesFromStorage(selectedRoom);
      const filteredMessages = storedMessages.filter(msg => msg.room === selectedRoom);
      if (filteredMessages.length > 0) {
        setMessages(filteredMessages);
      }

      socket.emit('join', { username, room: selectedRoom });
    }
    if (previousRoomRef.current !== null) {
      previousRoomRef.current = selectedRoom;
    }
  }, [selectedRoom, username, socket]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (username && messages.length > 0) {
      const roomMessages = messages.filter(msg => msg.room === selectedRoom);
      if (roomMessages.length > 0) {
        saveMessagesToStorage(selectedRoom, roomMessages);
      }
    }
  }, [messages, selectedRoom, username]);

  // Load messages from localStorage on mount and when room changes
  useEffect(() => {
    if (username) {
      const storedMessages = loadMessagesFromStorage(selectedRoom);
      const filteredMessages = storedMessages.filter(msg => msg.room === selectedRoom);
      if (filteredMessages.length > 0 && messages.length === 0) {
        setMessages(filteredMessages);
      }
    }
  }, [selectedRoom, username]);

  return {
    socket,
    isConnected,
    messages,
    onlineUsers,
    allUsers,
    setMessages
  };
};

