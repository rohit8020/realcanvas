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

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 999 }}>
      {filteredUsers.map((user) => {
        const cursorX = (user.cursor!.x / width) * 100;
        const cursorY = (user.cursor!.y / height) * 100;
        
        return (
          <div key={`${user.userId}-${user.cursor?.x}-${user.cursor?.y}`}>
            {/* Cursor dot - positioned at exact cursor location */}
            <div
              style={{
                position: 'absolute',
                left: `${cursorX}%`,
                top: `${cursorY}%`,
                width: '12px',
                height: '12px',
                backgroundColor: user.color,
                borderRadius: '50%',
                border: '2px solid white',
                boxShadow: `0 0 6px ${user.color}, inset 0 0 2px rgba(0,0,0,0.2)`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 1000,
                transition: 'all 0.05s ease-out',
              }}
            />

            {/* Username label - 20px above cursor on same axis */}
            <div
              style={{
                position: 'absolute',
                left: `${cursorX}%`,
                top: `calc(${cursorY}% - 30px)`,
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
                zIndex: 1001,
                transition: 'all 0.05s ease-out',
              }}
            >
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
            </div>
          </div>
        );
      })}
    </div>
  );
};
