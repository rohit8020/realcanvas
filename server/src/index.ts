import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { setupSocketIO } from './socket/handlers.js';
import { getRoomState } from './services/RoomService.js';
import { getRoomOrCreate, getBoardObjects } from './models/Room.js';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Create a new room
app.post('/api/rooms', async (req: Request, res: Response) => {
  try {
    const roomId = uuidv4();
    await getRoomOrCreate(roomId);
    res.json({ roomId });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Get room state
app.get('/api/rooms/:roomId', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const room = await getRoomState(roomId);
    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// Setup Socket.IO handlers
setupSocketIO(io);

// Database connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/realcanvas';

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const PORT = process.env.PORT || 4000;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { app, io };
