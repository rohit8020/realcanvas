import React from 'react';
import { useUIStore } from '../stores/UIStore.js';
import type { ToolType } from '../types/index.js';

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const TOOLS: { value: ToolType; label: string }[] = [
  { value: 'select', label: '👆' },
  { value: 'pen', label: '✏️' },
  { value: 'rect', label: '▭' },
  { value: 'ellipse', label: '◯' },
  { value: 'arrow', label: '→' },
  { value: 'text', label: 'T' },
  { value: 'sticky', label: '📝' },
  { value: 'eraser', label: '⌫' },
];

const COLORS = ['#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
const STROKE_WIDTHS = [1, 2, 4, 6, 8];

export const Toolbar: React.FC<ToolbarProps> = ({
  onUndo,
  onRedo,
  onClear,
  onExport,
  canUndo,
  canRedo,
}) => {
  const { currentTool, setTool, currentColor, setColor, strokeWidth, setStrokeWidth } =
    useUIStore();

  return (
    <div style={styles.toolbar}>
      <div style={styles.toolGroup}>
        <label style={styles.label}>Tool:</label>
        <div style={styles.tools}>
          {TOOLS.map((tool) => (
            <button
              key={tool.value}
              style={{
                ...styles.toolButton,
                ...(currentTool === tool.value ? styles.toolButtonActive : {}),
              }}
              onClick={() => setTool(tool.value)}
              title={tool.value}
            >
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.toolGroup}>
        <label style={styles.label}>Color:</label>
        <div style={styles.colors}>
          {COLORS.map((color) => (
            <button
              key={color}
              style={{
                ...styles.colorButton,
                backgroundColor: color,
                ...(currentColor === color ? styles.colorButtonActive : {}),
              }}
              onClick={() => setColor(color)}
              title={color}
            />
          ))}
        </div>
      </div>

      <div style={styles.toolGroup}>
        <label style={styles.label}>Stroke:</label>
        <select
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          style={styles.select}
        >
          {STROKE_WIDTHS.map((width) => (
            <option key={width} value={width}>
              {width}px
            </option>
          ))}
        </select>
      </div>

      <div style={styles.toolGroup}>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          style={{ ...styles.button, ...(canUndo ? {} : styles.buttonDisabled) }}
        >
          ↶ Undo
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          style={{ ...styles.button, ...(canRedo ? {} : styles.buttonDisabled) }}
        >
          ↷ Redo
        </button>
      </div>

      <div style={styles.toolGroup}>
        <button onClick={onClear} style={styles.button}>
          🗑️ Clear
        </button>
        <button onClick={onExport} style={styles.button}>
          ⬇️ Export
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    display: 'flex',
    gap: '16px',
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #ccc',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  toolGroup: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  label: {
    fontWeight: 600,
    fontSize: '14px',
  },
  tools: {
    display: 'flex',
    gap: '4px',
  },
  toolButton: {
    padding: '6px 10px',
    border: '2px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: 'white',
    fontSize: '16px',
    transition: 'all 0.2s',
  },
  toolButtonActive: {
    backgroundColor: '#4ECDC4',
    color: 'white',
    borderColor: '#4ECDC4',
  },
  colors: {
    display: 'flex',
    gap: '4px',
  },
  colorButton: {
    width: '28px',
    height: '28px',
    borderRadius: '4px',
    border: '2px solid #ccc',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  colorButtonActive: {
    border: '2px solid #333',
    boxShadow: '0 0 4px rgba(0,0,0,0.3)',
  },
  select: {
    padding: '6px 8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    cursor: 'pointer',
  },
  button: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};
