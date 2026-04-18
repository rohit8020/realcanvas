const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000';

export async function createRoom(): Promise<string> {
  const response = await fetch(`${API_URL}/api/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to create room');
  }

  const data = await response.json();
  return data.roomId;
}

export async function getRoomState(roomId: string) {
  const response = await fetch(`${API_URL}/api/rooms/${roomId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch room');
  }

  return response.json();
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
