import { useState } from 'react';
import { RoomJoinScreen } from './components/RoomJoinScreen.js';
import { Canvas } from './components/Canvas.js';
import './App.css';

function App() {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  const handleJoinRoom = (roomId: string) => {
    setCurrentRoom(roomId);
    // Update page title
    document.title = `RealCanvas - ${roomId.slice(0, 8)}...`;
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    document.title = 'RealCanvas';
  };

  return (
    <>
      {!currentRoom ? (
        <RoomJoinScreen onJoinRoom={handleJoinRoom} />
      ) : (
        <div style={{ position: 'relative' }}>
          <Canvas roomId={currentRoom} />
          <button
            onClick={handleLeaveRoom}
            style={{
              position: 'fixed',
              top: '12px',
              right: '12px',
              zIndex: 10,
              padding: '8px 12px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Leave Board
          </button>
        </div>
      )}
    </>
  );
}

export default App;
