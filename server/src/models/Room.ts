import mongoose from 'mongoose';
import type { Room, BoardObject, RoomUser } from '../types/index.js';


const boardObjectSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Number, required: true },
  updatedAt: { type: Number, required: true },
  // Line specific
  points: [Number],
  // Rect/Ellipse specific
  x: Number,
  y: Number,
  width: Number,
  height: Number,
  radiusX: Number,
  radiusY: Number,
  // Common style
  stroke: String,
  strokeWidth: Number,
  fill: String,
  // Text specific
  text: String,
  fontSize: Number,
  fontFamily: String,
  // Sticky note specific
  backgroundColor: String,
});

const roomUserSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  color: { type: String, required: true },
  cursor: {
    x: Number,
    y: Number,
  },
  lastSeen: { type: Number, required: true },
});

const roomSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    objects: [boardObjectSchema],
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'rooms' }
);

export const RoomModel = mongoose.model('Room', roomSchema);

export async function getRoomOrCreate(roomId: string): Promise<Room> {
  let room = await RoomModel.findById(roomId);
  if (!room) {
    room = new RoomModel({
      _id: roomId,
      objects: [],
    });
    await room.save();
  }
  return {
    id: room._id,
    createdAt: room.createdAt.getTime(),
    objects: (room.objects || []) as BoardObject[],
    users: [], // Users are not persisted, only board state
  };
}

export async function addBoardObject(roomId: string, object: BoardObject): Promise<void> {
  await RoomModel.findByIdAndUpdate(
    roomId,
    { $push: { objects: object } },
    { new: true }
  );
}

export async function updateBoardObject(
  roomId: string,
  objectId: string,
  updates: Partial<BoardObject>
): Promise<void> {
  await RoomModel.findByIdAndUpdate(
    roomId,
    {
      $set: {
        'objects.$[elem]': {
          ...updates,
          updatedAt: Date.now(),
        },
      },
    },
    {
      arrayFilters: [{ 'elem.id': objectId }],
      new: true,
    }
  );
}

export async function deleteBoardObject(roomId: string, objectId: string): Promise<void> {
  await RoomModel.findByIdAndUpdate(
    roomId,
    { $pull: { objects: { id: objectId } } },
    { new: true }
  );
}

export async function clearBoard(roomId: string): Promise<void> {
  await RoomModel.findByIdAndUpdate(
    roomId,
    { objects: [] },
    { new: true }
  );
}

export async function getBoardObjects(roomId: string): Promise<BoardObject[]> {
  const room = await RoomModel.findById(roomId);
  return (room?.objects || []) as BoardObject[];
}
