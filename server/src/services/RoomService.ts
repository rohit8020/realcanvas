import { getRoomOrCreate, getBoardObjects } from '../models/Room.js';
import type { Room, RoomUser, BoardObject } from '../types/index.js';


const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
const roomSessions = new Map<string, Map<string, RoomUser>>();

export function getOrCreateRoom(roomId: string): string {
  if (!roomSessions.has(roomId)) {
    roomSessions.set(roomId, new Map());
  }
  return roomId;
}

export function addUserToRoom(roomId: string, userName: string, userId: string): RoomUser {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  
  const user: RoomUser = {
    userId,
    userName,
    color,
    lastSeen: Date.now(),
  };

  const room = roomSessions.get(roomId) || new Map();
  room.set(userId, user);
  roomSessions.set(roomId, room);

  return user;
}

export function removeUserFromRoom(roomId: string, userId: string): void {
  const room = roomSessions.get(roomId);
  if (room) {
    room.delete(userId);
    if (room.size === 0) {
      roomSessions.delete(roomId);
    } else {
      roomSessions.set(roomId, room);
    }
  }
}

export function getRoomUsers(roomId: string): RoomUser[] {
  const room = roomSessions.get(roomId);
  if (!room) return [];
  return Array.from(room.values());
}

export function updateUserCursor(roomId: string, userId: string, x: number, y: number): void {
  const room = roomSessions.get(roomId);
  if (room) {
    const user = room.get(userId);
    if (user) {
      user.cursor = { x, y };
      user.lastSeen = Date.now();
      room.set(userId, user);
      roomSessions.set(roomId, room);
    }
  }
}

export async function getRoomState(roomId: string): Promise<Room> {
  const baseRoom = await getRoomOrCreate(roomId);
  const users = getRoomUsers(roomId);
  return {
    ...baseRoom,
    users,
  };
}

export function cleanupInactiveUsers(roomId: string, inactivityThreshold: number = 60000): void {
  const room = roomSessions.get(roomId);
  if (!room) return;

  const now = Date.now();
  const usersToRemove: string[] = [];

  for (const [userId, user] of room) {
    if (now - user.lastSeen > inactivityThreshold) {
      usersToRemove.push(userId);
    }
  }

  usersToRemove.forEach(userId => {
    room.delete(userId);
  });

  if (room.size === 0) {
    roomSessions.delete(roomId);
  } else {
    roomSessions.set(roomId, room);
  }
}
