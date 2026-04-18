import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line, Rect, Ellipse, Text, Group } from 'react-konva';
import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';
import { useBoardStore } from '../stores/BoardStore.js';
import { useUIStore } from '../stores/UIStore.js';
import { emitCursorPosition, emitDrawingUpdate } from '../services/SocketService.js';
import { Toolbar } from './Toolbar.js';
import { RemoteCursors } from './RemoteCursors.js';
import type { LineObject, RectObject, EllipseObject, TextObject, StickyNoteObject, ArrowObject } from '../types/index.js';

interface CanvasProps {
  roomId: string;
}

export const Canvas: React.FC<CanvasProps> = ({ roomId }) => {
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLinePoints, setCurrentLinePoints] = useState<number[]>([]);
  const currentDrawingIdRef = useRef<string | null>(null);
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null);
  const [arrowEnd, setArrowEnd] = useState<{ x: number; y: number } | null>(null);

  const objects = useBoardStore((state) => state.objects);
  const selectedObjectId = useBoardStore((state) => state.selectedObjectId);
  const undoStack = useBoardStore((state) => state.undoStack);
  const redoStack = useBoardStore((state) => state.redoStack);
  const userId = useBoardStore((state) => state.userId);
  const addObject = useBoardStore((state) => state.addObject);
  const deleteObject = useBoardStore((state) => state.deleteObject);
  const clearBoard = useBoardStore((state) => state.clearBoard);
  const selectObject = useBoardStore((state) => state.selectObject);
  const undo = useBoardStore((state) => state.undo);
  const redo = useBoardStore((state) => state.redo);

  const currentTool = useUIStore((state) => state.currentTool);
  const currentColor = useUIStore((state) => state.currentColor);
  const strokeWidth = useUIStore((state) => state.strokeWidth);
  const fontSize = useUIStore((state) => state.fontSize);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos || !userId) return;

    if (currentTool === 'select') {
      return;
    }

    setIsDrawing(true);

    if (currentTool === 'pen') {
      // Create drawing ID and start a new line
      const lineId = uuidv4();
      currentDrawingIdRef.current = lineId;
      setCurrentLinePoints([pos.x, pos.y]);
      
      // Create the initial line object and emit it
      const lineObject: LineObject = {
        id: lineId,
        type: 'line',
        userId,
        points: [pos.x, pos.y],
        stroke: currentColor,
        strokeWidth,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addObject(lineObject);
    } else if (currentTool === 'arrow') {
      // Start arrow drawing
      setArrowStart({ x: pos.x, y: pos.y });
      setArrowEnd({ x: pos.x, y: pos.y });
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    emitCursorPosition(pos.x, pos.y);

    if (!isDrawing || !userId) return;

    if (currentTool === 'pen') {
      const newPoints = [...currentLinePoints, pos.x, pos.y];
      setCurrentLinePoints(newPoints);
      
      // Emit real-time drawing update
      if (currentDrawingIdRef.current) {
        emitDrawingUpdate(currentDrawingIdRef.current, {
          points: newPoints,
          updatedAt: Date.now(),
        });
      }
    } else if (currentTool === 'arrow' && arrowStart) {
      // Update arrow end point while dragging
      setArrowEnd({ x: pos.x, y: pos.y });
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !userId) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    setIsDrawing(false);
    currentDrawingIdRef.current = null;

    if (currentTool === 'pen' && currentLinePoints.length > 2) {
      // Final update - drawing is complete
      if (currentDrawingIdRef.current) {
        emitDrawingUpdate(currentDrawingIdRef.current, {
          updatedAt: Date.now(),
        });
      }
      setCurrentLinePoints([]);
    } else if (currentTool === 'arrow' && arrowStart && arrowEnd) {
      // Create arrow object
      const arrowObject: ArrowObject = {
        id: uuidv4(),
        type: 'arrow',
        userId,
        x1: arrowStart.x,
        y1: arrowStart.y,
        x2: arrowEnd.x,
        y2: arrowEnd.y,
        stroke: currentColor,
        strokeWidth,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addObject(arrowObject);
      setArrowStart(null);
      setArrowEnd(null);
    } else if (currentTool === 'rect') {
      const stage = e.target.getStage();
      if (!stage) return;

      // Create a temporary rect to get dimensions
      const startPos = { x: pos.x - 50, y: pos.y - 50 };
      const rectObject: RectObject = {
        id: uuidv4(),
        type: 'rect',
        userId,
        x: startPos.x,
        y: startPos.y,
        width: 100,
        height: 100,
        stroke: currentColor,
        strokeWidth,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addObject(rectObject);
    } else if (currentTool === 'ellipse') {
      const ellipseObject: EllipseObject = {
        id: uuidv4(),
        type: 'ellipse',
        userId,
        x: pos.x,
        y: pos.y,
        radiusX: 50,
        radiusY: 50,
        stroke: currentColor,
        strokeWidth,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addObject(ellipseObject);
    } else if (currentTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const textObject: TextObject = {
          id: uuidv4(),
          type: 'text',
          userId,
          x: pos.x,
          y: pos.y,
          text,
          fontSize,
          fontFamily: 'Arial',
          fill: currentColor,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        addObject(textObject);
      }
    } else if (currentTool === 'sticky') {
      const text = prompt('Enter note:');
      if (text) {
        const stickyObject: StickyNoteObject = {
          id: uuidv4(),
          type: 'sticky',
          userId,
          x: pos.x,
          y: pos.y,
          width: 150,
          height: 150,
          text,
          backgroundColor: '#FFF9C4',
          fontSize: 12,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        addObject(stickyObject);
      }
    }
  };

  const handleObjectClick = (objectId: string) => {
    if (currentTool === 'select') {
      selectObject(objectId);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      undo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      redo();
    } else if (e.key === 'Delete' && selectedObjectId) {
      deleteObject(selectedObjectId);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId]);

  const handleExport = () => {
    if (stageRef.current) {
      const uri = stageRef.current.toDataURL();
      const link = document.createElement('a');
      link.href = uri;
      link.download = `board-${roomId}.png`;
      link.click();
    }
  };

  const stageWidth = window.innerWidth;
  const stageHeight = window.innerHeight - 70; // Subtract toolbar height

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert(`Room ID copied: ${roomId}`);
  };

  return (
    <>
      <Toolbar
        onUndo={undo}
        onRedo={redo}
        onClear={clearBoard}
        onExport={handleExport}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
      />
      <div style={{ position: 'fixed', top: '70px', left: '12px', zIndex: 5, backgroundColor: 'white', padding: '10px 12px', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>📌 Room ID:</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <code style={{ fontSize: '12px', fontWeight: '600', color: '#333', backgroundColor: '#f0f0f0', padding: '4px 6px', borderRadius: '3px' }}>{roomId}</code>
          <button
            onClick={copyRoomId}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              backgroundColor: '#4ECDC4',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
            title="Copy room ID to clipboard"
          >
            Copy
          </button>
        </div>
      </div>
      <div style={{ position: 'relative', width: stageWidth, height: stageHeight }}>
        <Stage
          ref={stageRef}
          width={stageWidth}
          height={stageHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ backgroundColor: '#fafafa' }}
        >
          <Layer ref={layerRef}>
            {objects.map((object) => {
              if (object.type === 'line') {
                const line = object as LineObject;
                return (
                  <Line
                    key={object.id}
                    points={line.points}
                    stroke={line.stroke}
                    strokeWidth={line.strokeWidth}
                    lineCap="round"
                    lineJoin="round"
                    onClick={() => handleObjectClick(object.id)}
                    opacity={selectedObjectId === object.id ? 0.8 : 1}
                  />
                );
              } else if (object.type === 'rect') {
                const rect = object as RectObject;
                return (
                  <Rect
                    key={object.id}
                    x={rect.x}
                    y={rect.y}
                    width={rect.width}
                    height={rect.height}
                    stroke={rect.stroke}
                    strokeWidth={rect.strokeWidth}
                    onClick={() => handleObjectClick(object.id)}
                    opacity={selectedObjectId === object.id ? 0.8 : 1}
                  />
                );
              } else if (object.type === 'ellipse') {
                const ellipse = object as EllipseObject;
                return (
                  <Ellipse
                    key={object.id}
                    x={ellipse.x}
                    y={ellipse.y}
                    radiusX={ellipse.radiusX}
                    radiusY={ellipse.radiusY}
                    stroke={ellipse.stroke}
                    strokeWidth={ellipse.strokeWidth}
                    onClick={() => handleObjectClick(object.id)}
                    opacity={selectedObjectId === object.id ? 0.8 : 1}
                  />
                );
              } else if (object.type === 'text') {
                const text = object as TextObject;
                return (
                  <Text
                    key={object.id}
                    x={text.x}
                    y={text.y}
                    text={text.text}
                    fontSize={text.fontSize}
                    fontFamily={text.fontFamily}
                    fill={text.fill}
                    onClick={() => handleObjectClick(object.id)}
                    opacity={selectedObjectId === object.id ? 0.8 : 1}
                  />
                );
              } else if (object.type === 'sticky') {
                const sticky = object as StickyNoteObject;
                return (
                  <Group
                    key={object.id}
                    x={sticky.x}
                    y={sticky.y}
                    onClick={() => handleObjectClick(object.id)}
                    opacity={selectedObjectId === object.id ? 0.8 : 1}
                  >
                    <Rect
                      width={sticky.width}
                      height={sticky.height}
                      fill={sticky.backgroundColor}
                      stroke="#999"
                      strokeWidth={1}
                    />
                    <Text
                      x={8}
                      y={8}
                      width={sticky.width - 16}
                      text={sticky.text}
                      fontSize={sticky.fontSize}
                      fill="#333"
                      wordWrap={true}
                    />
                  </Group>
                );
              } else if (object.type === 'arrow') {
                const arrow = object as ArrowObject;
                const dx = arrow.x2 - arrow.x1;
                const dy = arrow.y2 - arrow.y1;
                const angle = Math.atan2(dy, dx);
                const arrowHeadLength = 15;
                
                return (
                  <Group key={object.id} onClick={() => handleObjectClick(object.id)}>
                    {/* Arrow line */}
                    <Line
                      points={[arrow.x1, arrow.y1, arrow.x2, arrow.y2]}
                      stroke={arrow.stroke}
                      strokeWidth={arrow.strokeWidth}
                      lineCap="round"
                    />
                    {/* Arrowhead */}
                    <Line
                      points={[
                        arrow.x2,
                        arrow.y2,
                        arrow.x2 - arrowHeadLength * Math.cos(angle - Math.PI / 6),
                        arrow.y2 - arrowHeadLength * Math.sin(angle - Math.PI / 6),
                        arrow.x2 - arrowHeadLength * Math.cos(angle + Math.PI / 6),
                        arrow.y2 - arrowHeadLength * Math.sin(angle + Math.PI / 6),
                        arrow.x2,
                        arrow.y2,
                      ]}
                      stroke={arrow.stroke}
                      strokeWidth={arrow.strokeWidth}
                      lineCap="round"
                      lineJoin="round"
                      fill={arrow.stroke}
                    />
                  </Group>
                );
              }
              return null;
            })}

            {currentTool === 'pen' && isDrawing && currentLinePoints.length > 0 && (
              <Line
                points={currentLinePoints}
                stroke={currentColor}
                strokeWidth={strokeWidth}
                lineCap="round"
                lineJoin="round"
              />
            )}

            {currentTool === 'arrow' && isDrawing && arrowStart && arrowEnd && (
              <Group>
                {/* Arrow preview line */}
                <Line
                  points={[arrowStart.x, arrowStart.y, arrowEnd.x, arrowEnd.y]}
                  stroke={currentColor}
                  strokeWidth={strokeWidth}
                  lineCap="round"
                />
                {/* Arrow preview head */}
                {(() => {
                  const dx = arrowEnd.x - arrowStart.x;
                  const dy = arrowEnd.y - arrowStart.y;
                  const angle = Math.atan2(dy, dx);
                  const arrowHeadLength = 15;
                  return (
                    <Line
                      points={[
                        arrowEnd.x,
                        arrowEnd.y,
                        arrowEnd.x - arrowHeadLength * Math.cos(angle - Math.PI / 6),
                        arrowEnd.y - arrowHeadLength * Math.sin(angle - Math.PI / 6),
                        arrowEnd.x - arrowHeadLength * Math.cos(angle + Math.PI / 6),
                        arrowEnd.y - arrowHeadLength * Math.sin(angle + Math.PI / 6),
                        arrowEnd.x,
                        arrowEnd.y,
                      ]}
                      stroke={currentColor}
                      strokeWidth={strokeWidth}
                      lineCap="round"
                      lineJoin="round"
                      fill={currentColor}
                    />
                  );
                })()}
              </Group>
            )}
          </Layer>
        </Stage>

        <RemoteCursors width={stageWidth} height={stageHeight} />
      </div>
    </>
  );
};
