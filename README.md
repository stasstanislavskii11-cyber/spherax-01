# SpheraX: Backend Challenge - WebSocket Chat Application

A simple real-time chat web application built with Node.js, Express, Socket.IO, and React.

## Tech Stack

### Backend
- **Node.js** (LTS 24.x)
- **Express** - HTTP server framework
- **Socket.IO** - WebSocket library for real-time communication
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Socket.IO Client** - WebSocket client library
- **CSS3** - Styling

## Project Structure

```
spherax-backend-challenge/
├── server/                 # Backend server code
│   ├── server.js          # Main server file with Express and Socket.IO
│   ├── package.json       # Server dependencies
│   └── .gitignore
├── client/                # Frontend React application
│   ├── src/
│   │   ├── App.js        # Main chat component
│   │   ├── App.css       # Chat styles
│   │   └── index.js      # React entry point
│   ├── public/           # Static assets
│   ├── package.json      # Client dependencies
│   └── .gitignore
└── README.md             # This file
```

## Local Setup & Run

### Prerequisites
- Node.js (LTS version, e.g., 24.x)
- npm (comes with Node.js)

### Step-by-Step Instructions

#### 1. Clone the repository
```bash
git clone <repo-url>
cd spherax-backend-challenge
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
npm run dev
```

Or for production:
```bash
npm start
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
4. Send messages and see them appear in real-time across all connected clients
5. Close a tab to see the "left the chat" system message

## Environment Variables

### Server
- `PORT` - Server port (default: 3001)
- `CLIENT_URL` - Frontend URL for CORS (default: http://localhost:3000)

### Client
- `REACT_APP_SERVER_URL` - Backend server URL (default: http://localhost:3001)

## API & WebSocket Protocol

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
  "rooms": ["general", "random", "tech", "gaming"]
}
```

### WebSocket Protocol

The application uses Socket.IO for WebSocket communication. All messages are JSON objects.

#### Client → Server

**Join Chat**
```json
{
  "type": "join",
  "username": "Alice",
  "room": "general"
}
```

Note: `room` is optional and defaults to "general" if not provided.

**Send Message**
```json
{
  "type": "message",
  "text": "Hello everyone!"
}
```

#### Server → Client

**Chat Message**
```json
{
  "type": "message",
  "username": "Alice",
  "text": "Hello everyone!",
  "timestamp": "2025-11-20T09:31:00.000Z",
  "room": "general"
}
```

**System Event (Join/Leave)**
```json
{
  "type": "system",
  "text": "Alice joined the chat",
  "timestamp": "2025-11-20T09:31:05.000Z",
  "room": "general"
}
```

**Message History**
```json
{
  "type": "history",
  "messages": [...],
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

### Socket.IO Events

**Client → Server:**
- `connect` - Client connects to server
- `join` - Client sends join request with username and optional room
- `message` - Client sends chat message

**Server → Client:**
- `connect` - Connection established
- `disconnect` - Connection lost
- `message` - Server broadcasts chat message
- `system` - Server sends system notification (join/leave)
- `history` - Server sends message history when user joins
- `users` - Server sends updated users list for a room
- `error` - Server sends error message

## Features

### Core Features
✅ **Username Input** - Users must enter a username before joining the chat  
✅ **Multiple Chat Rooms** - Switch between different rooms (General, Random, Tech, Gaming)  
✅ **Real-time Messaging** - Messages broadcast instantly to all connected users in the same room  
✅ **System Events** - Automatic notifications when users join or leave  
✅ **Message Timestamps** - Each message includes a server-side timestamp  
✅ **Connection Status** - Visual indicator showing connection state  
✅ **Error Handling** - Graceful handling of disconnects and invalid messages  
✅ **Responsive Design** - Works on desktop and mobile devices  

### Bonus Features
✅ **Online Users List** - See who's currently online in each room  
✅ **Message History** - New users receive the last 100 messages when joining a room (in-memory)  
✅ **Room Switching** - Seamlessly switch between different chat rooms  
✅ **Unit/Integration Tests** - Comprehensive test suite for WebSocket functionality  
✅ **Docker Support** - One-command startup with Docker Compose  

## Message Format

All messages include:
- **Type** - `message`, `system`, or `error`
- **Text** - Message content
- **Username** - Sender username (for chat messages only)
- **Timestamp** - ISO 8601 formatted timestamp

## Error Handling

The application handles:
- Missing or invalid usernames
- Empty messages
- Duplicate usernames
- Client disconnections
- Server errors

All errors are logged to the server console and sent to the client when appropriate.

## Graceful Shutdown

The server handles `SIGTERM` and `SIGINT` signals for graceful shutdown, closing all connections before exiting.

## Development

### Server Development
```bash
cd server
npm run dev  # Uses nodemon for auto-restart
```

### Client Development
```bash
cd client
npm start  # React development server with hot reload
```

## Testing

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

### Automated Tests

Run the test suite:

```bash
cd server
npm test
```

Or in watch mode:

```bash
npm run test:watch
```

The test suite includes:
- Connection handling
- Room joining and switching
- Message broadcasting
- Users list updates
- Message history
- Error handling
- Disconnection handling

## Docker Setup (One-Command Startup)

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
docker-compose logs -f
```

The Docker setup includes:
- **Server container** - Node.js backend on port 3001
- **Client container** - React frontend served via Nginx on port 80
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

## Troubleshooting

**Port already in use:**
- Change the `PORT` environment variable for the server
- Update `REACT_APP_SERVER_URL` in the client if needed
- For Docker, modify port mappings in `docker-compose.yml`

**Connection issues:**
- Ensure the server is running before starting the client
- Check that CORS is properly configured
- Verify the server URL in the client matches the server port
- For Docker, ensure both containers are running: `docker-compose ps`

**Messages not appearing:**
- Check browser console for errors
- Verify WebSocket connection in browser DevTools
- Ensure both server and client are running
- Check that you're in the correct room

**Docker issues:**
- Ensure Docker and Docker Compose are installed and running
- Check container logs: `docker-compose logs server` or `docker-compose logs client`
- Rebuild containers if code changes aren't reflected: `docker-compose up --build`

## Project Structure

```
spherax-backend-challenge/
├── server/                 # Backend server code
│   ├── server.js          # Main server file with Express and Socket.IO
│   ├── server.test.js     # Integration tests
│   ├── package.json       # Server dependencies
│   ├── Dockerfile         # Server Docker configuration
│   └── .dockerignore
├── client/                # Frontend React application
│   ├── src/
│   │   ├── App.js        # Main chat component
│   │   ├── App.css       # Chat styles
│   │   └── index.js      # React entry point
│   ├── public/           # Static assets
│   ├── package.json      # Client dependencies
│   ├── Dockerfile        # Client Docker configuration
│   ├── nginx.conf        # Nginx configuration for production
│   └── .dockerignore
├── docker-compose.yml     # Docker Compose configuration
├── .dockerignore          # Docker ignore file
└── README.md             # This file
```

## License

ISC
