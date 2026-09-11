import { useEffect, useState } from 'react';
import { socket } from '../services/socket';

export function useSocket() {
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      setConnectionError(null);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onConnectError(err: Error) {
      setIsConnected(false);
      setConnectionError(err.message || 'Failed to connect to game server');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    // Initial check
    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, []);

  return { socket, isConnected, connectionError };
}
