import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createRoom, checkServerHealth } from '../services/ApiService.js';
import { initializeSocket, joinRoom } from '../services/SocketService.js';

interface RoomJoinScreenProps {
  onJoinRoom: (roomId: string, userName: string) => void;
}

export const RoomJoinScreen: React.FC<RoomJoinScreenProps> = ({ onJoinRoom }) => {
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverConnected, setServerConnected] = useState(true);

  React.useEffect(() => {
    // Check if server is running
    checkServerHealth().then(setServerConnected).catch(() => setServerConnected(false));
  }, []);

  const handleCreateNewRoom = async () => {
    const name = userName.trim();
    if (!name) {
      setError('Please enter a name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newRoomId = await createRoom();
      initializeSocket(import.meta.env.VITE_API_URL as string || 'http://localhost:4000');
      const userId = uuidv4();
      joinRoom(newRoomId, name, userId);
      onJoinRoom(newRoomId, name);
    } catch (err) {
      setError('Failed to create room. Make sure the server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinExistingRoom = async () => {
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }

    if (!userName.trim()) {
      setError('Please enter a name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      initializeSocket(import.meta.env.VITE_API_URL as string || 'http://localhost:4000');
      const userId = uuidv4();
      joinRoom(roomId, userName, userId);
      onJoinRoom(roomId, userName);
    } catch (err) {
      setError('Failed to join room.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎨 RealCanvas</h1>
        <p style={styles.subtitle}>Collaborative Whiteboard</p>

        {!serverConnected && (
          <div style={styles.warning}>
            ⚠️ Server is not running. Please start it with: docker compose up --build
          </div>
        )}

        <div style={styles.section}>
          <label style={styles.label}>Your Name:</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            style={styles.input}
            disabled={loading}
          />
        </div>

        <div style={styles.divider}>OR</div>

        <div style={styles.section}>
          <label style={styles.label}>Room ID:</label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Paste room ID to join"
            style={styles.input}
            disabled={loading}
          />
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.buttonGroup}>
          <button
            onClick={handleCreateNewRoom}
            disabled={loading || !serverConnected}
            style={{ ...styles.button, ...styles.primaryButton }}
          >
            {loading ? 'Creating...' : '+ Create New Board'}
          </button>
          <button
            onClick={handleJoinExistingRoom}
            disabled={loading || !serverConnected}
            style={styles.button}
          >
            {loading ? 'Joining...' : 'Join Board'}
          </button>
        </div>

        <p style={styles.hint}>💡 Share the room ID with others to collaborate!</p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    margin: '0 0 32px 0',
    fontSize: '16px',
    textAlign: 'center',
    color: '#666',
  },
  section: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: '2px solid #e0e0e0',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
  },
  divider: {
    textAlign: 'center',
    marginBottom: '24px',
    marginTop: '24px',
    color: '#999',
    fontSize: '12px',
    fontWeight: '600',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '32px',
  },
  button: {
    flex: 1,
    padding: '12px 24px',
    borderRadius: '6px',
    border: '2px solid #667eea',
    backgroundColor: 'white',
    color: '#667eea',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  primaryButton: {
    backgroundColor: '#667eea',
    color: 'white',
  },
  error: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '6px',
    fontSize: '14px',
  },
  warning: {
    marginBottom: '24px',
    padding: '12px',
    backgroundColor: '#fff3e0',
    color: '#e65100',
    borderRadius: '6px',
    fontSize: '14px',
  },
  hint: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#999',
  },
};
