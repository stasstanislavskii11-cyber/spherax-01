export const SERVER_URL = process.env.REACT_APP_SERVER_URL !== undefined && process.env.REACT_APP_SERVER_URL !== '' 
  ? process.env.REACT_APP_SERVER_URL 
  : (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001');
export const DEFAULT_ROOM = 'general';
export const GLOBAL_ROOM = 'global';
export const ROOMS = ['global', 'general', 'random', 'tech', 'gaming'];
export const STORAGE_KEY = 'spherax-chat-history';
export const USERNAME_KEY = 'spherax-username';
export const ROOM_KEY = 'spherax-selected-room';

