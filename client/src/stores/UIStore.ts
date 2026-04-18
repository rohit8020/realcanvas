import { create } from 'zustand';
import type { ToolType } from '../types/index.js';

interface UIState {
  currentTool: ToolType;
  currentColor: string;
  strokeWidth: number;
  fontSize: number;
  setTool: (tool: ToolType) => void;
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setFontSize: (size: number) => void;
}

const COLORS = ['#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

export const useUIStore = create<UIState>((set) => ({
  currentTool: 'pen',
  currentColor: '#000000',
  strokeWidth: 2,
  fontSize: 16,
  setTool: (tool) => set({ currentTool: tool }),
  setColor: (color) => set({ currentColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setFontSize: (size) => set({ fontSize: size }),
}));
