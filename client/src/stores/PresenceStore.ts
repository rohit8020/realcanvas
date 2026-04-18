import { create } from 'zustand';
import type { RoomUser } from '../types/index.js';

interface PresenceState {
  roomId: string | null;
  userId: string | null;
  userName: string | null;
  users: RoomUser[];
  
  setRoom: (roomId: string, userId: string, userName: string) => void;
  setUsers: (users: RoomUser[]) => void;
  updateUserCursor: (userId: string, x: number, y: number) => void;
  removeUser: (userId: string) => void;
  clear: () => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  roomId: null,
  userId: null,
  userName: null,
  users: [],

  setRoom: (roomId, userId, userName) => {
    set({ roomId, userId, userName });
  },

  setUsers: (users) => {
    set({ users });
  },

  updateUserCursor: (userId, x, y) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.userId === userId ? { ...user, cursor: { x, y } } : user
      ),
    }));
  },

  removeUser: (userId) => {
    set((state) => ({
      users: state.users.filter((user) => user.userId !== userId),
    }));
  },

  clear: () => {
    set({
      roomId: null,
      userId: null,
      userName: null,
      users: [],
    });
  },
}));
