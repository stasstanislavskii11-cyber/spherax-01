import { STORAGE_KEY, USERNAME_KEY, ROOM_KEY, DEFAULT_ROOM } from '../utils/constants';

export const saveMessagesToStorage = (room, messages) => {
  try {
    const storage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    storage[room] = messages;
    // Limit to last 200 messages per room to avoid storage issues
    if (storage[room].length > 200) {
      storage[room] = storage[room].slice(-200);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadMessagesFromStorage = (room) => {
  try {
    const storage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return storage[room] || [];
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return [];
  }
};

export const saveUsernameToStorage = (username) => {
  try {
    if (username) {
      localStorage.setItem(USERNAME_KEY, username);
    } else {
      localStorage.removeItem(USERNAME_KEY);
    }
  } catch (error) {
    console.error('Error saving username to localStorage:', error);
  }
};

export const loadUsernameFromStorage = () => {
  try {
    return localStorage.getItem(USERNAME_KEY) || '';
  } catch (error) {
    console.error('Error loading username from localStorage:', error);
    return '';
  }
};

export const saveRoomToStorage = (room) => {
  try {
    if (room) {
      localStorage.setItem(ROOM_KEY, room);
    }
  } catch (error) {
    console.error('Error saving room to localStorage:', error);
  }
};

export const loadRoomFromStorage = () => {
  try {
    return localStorage.getItem(ROOM_KEY) || DEFAULT_ROOM;
  } catch (error) {
    console.error('Error loading room from localStorage:', error);
    return DEFAULT_ROOM;
  }
};

