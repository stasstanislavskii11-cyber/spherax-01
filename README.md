# SpheraX Chat App

A modern, real-time chat web application built with Node.js, Express, Socket.IO, and React. Features multiple chat rooms, user management, message history, and a clean, responsive UI.

## 🚀 Quick Start (Docker)

### Prerequisites
- Docker and Docker Compose installed
- Git

### One-Command Launch

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd Spherax-Chat-App
```

2. **Launch everything:**
```bash
docker-compose up --build
```

3. **Access the application:**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:3001/health

4. **Stop the application:**
```bash
docker-compose down
```

That's it! The entire application will build and start automatically.

## 🛠 Tech Stack

### Backend
- **Node.js** (v20)
- **Express** - HTTP server framework
- **Socket.IO** - WebSocket library for real-time communication
- **CORS** - Cross-origin resource sharing
- **Jest** - Testing framework

### Frontend
- **React** (v19.2.0) - UI library
- **Socket.IO Client** - WebSocket client library
- **React Context API** - State management
- **CSS3** - Styling
- **React Testing Library** - Component testing

## 📁 Project Structure

```
Spherax-Chat-App/
├── server/                      # Backend server
│   ├── server.js                # Entry point (redirects to src/server.js)
│   ├── server.test.js           # Integration tests
│   ├── jest.config.js           # Jest configuration
│   ├── package.json             # Server dependencies
│   ├── Dockerfile               # Server Docker configuration
│   └── src/                     # Modular server code
│       ├── server.js            # Main server file
│       ├── config/              # Configuration files
│       │   ├── constants.js    # App constants (rooms, limits)
│       │   └── socketConfig.js # Socket.IO configuration
│       ├── handlers/            # Socket event handlers
│       │   ├── socketHandlers.js
│       │   ├── joinHandler.js
│       │   ├── messageHandler.js
│       │   └── disconnectHandler.js
│       ├── models/              # Data models
│       │   ├── UserStore.js    # User management
│       │   └── MessageStore.js # Message storage
│       ├── routes/              # Express routes
│       │   ├── index.js
│       │   ├── health.js       # Health check endpoint
│       │   ├── rooms.js        # Rooms endpoint
│       │   └── users.js        # Users endpoint
│       └── services/            # Business logic
│           ├── broadcastService.js
│           ├── messageService.js
│           ├── roomService.js
│           └── userService.js
│
├── client/                      # Frontend React application
│   ├── src/
│   │   ├── App.js              # Main app component
│   │   ├── App.css             # App styles
│   │   ├── index.js            # React entry point
│   │   ├── index.css           # Global styles
│   │   ├── components/         # React components
│   │   │   ├── Chat/           # Chat components
│   │   │   │   ├── ChatContainer.jsx
│   │   │   │   ├── ChatHeader.jsx
│   │   │   │   ├── ChatSidebar.jsx
│   │   │   │   ├── ChatContent.jsx
│   │   │   │   ├── MessageList.jsx
│   │   │   │   ├── MessageItem.jsx
│   │   │   │   ├── MessageForm.jsx
│   │   │   │   └── Chat.css
│   │   │   ├── RoomList/       # Room selection
│   │   │   │   ├── RoomList.jsx
│   │   │   │   └── RoomList.css
│   │   │   ├── UserList/       # Online users
│   │   │   │   ├── UserList.jsx
│   │   │   │   ├── UserItem.jsx
│   │   │   │   └── UserList.css
│   │   │   └── UsernameForm/   # Username input
│   │   │       ├── UsernameForm.jsx
│   │   │       ├── UsernameForm.css
│   │   │       └── UsernameForm.test.jsx
│   │   ├── contexts/           # React Context
│   │   │   └── ChatContext.js # Main chat context
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useSocket.js   # Socket.IO hook
│   │   │   └── useLocalStorage.js
│   │   ├── services/           # Client services
│   │   │   ├── socketService.js
│   │   │   ├── messageService.js
│   │   │   ├── storageService.js
│   │   │   └── *.test.js       # Service tests
│   │   ├── utils/              # Utility functions
│   │   │   ├── constants.js
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   └── *.test.js       # Utility tests
│   │   └── setupTests.js       # Test configuration
│   ├── public/                 # Static assets
│   ├── package.json            # Client dependencies
│   ├── Dockerfile              # Client Docker configuration
│   └── nginx.conf              # Nginx configuration
│
├── docker-compose.yml          # Docker Compose configuration
└── README.md                   # This file
```

## 🏃 Local Setup & Run

### Prerequisites
- Node.js (v20 or LTS version)
- npm (comes with Node.js)

### Step-by-Step Instructions

#### 1. Clone the repository
```bash
git clone <repo-url>
cd Spherax-Chat-App
```

#### 2. Install dependencies

**Install server dependencies:**
```bash
cd server
npm install
```

**Install client dependencies:**
```bash
cd ../client
npm install
```

#### 3. Start the backend server

From the `server` directory:
```bash
npm run dev    # Development mode with nodemon (auto-restart)
```

Or for production:
```bash
npm start      # Production mode
```

The server will start on `http://localhost:3001` (or the port specified in `PORT` environment variable).

