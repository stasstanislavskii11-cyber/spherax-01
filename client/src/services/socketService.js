import io from 'socket.io-client';
import { SERVER_URL } from '../utils/constants';

export const createSocketConnection = () => {
  return io(SERVER_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
    timeout: 20000
  });
};

