import io from 'socket.io-client';
import { SERVER_URL } from '../utils/constants';

export const createSocketConnection = () => {
  return io(SERVER_URL, {
    transports: ['websocket', 'polling']
  });
};

