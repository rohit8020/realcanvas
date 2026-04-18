import React, { useMemo, useCallback } from 'react';
import { usePresenceStore } from '../stores/PresenceStore.js';

interface RemoteCursorProps {
  width: number;
  height: number;
}

export const RemoteCursors: React.FC<RemoteCursorProps> = ({ width, height }) => {
  // Subscribe to users with cursor data to ensure real-time updates
  const users = usePresenceStore((state) => state.users);
  const currentUserId = usePresenceStore((state) => state.userId);

  // Filter and memoize to ensure component re-renders when cursor changes
  const filteredUsers = useMemo(
    () => users.filter((user) => user.userId !== currentUserId && user.cursor),
    [users, currentUserId]
  );

  // Helper to determine if label should appear above or below cursor
  const getLabelPosition = useCallback((cursorY: number) => {
    const labelHeight = 32; // approximate label height
    const topThreshold = labelHeight + 20; // distance from top where we switch positioning
    
    if (cursorY < topThreshold) {
      // Cursor is near top - show label below
      return {
        transform: 'translate(-50%, 20px)',
        marginTop: '12px',
      };
    } else {
      // Cursor is lower - show label above
      return {
        transform: 'translate(-50%, -100%)',
        marginTop: '-40px',
      };
    }
  }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 999 }}>
      {filteredUsers.map((user) => {
        const labelStyle = getLabelPosition(user.cursor!.y);
        
        return (
          <div
            key={`${user.userId}-${user.cursor?.x}-${user.cursor?.y}`}
            style={{
              position: 'absolute',
              left: `${(user.cursor!.x / width) * 100}%`,
              top: `${(user.cursor!.y / height) * 100}%`,
              pointerEvents: 'none',
              zIndex: 1000,
              transition: 'all 0.05s ease-out',
              ...labelStyle,
            }}
          >
            {/* Username label - appears above or below cursor */}
            <div
              style={{
                backgroundColor: user.color,
                color: 'white',
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: user.color, border: '1px solid white' }} />
              {user.userName}
            </div>

            {/* Cursor dot with arrow effect */}
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: user.color,
                borderRadius: '50%',
                border: '2px solid white',
                boxShadow: `0 0 6px ${user.color}, inset 0 0 2px rgba(0,0,0,0.2)`,
                position: 'relative',
                marginTop: '4px',
                marginLeft: '6px',
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
