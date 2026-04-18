import { create } from 'zustand';
import type { BoardObject, UndoRedoAction } from '../types/index.js';
import type { Socket } from 'socket.io-client';

interface BoardState {
  objects: BoardObject[];
  selectedObjectId: string | null;
  undoStack: UndoRedoAction[];
  redoStack: UndoRedoAction[];
  socket: Socket | null;
  userId: string | null;
  
  // Object operations
  addObject: (object: BoardObject) => void;
  updateObject: (objectId: string, updates: Partial<BoardObject>) => void;
  deleteObject: (objectId: string) => void;
  clearBoard: () => void;
  setObjects: (objects: BoardObject[]) => void;
  
  // Selection
  selectObject: (objectId: string | null) => void;
  
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  pushUndoAction: (action: UndoRedoAction) => void;
  
  // Socket
  setSocket: (socket: Socket) => void;
  setUserId: (userId: string) => void;
  
  // Remote updates (don't add to undo stack)
  applyRemoteObjectAdd: (object: BoardObject) => void;
  applyRemoteObjectUpdate: (objectId: string, updates: Partial<BoardObject>) => void;
  applyRemoteObjectDelete: (objectId: string) => void;
  applyRemoteClear: () => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  objects: [],
  selectedObjectId: null,
  undoStack: [],
  redoStack: [],
  socket: null,
  userId: null,

  addObject: (object) => {
    set({
      objects: [...get().objects, object],
      redoStack: [],
    } as Partial<BoardState>);
    
    const socket = get().socket;
    if (socket && get().userId) {
      socket.emit('board:object:add', { object });
      get().pushUndoAction({
        type: 'add',
        object,
        timestamp: Date.now(),
      });
    }
  },

  updateObject: (objectId, updates) => {
    set({
      objects: get().objects.map((obj) =>
        obj.id === objectId ? { ...obj, ...updates } : obj
      ),
      redoStack: [],
    } as Partial<BoardState>);
    
    const socket = get().socket;
    if (socket) {
      socket.emit('board:object:update', { objectId, updates });
      const object = get().objects.find(obj => obj.id === objectId);
      if (object) {
        get().pushUndoAction({
          type: 'update',
          objectId,
          updates,
          timestamp: Date.now(),
        });
      }
    }
  },

  deleteObject: (objectId) => {
    const deletedObject = get().objects.find((obj) => obj.id === objectId);
    set({
      objects: get().objects.filter((obj) => obj.id !== objectId),
      selectedObjectId: get().selectedObjectId === objectId ? null : get().selectedObjectId,
      redoStack: [],
    } as Partial<BoardState>);
    
    const socket = get().socket;
    if (socket) {
      socket.emit('board:object:delete', { objectId });
      if (deletedObject) {
        get().pushUndoAction({
          type: 'delete',
          object: deletedObject,
          timestamp: Date.now(),
        });
      }
    }
  },

  clearBoard: () => {
    const previousObjects = get().objects;
    set({
      objects: [],
      selectedObjectId: null,
      redoStack: [],
    } as Partial<BoardState>);
    
    const socket = get().socket;
    if (socket) {
      socket.emit('board:clear', { timestamp: Date.now() });
      get().pushUndoAction({
        type: 'clear',
        previousObjects,
        timestamp: Date.now(),
      });
    }
  },

  setObjects: (objects) => {
    set({ objects, undoStack: [], redoStack: [] } as Partial<BoardState>);
  },

  selectObject: (objectId) => {
    set({ selectedObjectId: objectId } as Partial<BoardState>);
  },

  undo: () => {
    const { undoStack, redoStack } = get();
    if (undoStack.length === 0) return;

    const action = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    const newRedoStack = [action, ...redoStack];

    // Apply inverse operation
    if (action.type === 'add' && action.object) {
      get().deleteObject(action.object.id);
    } else if (action.type === 'delete' && action.object) {
      const socket = get().socket;
      const objects = [...get().objects, action.object];
      set({ objects } as any);
      if (socket) {
        socket.emit('board:object:add', { object: action.object });
      }
    } else if (action.type === 'update' && action.updates) {
      const objectId = action.objectId!;
      const object = get().objects.find((obj) => obj.id === objectId);
      if (object) {
        // Revert to previous state by inverting the updates
        const inverseUpdates: Partial<BoardObject> = {};
        Object.keys(action.updates || {}).forEach((key) => {
          inverseUpdates[key as keyof BoardObject] = (object as any)[key];
        });
        get().updateObject(objectId, inverseUpdates);
      }
    } else if (action.type === 'clear' && action.previousObjects) {
      set({ objects: action.previousObjects } as any);
      const socket = get().socket;
      if (socket) {
        action.previousObjects.forEach(obj => {
          socket.emit('board:object:add', { object: obj });
        });
      }
    }

    set({
      undoStack: newUndoStack,
      redoStack: newRedoStack,
    } as any);
  },

  redo: () => {
    const { redoStack, undoStack } = get();
    if (redoStack.length === 0) return;

    const action = redoStack[0];
    const newRedoStack = redoStack.slice(1);
    const newUndoStack = [...undoStack, action];

    // Reapply operation
    if (action.type === 'add' && action.object) {
      const socket = get().socket;
      const objects = [...get().objects, action.object];
      set({ objects } as any);
      if (socket) {
        socket.emit('board:object:add', { object: action.object });
      }
    } else if (action.type === 'delete' && action.object) {
      get().deleteObject(action.object.id);
    } else if (action.type === 'update' && action.updates) {
      get().updateObject(action.objectId!, action.updates);
    } else if (action.type === 'clear' && action.previousObjects) {
      set({ objects: [] } as any);
      const socket = get().socket;
      if (socket) {
        socket.emit('board:clear', { timestamp: Date.now() });
      }
    }

    set({
      undoStack: newUndoStack,
      redoStack: newRedoStack,
    } as any);
  },

  pushUndoAction: (action) => {
    set({
      undoStack: [...get().undoStack, action],
    } as Partial<BoardState>);
  },

  setSocket: (socket) => {
    set({ socket } as Partial<BoardState>);
  },

  setUserId: (userId) => {
    set({ userId } as Partial<BoardState>);
  },

  applyRemoteObjectAdd: (object) => {
    set({
      objects: [...get().objects, object],
    } as Partial<BoardState>);
  },

  applyRemoteObjectUpdate: (objectId, updates) => {
    set({
      objects: get().objects.map((obj) =>
        obj.id === objectId ? { ...obj, ...updates } : obj
      ),
    } as Partial<BoardState>);
  },

  applyRemoteObjectDelete: (objectId) => {
    set({
      objects: get().objects.filter((obj) => obj.id !== objectId),
    } as Partial<BoardState>);
  },

  applyRemoteClear: () => {
    set({ objects: [] } as Partial<BoardState>);
  },
}));