You should see:
```
Server running on port 3001
Health check: http://localhost:3001/health
```

#### 4. Start the frontend (in a new terminal)

From the `client` directory:
```bash
npm start
```

The React app will start on `http://localhost:3000` and automatically open in your browser.

#### 5. Test the application

1. Open `http://localhost:3000` in your browser
2. Enter a username and click "Join Chat"
3. Open another browser tab/window and join with a different username
4. Switch between different rooms (Global, General, Random, Tech, Gaming)
5. Send messages and see them appear in real-time across all connected clients
6. Check the online users list in the sidebar
7. Close a tab to see the "left the chat" system message

## ⚙️ Environment Variables

### Server
- `PORT` - Server port (default: 3001)
- `CLIENT_URL` - Frontend URL for CORS (default: http://localhost:3000)

### Client
- `REACT_APP_SERVER_URL` - Backend server URL (default: http://localhost:3001)

## 📡 API & WebSocket Protocol

### HTTP Endpoints

#### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

#### GET /rooms
Get list of available chat rooms.

**Response:**
```json
{
  "rooms": ["global", "general", "random", "tech", "gaming"]
}
```

#### GET /users
Get list of all users across all rooms.

**Response:**
```json
{
  "users": ["Alice", "Bob", "Charlie"]
}
```

### WebSocket Protocol

The application uses Socket.IO for WebSocket communication. All messages are JSON objects.

#### Client → Server Events

**Join Chat**
```javascript
socket.emit('join', {
  username: "Alice",
  room: "general"  // Optional, defaults to "general"
});
```

**Send Message**
```javascript
socket.emit('message', {
  text: "Hello everyone!"
});
```

#### Server → Client Events

**Chat Message**
```json
{
  "type": "message",
  "username": "Alice",
  "text": "Hello everyone!",
  "timestamp": "2025-01-20T09:31:00.000Z",
  "room": "general"
}
```

**System Event (Join/Leave)**
```json
{
  "type": "system",
  "text": "Alice joined the chat",
  "timestamp": "2025-01-20T09:31:05.000Z",
  "room": "general"
}
```

**Message History**
```json
{
  "type": "history",
  "messages": [
    {
      "type": "message",
      "username": "Bob",
      "text": "Previous message",
      "timestamp": "2025-01-20T09:30:00.000Z",
      "room": "general"
    }
  ],
  "room": "general"
}
```

**Users List**
```json
{
  "type": "users",
  "users": ["Alice", "Bob", "Charlie"],
  "room": "general"
}
```

**Error**
```json
{
  "type": "error",
  "message": "Username is required"
}
```

### Socket.IO Events Summary

**Client → Server:**
- `connect` - Client connects to server
- `join` - Client sends join request with username and optional room
- `message` - Client sends chat message

**Server → Client:**
- `connect` - Connection established
- `disconnect` - Connection lost
- `message` - Server broadcasts chat message
- `system` - Server sends system notification (join/leave)
- `history` - Server sends message history when user joins (last 100 messages)
- `users` - Server sends updated users list for a room
- `error` - Server sends error message

## ✨ Features

### Core Features
✅ **Username Input** - Users must enter a username before joining the chat  
✅ **Multiple Chat Rooms** - Switch between 5 rooms: Global, General, Random, Tech, Gaming  
✅ **Real-time Messaging** - Messages broadcast instantly to all connected users in the same room  
✅ **System Events** - Automatic notifications when users join or leave  
✅ **Message Timestamps** - Each message includes a server-side timestamp  
✅ **Connection Status** - Visual indicator showing connection state (connected/disconnected badge)  
✅ **Error Handling** - Graceful handling of disconnects and invalid messages  
✅ **Responsive Design** - Works on desktop and mobile devices  
✅ **Logout Functionality** - Users can logout and rejoin with a different username  

### Bonus Features
✅ **Online Users List** - See who's currently online in each room (displayed in sidebar)  
✅ **Message History** - New users receive the last 100 messages when joining a room (in-memory storage)  
✅ **Room Switching** - Seamlessly switch between different chat rooms  
✅ **User Icons** - Visual user avatars with initial letters  
✅ **Modular Architecture** - Clean separation of concerns with handlers, services, and models  
✅ **Unit/Integration Tests** - Comprehensive test suite for WebSocket functionality  
✅ **Docker Support** - One-command startup with Docker Compose  
✅ **Local Storage** - Username and room preferences persist across sessions  
✅ **Page Reload Detection** - Handles page reloads gracefully without duplicate join messages  

## 📝 Message Format

All messages include:
- **Type** - `message`, `system`, `history`, `users`, or `error`
- **Text** - Message content (for message and system types)
- **Username** - Sender username (for chat messages only)
- **Timestamp** - ISO 8601 formatted timestamp
- **Room** - Room name where the message was sent/received

## 🛡️ Error Handling

The application handles:
- Missing or invalid usernames
- Empty messages
- Duplicate usernames (within the same room)
- Client disconnections
- Server errors
- Invalid room names
- Network failures

All errors are logged to the server console and sent to the client when appropriate.

## 🔄 Graceful Shutdown

The server handles `SIGTERM` and `SIGINT` signals for graceful shutdown, closing all connections before exiting.

## 💻 Development

### Server Development
```bash
cd server
npm run dev  # Uses nodemon for auto-restart on file changes
```

### Client Development
```bash
cd client
npm start  # React development server with hot reload
```

## 🧪 Testing

### Manual Testing

To test the application:
1. Start both server and client
2. Open multiple browser tabs/windows
3. Join with different usernames
4. Switch between different rooms
5. Send messages and verify real-time updates
6. Check that online users list updates correctly
7. Verify message history appears when joining a room
8. Test disconnection by closing tabs
9. Test error cases (empty username, duplicate username, invalid room, etc.)
10. Test logout functionality
11. Test page reload (should not show duplicate join messages)

### Automated Tests

**Server Tests:**
```bash
cd server
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
```

The server test suite includes:
- Connection handling
- Room joining and switching
- Message broadcasting
- Users list updates
- Message history
- Error handling
- Disconnection handling

**Client Tests:**
```bash
cd client
npm test              # Run tests once
npm test -- --watch   # Run tests in watch mode
```

The client test suite includes:
- Component tests (UsernameForm)
- Service tests (messageService, storageService)
- Utility tests (formatters, validators)

## 🐳 Docker Setup

### Prerequisites
- Docker and Docker Compose installed

### Quick Start with Docker

1. **Build and start all services:**
```bash
docker-compose up --build
```

2. **Access the application:**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:3001

3. **Stop the services:**
```bash
docker-compose down
```

4. **View logs:**
```bash
docker-compose logs -f              # All services
docker-compose logs -f server        # Server only
docker-compose logs -f client        # Client only
```

The Docker setup includes:
- **Server container** - Node.js backend on port 3001
- **Client container** - React frontend built and served via Nginx on port 80
- **Automatic networking** - Services communicate via Docker network
- **Health checks** - Server health monitoring

### Docker Development

To rebuild after code changes:
```bash
docker-compose up --build
```

To run in detached mode:
```bash
docker-compose up -d
```

## 🔧 Troubleshooting

**Port already in use:**
- Change the `PORT` environment variable for the server
- Update `REACT_APP_SERVER_URL` in the client if needed
- For Docker, modify port mappings in `docker-compose.yml`

**Connection issues:**
- Ensure the server is running before starting the client
- Check that CORS is properly configured
- Verify the server URL in the client matches the server port
- For Docker, ensure both containers are running: `docker-compose ps`
- Check browser console for WebSocket connection errors

**Messages not appearing:**
- Check browser console for errors
- Verify WebSocket connection in browser DevTools (Network tab → WS)
- Ensure both server and client are running
- Check that you're in the correct room
- Verify messages are being sent to the correct room

**Docker issues:**
- Ensure Docker and Docker Compose are installed and running
- Check container logs: `docker-compose logs server` or `docker-compose logs client`
- Rebuild containers if code changes aren't reflected: `docker-compose up --build`
- Check if ports 80 and 3001 are already in use: `netstat -ano | findstr :80` (Windows) or `lsof -i :80` (Mac/Linux)

**Duplicate join messages:**
- This is handled automatically with a reconnect window (1.5 seconds)
- If you see duplicates, check server logs for connection issues

## 📊 Architecture

### Backend Architecture
- **Modular Design** - Separated into config, handlers, models, routes, and services
- **Event-Driven** - Socket.IO event handlers for real-time communication
- **In-Memory Storage** - UserStore and MessageStore for managing state
- **Service Layer** - Business logic separated into service modules

### Frontend Architecture
- **React Context API** - Centralized state management via ChatContext
- **Custom Hooks** - Reusable logic (useSocket, useLocalStorage)
- **Component-Based** - Modular, reusable components
- **Service Layer** - Client-side services for socket, messages, and storage

## 📄 License

ISC
