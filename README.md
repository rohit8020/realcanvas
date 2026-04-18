# RealCanvas - Collaborative Whiteboard

A real-time collaborative whiteboard application built with the MERN stack (MongoDB, Express, React, Node.js) using Socket.IO for instant collaboration.

## Features

- 🎨 **Full-featured drawing tools**: pen, rectangle, ellipse, text, sticky notes, eraser
- 🖱️ **Object selection and manipulation**: select, move, delete objects
- ↩️ **Undo/Redo**: Local history for user-created operations
- 👥 **Live collaboration**: See remote cursors with usernames and stable colors
- 💾 **Persistent storage**: All drawings saved to MongoDB
- 📤 **Export**: Download board as PNG image
- 📱 **Responsive UI**: Works on desktop and tablets
- 🐳 **Docker ready**: Easy deployment with Docker Compose

## Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Fast build tool
- **react-konva** - Canvas rendering
- **Zustand** - State management
- **Socket.IO Client** - Real-time communication

### Backend
- **Express** - Web framework
- **Socket.IO** - Real-time events
- **MongoDB** + **Mongoose** - Data persistence
- **Node.js** with **TypeScript**

### Infrastructure
- **Docker** & **Docker Compose** - Containerization
- Shared TypeScript types between frontend and backend

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs
```

Services will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- MongoDB: localhost:27017

### Option 2: Local Development

#### Prerequisites
- Node.js 16+
- MongoDB running locally

#### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**

Create `.env` files:

**server/.env**
```
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/realcanvas
CLIENT_URL=http://localhost:5173
```

**client/.env**
```
VITE_API_URL=http://localhost:4000
```

3. **Start development servers**

```bash
# Terminal 1: Start server
cd server && npm run dev

# Terminal 2: Start client
cd client && npm run dev
```

## Project Structure

```
realcanvas/
├── shared/
│   └── types/
│       └── index.ts              # Shared TypeScript interfaces
├── server/
│   ├── src/
│   │   ├── models/
│   │   │   └── Room.ts          # MongoDB schemas & operations
│   │   ├── services/
│   │   │   └── RoomService.ts   # Room/user management
│   │   ├── socket/
│   │   │   └── handlers.ts      # Socket.IO event handlers
│   │   └── index.ts             # Express app & server setup
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env.example
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas.tsx       # Main drawing canvas
│   │   │   ├── Toolbar.tsx      # Tool selection & controls
│   │   │   ├── RemoteCursors.tsx # Remote user presence
│   │   │   └── RoomJoinScreen.tsx # Room creation/joining
│   │   ├── stores/
│   │   │   ├── BoardStore.ts    # Board state & operations
│   │   │   ├── UIStore.ts       # Tool/color selection state
│   │   │   └── PresenceStore.ts # User presence state
│   │   ├── services/
│   │   │   ├── SocketService.ts # Socket.IO client
│   │   │   └── ApiService.ts    # REST API calls
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── docker-compose.yml
├── package.json
└── README.md
```

## API Endpoints

### REST API

- `GET /health` - Server health check
- `POST /api/rooms` - Create a new room
  - Returns: `{ roomId: string }`
- `GET /api/rooms/:roomId` - Get room state and objects
  - Returns: `{ id, objects, users }`

## Socket.IO Events

### Client → Server
- `room:join` - Join a room
  - Payload: `{ roomId, userName, userId }`
- `board:object:add` - Add a drawing object
  - Payload: `{ object: BoardObject }`
- `board:object:update` - Update an object
  - Payload: `{ objectId, updates }`
- `board:object:delete` - Delete an object
  - Payload: `{ objectId }`
- `board:clear` - Clear entire board
  - Payload: `{ timestamp }`
- `presence:cursor` - Update cursor position
  - Payload: `{ userId, userName, x, y }`

### Server → Client
- `room:state` - Send room state on join
  - Payload: `{ roomId, objects, users }`
- `board:object:add` - Broadcast object addition
- `board:object:update` - Broadcast object update
- `board:object:delete` - Broadcast object deletion
- `board:clear` - Broadcast board clear
- `presence:update` - Broadcast user list update
- `presence:cursor` - Broadcast cursor movement
- `presence:left` - User disconnected

## Drawing Tools

| Tool | Description | Hotkey |
|------|-------------|--------|
| Select | Select and interact with objects | `→` |
| Pen | Draw freehand lines | `✏️` |
| Rectangle | Draw rectangles | `▭` |
| Ellipse | Draw circles/ellipses | `◯` |
| Text | Add text | `T` |
| Sticky Note | Add sticky notes | `📝` |
| Eraser | Erase objects | `⌫` |

## Keyboard Shortcuts

- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Y` / `Cmd+Y` - Redo
- `Delete` - Delete selected object

## How It Works

1. **Join a Room**: Create a new board or join existing with room ID
2. **Set Display Name**: Choose a display name for presence
3. **Draw**: Use toolbar to select tools, colors, and stroke width
4. **Collaborate**: See other users' cursors and drawings in real-time
5. **Persist**: All objects are saved to MongoDB and loaded on page refresh
6. **Export**: Download the entire board as a PNG image

## State Management

### Board State (Zustand)
- `objects`: All drawing objects in the room
- `selectedObjectId`: Currently selected object
- `undoStack` / `redoStack`: Local undo/redo history
- Operations: add, update, delete, clear, undo, redo

### UI State (Zustand)
- `currentTool`: Selected drawing tool
- `currentColor`: Selected color
- `strokeWidth`: Line thickness
- `fontSize`: Text size

### Presence State (Zustand)
- `roomId`: Current room ID
- `userId`: Current user ID
- `userName`: Display name
- `users`: List of connected users with cursors

## Real-time Sync

- **Board State**: All object changes broadcast to all users in the room via Socket.IO
- **Cursor Position**: Throttled (50ms) cursor updates for smooth remote cursor tracking
- **Undo/Redo**: Local only - sends inverse operations to keep all clients synchronized
- **Persistence**: Objects saved to MongoDB after meaningful changes

## Production Considerations

For a production deployment:

1. **Authentication**: Add user accounts and JWT authentication
2. **Authorization**: Implement room access control
3. **Performance**: Use Redis for caching and session management
4. **Scalability**: Implement Socket.IO adapters for multiple server instances
5. **CRDT**: Consider Yjs or similar for advanced conflict resolution
6. **Security**: Add input validation, rate limiting, CORS hardening
7. **Monitoring**: Add logging, error tracking, and metrics

## Testing

```bash
# Run tests
npm test --workspaces

# Run with coverage
npm test -- --coverage --workspaces
```

## Troubleshooting

### Port already in use
```bash
# Kill process on port
lsof -i :5173  # frontend
lsof -i :4000  # backend
lsof -i :27017 # mongodb
```

### MongoDB connection failed
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Use Docker: `docker run -d -p 27017:27017 mongo`

### Socket.IO connection refused
- Check backend is running: `curl http://localhost:4000/health`
- Verify `CLIENT_URL` matches your domain
- Check browser console for connection errors

## Future Enhancements

- [ ] Real-time collaborative text editing
- [ ] Voice/video chat integration
- [ ] Rich text formatting
- [ ] Drawing templates and shapes library
- [ ] Board versioning and history
- [ ] Permission-based access control
- [ ] Dark mode
- [ ] Mobile app native versions
- [ ] AI-powered shape recognition
- [ ] CRDT-based conflict resolution

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
