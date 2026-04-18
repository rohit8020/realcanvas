# Installation & Setup Guide

## System Requirements

- **Node.js**: 16.x or higher
- **npm**: 7.x or higher
- **Docker & Docker Compose** (for containerized setup)
- **MongoDB**: 4.4+ (for local development only, not needed with Docker)
- **macOS, Linux, or Windows** (with WSL2 for Windows)

## Quick Start (5 minutes)

### Using Docker (Recommended)

```bash
# 1. Clone or download the repository
cd realcanvas

# 2. Start all services
npm run docker:up

# 3. Open in browser
# Frontend: http://localhost:5173
# Backend:  http://localhost:4000
```

Services will be automatically started:
- MongoDB on port 27017
- Express server on port 4000
- React frontend on port 5173

### Using Local Development

#### Prerequisites

- Node.js installed: [https://nodejs.org/](https://nodejs.org/)
- MongoDB running locally: [https://docs.mongodb.com/manual/installation/](https://docs.mongodb.com/manual/installation/)

#### Setup Steps

```bash
# 1. Navigate to project
cd realcanvas

# 2. Install dependencies
npm install

# 3. Create environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# 4. Start the server (Terminal 1)
cd server
npm run dev

# 5. Start the client (Terminal 2)
cd client
npm run dev

# 6. Open browser
# Frontend: http://localhost:5173
# Backend:  http://localhost:4000
```

## Environment Configuration

### Server (.env)

```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/realcanvas
CLIENT_URL=http://localhost:5173
```

**For Docker**: Use `mongodb://mongo:27017/realcanvas` (automatically configured)

### Client (.env)

```env
VITE_API_URL=http://localhost:4000
```

## Directory Structure

```
realcanvas/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── stores/        # Zustand state management
│   │   ├── services/      # API & Socket.IO services
│   │   ├── types/         # TypeScript type definitions
│   │   └── main.tsx       # Entry point
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── package.json
├── server/                # Express + Socket.IO backend
│   ├── src/
│   │   ├── models/        # MongoDB models
│   │   ├── services/      # Business logic
│   │   ├── socket/        # Socket.IO handlers
│   │   ├── types/         # TypeScript definitions
│   │   └── index.ts       # Server entry point
│   ├── Dockerfile
│   └── package.json
├── shared/                # Shared TypeScript types
│   └── types/
├── docker-compose.yml     # Docker services configuration
├── package.json           # Root monorepo configuration
├── README.md
└── CONTRIBUTING.md
```

## Common Tasks

### Development

```bash
# Start all services in watch mode
npm run dev

# Build for production
npm run build

# Run tests
npm test --workspaces

# Format code
npm run format  # (if configured)
```

### Docker

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs

# Rebuild images (important for code changes)
npm run docker:up --build

# Access database
docker exec -it realcanvas-mongo mongosh
```

### Server Only

```bash
cd server

# Development mode with auto-reload
npm run dev

# Build TypeScript
npm run build

# Start compiled version
npm start

# Run tests
npm test
```

### Client Only

```bash
cd client

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

## Troubleshooting

### "Cannot find module" errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Port already in use

```bash
# Find process using port
lsof -i :5173  # Frontend
lsof -i :4000  # Backend
lsof -i :27017 # MongoDB

# Kill process (macOS/Linux)
kill -9 <PID>
```

### MongoDB connection failed (Local)

```bash
# Start MongoDB service
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or run in Docker
docker run -d -p 27017:27017 mongo:latest
```

### Docker issues

```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild everything
docker-compose up --build

# Check Docker logs
docker-compose logs -f
```

### Socket.IO connection refused

1. Check backend is running: `curl http://localhost:4000/health`
2. Verify `CLIENT_URL` in server `.env` matches your domain
3. Check browser console for connection errors
4. Ensure backend and frontend can communicate

### TypeScript compilation errors

```bash
# Clear build cache
rm -rf client/dist server/dist

# Rebuild
npm run build
```

## Performance Optimization

### Development

- Use Vite for fast hot module replacement
- Keep Chrome DevTools closed when not debugging
- Clear browser cache: DevTools → Application → Clear all

### Production

- Build: `npm run build`
- Use `npm run preview` to test production build
- Optimize images and assets
- Enable gzip compression in reverse proxy

## Next Steps

1. **Create a room**: Click "Create New Board"
2. **Invite others**: Share the room ID
3. **Start drawing**: Use the toolbar to select tools
4. **Collaborate**: See live cursors and changes
5. **Save work**: Refresh the page to reload your board

## Getting Help

- Check [README.md](README.md) for feature documentation
- Read [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Review inline code comments for implementation details
- Check browser console for error messages

## Production Deployment

See [README.md](README.md) "Production Considerations" section for deployment guidelines.
