import { Server, Socket } from 'socket.io';
import {
  getOrCreateRoom,
  addUserToRoom,
  removeUserFromRoom,
  getRoomUsers,
  updateUserCursor,
  getRoomState,
} from '../services/RoomService.js';
import {
  addBoardObject,
  updateBoardObject,
  deleteBoardObject,
  clearBoard,
} from '../models/Room.js';
import type {
  RoomJoinPayload,
  BoardObjectAddPayload,
  BoardObjectUpdatePayload,
  BoardObjectDeletePayload,
  PresenceCursorPayload,
  RoomStatePayload,
  PresenceUpdatePayload,
  PresenceLeftPayload,
  BoardClearPayload,
} from '../types/index.js';


export function setupSocketIO(io: Server): void {
  io.on('connection', (socket: Socket) => {
    let currentRoom: string | null = null;
    let currentUserId: string | null = null;

    socket.on('room:join', async (payload: RoomJoinPayload) => {
      try {
        const { roomId, userName, userId } = payload;
        
        // Join the socket to the room namespace
        currentRoom = roomId;
        currentUserId = userId;
        socket.join(roomId);

        // Add user to room service with the client's userId
        getOrCreateRoom(roomId);
        const user = addUserToRoom(roomId, userName, userId);

        // Get current room state
        const roomState = await getRoomState(roomId);

        // Emit current state to the joining user
        socket.emit('room:state', {
          roomId,
          objects: roomState.objects,
          users: roomState.users,
        } as RoomStatePayload);

        // Broadcast updated user list to all users in the room
        io.to(roomId).emit('presence:update', {
          users: getRoomUsers(roomId),
        } as PresenceUpdatePayload);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    socket.on('board:object:add', async (payload: BoardObjectAddPayload) => {
      if (!currentRoom) return;

      try {
        await addBoardObject(currentRoom, payload.object);
        io.to(currentRoom).emit('board:object:add', payload);
      } catch (error) {
        console.error('Error adding object:', error);
      }
    });

    socket.on('board:object:update', async (payload: BoardObjectUpdatePayload) => {
      if (!currentRoom) return;

      try {
        await updateBoardObject(currentRoom, payload.objectId, payload.updates);
        io.to(currentRoom).emit('board:object:update', payload);
      } catch (error) {
        console.error('Error updating object:', error);
      }
    });

    socket.on('board:object:delete', async (payload: BoardObjectDeletePayload) => {
      if (!currentRoom) return;

      try {
        await deleteBoardObject(currentRoom, payload.objectId);
        io.to(currentRoom).emit('board:object:delete', payload);
      } catch (error) {
        console.error('Error deleting object:', error);
      }
    });

    socket.on('board:clear', async (payload: BoardClearPayload) => {
      if (!currentRoom) return;

      try {
        await clearBoard(currentRoom);
        io.to(currentRoom).emit('board:clear', payload);
      } catch (error) {
        console.error('Error clearing board:', error);
      }
    });

    socket.on('presence:cursor', (payload: PresenceCursorPayload) => {
      if (!currentRoom) return;

      try {
        console.log('[Server] Received cursor:', { room: currentRoom, payload });
        updateUserCursor(currentRoom, payload.userId, payload.x, payload.y);
        
        // Broadcast to all users in the room EXCEPT the sender
        io.to(currentRoom).except(socket.id).emit('presence:cursor', payload);
        console.log('[Server] Broadcast cursor to room:', currentRoom);
      } catch (error) {
        console.error('Error updating cursor:', error);
      }
    });

    socket.on('disconnect', () => {
      if (currentRoom && currentUserId) {
        removeUserFromRoom(currentRoom, currentUserId);
        io.to(currentRoom).emit('presence:left', {
          userId: currentUserId,
        } as PresenceLeftPayload);

        io.to(currentRoom).emit('presence:update', {
          users: getRoomUsers(currentRoom),
        } as PresenceUpdatePayload);
      }
    });
  });
}
