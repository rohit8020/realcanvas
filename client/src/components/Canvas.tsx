import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line, Rect, Ellipse, Text, Group } from 'react-konva';
import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';
import { useBoardStore } from '../stores/BoardStore.js';
import { useUIStore } from '../stores/UIStore.js';
import { emitCursorPosition, emitDrawingUpdate, getSocket } from '../services/SocketService.js';
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
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [shapeEnd, setShapeEnd] = useState<{ x: number; y: number } | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [editingTextPos, setEditingTextPos] = useState<{ x: number; y: number } | null>(null);
  const [textboxWidth, setTextboxWidth] = useState<number>(300);
  const [textboxHeight, setTextboxHeight] = useState<number>(100);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [cursorStyle, setCursorStyle] = useState<string>('auto');
  const textInputRef = useRef<HTMLTextAreaElement>(null);

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
    } else if (currentTool === 'rect' || currentTool === 'ellipse') {
      // Start rectangle or ellipse drawing with preview
      setShapeStart({ x: pos.x, y: pos.y });
      setShapeEnd({ x: pos.x, y: pos.y });
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
    } else if ((currentTool === 'rect' || currentTool === 'ellipse') && shapeStart) {
      // Update shape end point while dragging (preview)
      setShapeEnd({ x: pos.x, y: pos.y });
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
    } else if (currentTool === 'rect' && shapeStart && shapeEnd) {
      // Create rectangle with calculated dimensions
      const width = Math.abs(shapeEnd.x - shapeStart.x);
      const height = Math.abs(shapeEnd.y - shapeStart.y);
      const x = Math.min(shapeStart.x, shapeEnd.x);
      const y = Math.min(shapeStart.y, shapeEnd.y);
      
      if (width > 5 && height > 5) {
        const rectObject: RectObject = {
          id: uuidv4(),
          type: 'rect',
          userId,
          x,
          y,
          width,
          height,
          stroke: currentColor,
          strokeWidth,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        addObject(rectObject);
      }
      setShapeStart(null);
      setShapeEnd(null);
    } else if (currentTool === 'ellipse' && shapeStart && shapeEnd) {
      // Create ellipse with calculated dimensions
      const radiusX = Math.abs(shapeEnd.x - shapeStart.x) / 2;
      const radiusY = Math.abs(shapeEnd.y - shapeStart.y) / 2;
      const x = (shapeStart.x + shapeEnd.x) / 2;
      const y = (shapeStart.y + shapeEnd.y) / 2;
      
      if (radiusX > 5 && radiusY > 5) {
        const ellipseObject: EllipseObject = {
          id: uuidv4(),
          type: 'ellipse',
          userId,
          x,
          y,
          radiusX,
          radiusY,
          stroke: currentColor,
          strokeWidth,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        addObject(ellipseObject);
      }
      setShapeStart(null);
      setShapeEnd(null);
    } else if (currentTool === 'text') {
      // Start text editing directly on canvas
      const textId = uuidv4();
      setEditingTextId(textId);
      setEditingText('');
      setEditingTextPos({ x: pos.x, y: pos.y });
      
      // Focus textarea immediately
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 0);
    } else if (currentTool === 'sticky') {
      // Start sticky note editing on canvas
      const stickyId = uuidv4();
      setEditingTextId(stickyId);
      setEditingText('');
      setEditingTextPos({ x: pos.x, y: pos.y });
      
      // Focus textarea immediately
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 0);
    }
  };

  const handleObjectClick = (objectId: string) => {
    if (currentTool === 'select') {
      selectObject(objectId);
    } else if (currentTool === 'text') {
      // Enable editing of existing text
      const textObj = objects.find(obj => obj.id === objectId) as TextObject | undefined;
      if (textObj) {
        setEditingTextId(objectId);
        setEditingText(textObj.text);
        setEditingTextPos({ x: textObj.x, y: textObj.y });
        setTimeout(() => {
          textInputRef.current?.focus();
        }, 0);
      }
    }
  };

  const finishTextEditing = () => {
    if (editingTextId && editingTextPos && editingText.trim() && userId) {
      // Check if editing existing object
      const existingObj = objects.find(obj => obj.id === editingTextId);
      
      if (existingObj) {
        // Update existing object
        const updatePayload = {
          text: editingText,
          updatedAt: Date.now(),
        };
        const socket = getSocket();
        if (socket) {
          socket.emit('board:object:update', {
            objectId: editingTextId,
            updates: updatePayload,
          });
        }
      } else {
        // Create new object based on current tool
        if (currentTool === 'sticky') {
          const stickyObject: StickyNoteObject = {
            id: editingTextId,
            type: 'sticky',
            userId,
            x: editingTextPos.x,
            y: editingTextPos.y,
            width: 150,
            height: 150,
            text: editingText,
            backgroundColor: '#FFF9C4',
            fontSize: 12,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          addObject(stickyObject);
        } else {
          // Default to text object
          const textObject: TextObject = {
            id: editingTextId,
            type: 'text',
            userId,
            x: editingTextPos.x,
            y: editingTextPos.y,
            text: editingText,
            fontSize,
            fontFamily: 'Arial',
            fill: currentColor,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          addObject(textObject);
        }
      }
    }
    setEditingTextId(null);
    setEditingText('');
    setEditingTextPos(null);
  };

  const handleTextboxMouseMove = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (!textInputRef.current) return;
    
    const rect = textInputRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const borderSize = 8;

    let newCursor = 'auto';
    let direction = null;

    // Check if near borders
    const nearTop = y < borderSize;
    const nearBottom = y > rect.height - borderSize;
    const nearLeft = x < borderSize;
    const nearRight = x > rect.width - borderSize;

    if ((nearTop || nearBottom) && (nearLeft || nearRight)) {
      newCursor = nearTop && nearLeft ? 'nwse-resize' : 'nesw-resize';
      direction = 'diagonal';
    } else if (nearTop || nearBottom) {
      newCursor = 'ns-resize';
      direction = 'vertical';
    } else if (nearLeft || nearRight) {
      newCursor = 'ew-resize';
      direction = 'horizontal';
    }

    setCursorStyle(newCursor);
    setResizeDirection(direction);
  };

  const handleTextboxMouseDown = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (!resizeDirection) return;

    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: textboxWidth,
      height: textboxHeight,
    });
  };

  const handleDocumentMouseMove = (e: MouseEvent) => {
    if (!isResizing || !resizeStart) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    let newWidth = resizeStart.width;
    let newHeight = resizeStart.height;

    if (resizeDirection === 'horizontal') {
      newWidth = Math.max(100, resizeStart.width + deltaX);
    } else if (resizeDirection === 'vertical') {
      newHeight = Math.max(50, resizeStart.height + deltaY);
    } else if (resizeDirection === 'diagonal') {
      newWidth = Math.max(100, resizeStart.width + deltaX);
      newHeight = Math.max(50, resizeStart.height + deltaY);
    }

    setTextboxWidth(newWidth);
    setTextboxHeight(newHeight);
  };

  const handleDocumentMouseUp = () => {
    setIsResizing(false);
    setResizeStart(null);
  };

  // Add/remove resize event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleDocumentMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleDocumentMouseMove);
        document.removeEventListener('mouseup', handleDocumentMouseUp);
      };
    }
  }, [isResizing, resizeStart, resizeDirection]);

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

            {currentTool === 'rect' && isDrawing && shapeStart && shapeEnd && (
              <Rect
                x={Math.min(shapeStart.x, shapeEnd.x)}
                y={Math.min(shapeStart.y, shapeEnd.y)}
                width={Math.abs(shapeEnd.x - shapeStart.x)}
                height={Math.abs(shapeEnd.y - shapeStart.y)}
                stroke={currentColor}
                strokeWidth={strokeWidth}
                opacity={0.5}
              />
            )}

            {currentTool === 'ellipse' && isDrawing && shapeStart && shapeEnd && (
              <Ellipse
                x={(shapeStart.x + shapeEnd.x) / 2}
                y={(shapeStart.y + shapeEnd.y) / 2}
                radiusX={Math.abs(shapeEnd.x - shapeStart.x) / 2}
                radiusY={Math.abs(shapeEnd.y - shapeStart.y) / 2}
                stroke={currentColor}
                strokeWidth={strokeWidth}
                opacity={0.5}
              />
            )}
          </Layer>
        </Stage>

        <RemoteCursors width={stageWidth} height={stageHeight} />
        
        {editingTextId && editingTextPos && (
          <textarea
            ref={textInputRef}
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            onBlur={finishTextEditing}
            onMouseMove={handleTextboxMouseMove}
            onMouseDown={handleTextboxMouseDown}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                finishTextEditing();
              } else if (e.key === 'Escape') {
                setEditingTextId(null);
                setEditingText('');
                setEditingTextPos(null);
                setTextboxWidth(300);
                setTextboxHeight(100);
              }
            }}
            style={{
              position: 'absolute',
              top: editingTextPos.y,
              left: editingTextPos.x,
              width: `${textboxWidth}px`,
              height: `${textboxHeight}px`,
              fontSize: `${fontSize}px`,
              fontFamily: 'Arial',
              padding: '8px',
              border: '2px solid #4ECDC4',
              borderRadius: '4px',
              zIndex: 1000,
              resize: 'none',
              backgroundColor: 'white',
              color: currentColor,
              cursor: cursorStyle,
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflow: 'auto',
            }}
            autoFocus
          />
        )}
      </div>
    </>
  );
};
