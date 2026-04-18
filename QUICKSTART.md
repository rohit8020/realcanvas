# RealCanvas Quick Reference

## 🚀 Quick Start

```bash
# Option 1: Docker (Recommended)
npm run docker:up

# Option 2: Local Development
npm install
npm run dev

# Access
# Frontend: http://localhost:5173
# Backend:  http://localhost:4000
```

## 📦 Common Commands

### Development
```bash
npm run dev              # Start both services
npm run build            # Build both services
npm test --workspaces   # Run all tests
```

### Docker
```bash
npm run docker:up       # Start all services
npm run docker:down     # Stop all services
npm run docker:logs     # View logs
```

### Server Only
```bash
cd server
npm run dev             # Start with auto-reload
npm run build           # Compile TypeScript
npm start               # Run compiled version
npm test                # Run tests
```

### Client Only
```bash
cd client
npm run dev             # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm test                # Run tests
```

## 🎨 Drawing Tools

| Tool | Shortcut | Action |
|------|----------|--------|
| Select | → | Select and move objects |
| Pen | ✏️ | Draw freehand lines |
| Rectangle | ▭ | Draw rectangles |
| Ellipse | ◯ | Draw circles/ellipses |
| Text | T | Add text labels |
| Sticky Note | 📝 | Add sticky notes |
| Eraser | ⌫ | Delete objects |

## ⌨️ Keyboard Shortcuts

```
Ctrl/Cmd + Z    Undo
Ctrl/Cmd + Y    Redo
Delete          Delete selected object
```

## 📁 Project Structure

```
realcanvas/
├── client/              React + Vite + Konva
├── server/              Express + Socket.IO
├── shared/              Shared TypeScript types
├── docker-compose.yml   Docker services
├── package.json         Root monorepo config
├── README.md            Full documentation
├── INSTALLATION.md      Setup guide
└── CONTRIBUTING.md      Development guide
```

## 🔌 API Endpoints

```
GET  /health                    Server status
POST /api/rooms                 Create room
GET  /api/rooms/:roomId         Get room state
```

## 💾 Environment Variables

### Server (.env)
```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/realcanvas
CLIENT_URL=http://localhost:5173
```

### Client (.env)
```env
VITE_API_URL=http://localhost:4000
```

## 🐛 Troubleshooting

```bash
# Clear everything and restart
rm -rf node_modules dist
npm install
npm run build

# Check if services are running
curl http://localhost:4000/health  # Backend
curl http://localhost:5173         # Frontend

# Docker cleanup
docker-compose down -v
docker-compose up --build
```

## 📊 Tech Stack

**Frontend**: React 18 + TypeScript + Vite + Konva + Zustand + Socket.IO
**Backend**: Express + Socket.IO + MongoDB + Mongoose + TypeScript
**Infra**: Docker + Docker Compose + Node 18

## 🔗 Resources

- [Full README](README.md) - Detailed documentation
- [Installation Guide](INSTALLATION.md) - Step-by-step setup
- [Contributing Guide](CONTRIBUTING.md) - Development workflow
- [Implementation Details](IMPLEMENTATION.md) - Technical overview

## 💡 Tips

- Share room ID with others for collaboration
- Cursors update live without saving
- Refresh page to reload saved board
- Close browser to disconnect gracefully
- Docker handles all service setup automatically

## 🎯 Features

✅ Real-time collaboration
✅ 7 drawing tools
✅ Undo/Redo support
✅ Live cursor tracking
✅ Board persistence
✅ PNG export
✅ Color selection
✅ Stroke width control
✅ Docker ready
✅ Full TypeScript support

---

**Ready to build?** See [INSTALLATION.md](INSTALLATION.md)

**Want to contribute?** See [CONTRIBUTING.md](CONTRIBUTING.md)

**Need details?** See [README.md](README.md)
