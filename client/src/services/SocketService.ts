import { io, Socket } from 'socket.io-client';
import { useBoardStore } from '../stores/BoardStore.js';
import { usePresenceStore } from '../stores/PresenceStore.js';
import type {
  RoomStatePayload,
  BoardObjectAddPayload,
  BoardObjectUpdatePayload,
  BoardObjectDeletePayload,
  PresenceUpdatePayload,
  PresenceLeftPayload,
  PresenceCursorPayload,
  BoardClearPayload,
} from '../types/index.js';

let socket: Socket | null = null;
let cursorThrottleTime = 0;
let drawingThrottleTime = 0;
const CURSOR_THROTTLE_MS = 16; // ~60fps for real-time cursor tracking
const DRAWING_THROTTLE_MS = 16; // ~60fps for real-time drawing

export function initializeSocket(apiUrl: string): Socket {
  if (socket) {
    console.log('[SocketService] Socket already initialized');
    return socket;
  }

  console.log('[SocketService] Initializing socket with URL:', apiUrl);
  socket = io(apiUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket!.on('connect', () => {
    console.log('[SocketService] Socket connected:', socket!.id);
  });

  socket!.on('disconnect', () => {
    console.log('[SocketService] Socket disconnected');
  });

  socket!.on('room:state', (payload: RoomStatePayload) => {
    const boardStore = useBoardStore.getState();
    const presenceStore = usePresenceStore.getState();

    boardStore.setObjects(payload.objects);
    presenceStore.setUsers(payload.users);
  });

  socket!.on('board:object:add', (payload: BoardObjectAddPayload) => {
    const boardStore = useBoardStore.getState();
    boardStore.applyRemoteObjectAdd(payload.object);
  });

  socket!.on('board:object:update', (payload: BoardObjectUpdatePayload) => {
    const boardStore = useBoardStore.getState();
    boardStore.applyRemoteObjectUpdate(payload.objectId, payload.updates);
  });

  socket!.on('board:object:delete', (payload: BoardObjectDeletePayload) => {
    const boardStore = useBoardStore.getState();
    boardStore.applyRemoteObjectDelete(payload.objectId);
  });

  socket!.on('board:clear', () => {
    const boardStore = useBoardStore.getState();
    boardStore.applyRemoteClear();
  });

  socket!.on('presence:update', (payload: PresenceUpdatePayload) => {
    const presenceStore = usePresenceStore.getState();
    presenceStore.setUsers(payload.users);
  });

  socket!.on('presence:cursor', (payload: PresenceCursorPayload) => {
    console.log('[SocketService] Received presence:cursor:', payload);
    const presenceStore = usePresenceStore.getState();
    presenceStore.updateUserCursor(payload.userId, payload.x, payload.y);
  });

  socket!.on('presence:left', (payload: PresenceLeftPayload) => {
    const presenceStore = usePresenceStore.getState();
    presenceStore.removeUser(payload.userId);
  });

  socket!.on('error', (error: any) => {
    console.error('Socket error:', error);
  });

  return socket;
}

export function joinRoom(roomId: string, userName: string, userId: string) {
  if (!socket) {
    throw new Error('Socket not initialized');
  }

  const presenceStore = usePresenceStore.getState();
  presenceStore.setRoom(roomId, userId, userName);

  socket.emit('room:join', {
    roomId,
    userName,
    userId,
  });

  const boardStore = useBoardStore.getState();
  boardStore.setSocket(socket);
  boardStore.setUserId(userId);
}

export function emitCursorPosition(x: number, y: number) {
  if (!socket) {
    console.warn('[SocketService] Socket not initialized, cannot emit cursor');
    return;
  }

  const now = Date.now();
  if (now - cursorThrottleTime < CURSOR_THROTTLE_MS) return;

  cursorThrottleTime = now;
  const presenceStore = usePresenceStore.getState();
  const userId = presenceStore.userId;
  const userName = presenceStore.userName;

  if (userId && userName) {
    console.log('[SocketService] Emitting presence:cursor:', { userId, userName, x, y });
    socket.emit('presence:cursor', {
      userId,
      userName,
      x,
      y,
    });
  } else {
    console.warn('[SocketService] Missing userId or userName:', { userId, userName });
  }
}

export function emitDrawingUpdate(objectId: string, updates: any) {
  if (!socket) {
    console.warn('[SocketService] Socket not initialized, cannot emit drawing');
    return;
  }

  const now = Date.now();
  if (now - drawingThrottleTime < DRAWING_THROTTLE_MS) return;

  drawingThrottleTime = now;
  socket.emit('board:object:update', {
    objectId,
    updates,
  });
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnect() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
