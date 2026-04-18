/**
 * Shared types between frontend and backend
 */

// Board object types
export type ToolType = 'select' | 'pen' | 'rect' | 'ellipse' | 'text' | 'sticky' | 'eraser';

export interface BoardObjectBase {
  id: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
}

export interface LineObject extends BoardObjectBase {
  type: 'line';
  points: number[]; // [x1, y1, x2, y2, ...]
  stroke: string;
  strokeWidth: number;
}

export interface RectObject extends BoardObjectBase {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  stroke: string;
  strokeWidth: number;
  fill?: string;
}

export interface EllipseObject extends BoardObjectBase {
  type: 'ellipse';
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  stroke: string;
  strokeWidth: number;
  fill?: string;
}

export interface TextObject extends BoardObjectBase {
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
}

export interface StickyNoteObject extends BoardObjectBase {
  type: 'sticky';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  backgroundColor: string;
  fontSize: number;
}

export type BoardObject = 
  | LineObject 
  | RectObject 
  | EllipseObject 
  | TextObject 
  | StickyNoteObject;

// Room and user types
export interface RoomUser {
  userId: string;
  userName: string;
  color: string;
  cursor?: {
    x: number;
    y: number;
  };
  lastSeen: number;
}

export interface Room {
  id: string;
  createdAt: number;
  objects: BoardObject[];
  users: RoomUser[];
}

// Socket event types
export interface BoardObjectAddPayload {
  object: BoardObject;
}

export interface BoardObjectUpdatePayload {
  objectId: string;
  updates: Partial<BoardObject>;
}

export interface BoardObjectDeletePayload {
  objectId: string;
}

export interface PresenceCursorPayload {
  userId: string;
  userName: string;
  x: number;
  y: number;
}

export interface PresenceUpdatePayload {
  users: RoomUser[];
}

export interface PresenceLeftPayload {
  userId: string;
}

export interface RoomStatePayload {
  roomId: string;
  objects: BoardObject[];
  users: RoomUser[];
}

export interface RoomJoinPayload {
  roomId: string;
  userName: string;
  userId: string;
}

export interface BoardClearPayload {
  timestamp: number;
}

// Undo/Redo types
export interface UndoRedoAction {
  type: 'add' | 'update' | 'delete' | 'clear';
  object?: BoardObject;
  objectId?: string;
  updates?: Partial<BoardObject>;
  previousObjects?: BoardObject[];
  timestamp: number;
}
