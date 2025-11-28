const { Server } = require('socket.io');
const { createServer } = require('http');
const { io: Client } = require('socket.io-client');
const express = require('express');

describe('Chat Server Tests', () => {
  let server;
  let io;
  let httpServer;
  let clientSocket1;
  let clientSocket2;
  let port;

  beforeAll((done) => {
    const app = express();
    httpServer = createServer(app);
    io = new Server(httpServer);
    
    // Import server logic
    const connectedUsers = new Map();
    const roomMessages = new Map();
    const roomUsers = new Map();
    const DEFAULT_ROOM = 'general';
    const ROOMS = ['general', 'random', 'tech', 'gaming'];

    // Initialize rooms
    ROOMS.forEach(room => {
      roomMessages.set(room, []);
      roomUsers.set(room, new Set());
    });

    io.on('connection', (socket) => {
      socket.on('join', (data) => {
        const { username, room = DEFAULT_ROOM } = data;
        const trimmedUsername = username.trim();
        const trimmedRoom = room.trim().toLowerCase();

        if (!trimmedUsername || !ROOMS.includes(trimmedRoom)) {
          socket.emit('error', { type: 'error', message: 'Invalid username or room' });
          return;
        }

        if (socket.room) {
          const prevRoom = socket.room;
          roomUsers.get(prevRoom)?.delete(socket.username);
          socket.leave(prevRoom);
          io.to(prevRoom).emit('system', {
            type: 'system',
            text: `${socket.username} left the chat`,
            timestamp: new Date().toISOString()
          });
        }

        socket.join(trimmedRoom);
        socket.username = trimmedUsername;
        socket.room = trimmedRoom;
        connectedUsers.set(socket.id, { username: trimmedUsername, room: trimmedRoom });
        roomUsers.get(trimmedRoom)?.add(trimmedUsername);

        const history = roomMessages.get(trimmedRoom) || [];
        socket.emit('history', { type: 'history', messages: history, room: trimmedRoom });

        const roomUsersList = Array.from(roomUsers.get(trimmedRoom) || []);
        socket.emit('users', { type: 'users', users: roomUsersList, room: trimmedRoom });

        io.to(trimmedRoom).emit('system', {
          type: 'system',
          text: `${trimmedUsername} joined the chat`,
          timestamp: new Date().toISOString(),
          room: trimmedRoom
        });

        io.to(trimmedRoom).emit('users', {
          type: 'users',
          users: roomUsersList,
          room: trimmedRoom
        });
      });

      socket.on('message', (data) => {
        const userData = connectedUsers.get(socket.id);
        if (!userData || !socket.room) return;

        const message = {
          type: 'message',
          username: userData.username,
          text: data.text.trim(),
          timestamp: new Date().toISOString(),
          room: socket.room
        };

        const history = roomMessages.get(socket.room) || [];
        history.push(message);
        if (history.length > 100) history.shift();
        roomMessages.set(socket.room, history);

        io.to(socket.room).emit('message', message);
      });

      socket.on('disconnect', () => {
        const userData = connectedUsers.get(socket.id);
        if (userData && socket.room) {
          const { username, room } = userData;
          connectedUsers.delete(socket.id);
          roomUsers.get(room)?.delete(username);
          io.to(room).emit('system', {
            type: 'system',
            text: `${username} left the chat`,
            timestamp: new Date().toISOString(),
            room: room
          });
          const roomUsersList = Array.from(roomUsers.get(room) || []);
          io.to(room).emit('users', { type: 'users', users: roomUsersList, room: room });
        }
      });
    });

    httpServer.listen(() => {
      port = httpServer.address().port;
      done();
    });
  });

  afterAll(() => {
    io.close();
    httpServer.close();
  });

  beforeEach((done) => {
    clientSocket1 = Client(`http://localhost:${port}`);
    clientSocket1.on('connect', () => {
      clientSocket2 = Client(`http://localhost:${port}`);
      clientSocket2.on('connect', () => {
        done();
      });
    });
  });

  afterEach((done) => {
    if (clientSocket1.connected) {
      clientSocket1.disconnect();
    }
    if (clientSocket2.connected) {
      clientSocket2.disconnect();
    }
    done();
  });

  test('should connect clients', (done) => {
    expect(clientSocket1.connected).toBe(true);
    expect(clientSocket2.connected).toBe(true);
    done();
  });

  test('should join a room with username', (done) => {
    clientSocket1.emit('join', { username: 'Alice', room: 'general' });
    
    clientSocket1.on('system', (data) => {
      expect(data.type).toBe('system');
      expect(data.text).toContain('Alice joined the chat');
      expect(data.room).toBe('general');
      done();
    });
  });

  test('should receive message history when joining', (done) => {
    clientSocket1.emit('join', { username: 'Alice', room: 'general' });
    
    clientSocket1.on('history', (data) => {
      expect(data.type).toBe('history');
      expect(data.room).toBe('general');
      expect(Array.isArray(data.messages)).toBe(true);
      done();
    });
  });

  test('should receive users list when joining', (done) => {
    clientSocket1.emit('join', { username: 'Alice', room: 'general' });
    
    clientSocket1.on('users', (data) => {
      expect(data.type).toBe('users');
      expect(data.room).toBe('general');
      expect(Array.isArray(data.users)).toBe(true);
      expect(data.users).toContain('Alice');
      done();
    });
  });

  test('should broadcast message to all users in room', (done) => {
    let joinCount = 0;
    const onJoin = () => {
      joinCount++;
      if (joinCount === 2) {
        clientSocket1.emit('message', { text: 'Hello everyone!' });
      }
    };

    clientSocket1.emit('join', { username: 'Alice', room: 'general' });
    clientSocket1.on('system', onJoin);
    
    clientSocket2.emit('join', { username: 'Bob', room: 'general' });
    clientSocket2.on('system', onJoin);

    let messageCount = 0;
    const onMessage = (data) => {
      messageCount++;
      expect(data.type).toBe('message');
      expect(data.username).toBe('Alice');
      expect(data.text).toBe('Hello everyone!');
      expect(data.room).toBe('general');
      
      if (messageCount === 2) {
        done();
      }
    };

    clientSocket1.on('message', onMessage);
    clientSocket2.on('message', onMessage);
  });

  test('should update users list when user joins', (done) => {
    clientSocket1.emit('join', { username: 'Alice', room: 'general' });
    
    clientSocket2.on('users', (data) => {
      if (data.users.includes('Bob')) {
        expect(data.users).toContain('Alice');
        expect(data.users).toContain('Bob');
        done();
      }
    });

    clientSocket1.on('users', () => {
      clientSocket2.emit('join', { username: 'Bob', room: 'general' });
    });
  });

  test('should notify when user leaves', (done) => {
    clientSocket1.emit('join', { username: 'Alice', room: 'general' });
    clientSocket2.emit('join', { username: 'Bob', room: 'general' });

    clientSocket2.on('system', (data) => {
      if (data.text.includes('left the chat')) {
        expect(data.type).toBe('system');
        expect(data.text).toContain('Alice');
        done();
      }
    });

    setTimeout(() => {
      clientSocket1.disconnect();
    }, 100);
  });

  test('should handle room switching', (done) => {
    clientSocket1.emit('join', { username: 'Alice', room: 'general' });
    
    clientSocket1.on('history', (data) => {
      if (data.room === 'random') {
        expect(data.room).toBe('random');
        done();
      }
    });

    clientSocket1.on('system', (data) => {
      if (data.room === 'general') {
        setTimeout(() => {
          clientSocket1.emit('join', { username: 'Alice', room: 'random' });
        }, 100);
      }
    });
  });

  test('should reject invalid username', (done) => {
    clientSocket1.emit('join', { username: '', room: 'general' });
    
    clientSocket1.on('error', (data) => {
      expect(data.type).toBe('error');
      done();
    });
  });

  test('should reject invalid room', (done) => {
    clientSocket1.emit('join', { username: 'Alice', room: 'invalid-room' });
    
    clientSocket1.on('error', (data) => {
      expect(data.type).toBe('error');
      expect(data.message).toContain('Invalid');
      done();
    });
  });
});

