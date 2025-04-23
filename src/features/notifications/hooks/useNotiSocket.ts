import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Notification } from '@/features/types';

interface UseNotificationSocketProps {
  token: string;
  currentUserId: string | null;
  onNotification?: (notification: Notification) => void;
}

export function useNotificationSocket({
  token,
  currentUserId,
  onNotification,
}: UseNotificationSocketProps) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    socket.on('connect', () => {
      console.log(`🟢 Connected to WebSocket server`);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Disconnected from WebSocket server');
    });

    socket.on('new-notification', (notification: Notification) => {
      onNotification?.(notification);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, currentUserId, onNotification]);

  return socketRef;
}
