import {
  saveMessagesToStorage,
  loadMessagesFromStorage,
  saveUsernameToStorage,
  loadUsernameFromStorage,
  saveRoomToStorage,
  loadRoomFromStorage
} from './storageService';
import { STORAGE_KEY, USERNAME_KEY, ROOM_KEY, DEFAULT_ROOM } from '../utils/constants';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveMessagesToStorage', () => {
    it('should save messages to localStorage', () => {
      const room = 'general';
      const messages = [
        { text: 'Hello', timestamp: '2024-01-15T10:00:00.000Z', username: 'user1' }
      ];

      saveMessagesToStorage(room, messages);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(stored[room]).toEqual(messages);
    });

    it('should limit messages to 200 per room', () => {
      const room = 'general';
      const messages = Array.from({ length: 250 }, (_, i) => ({
        text: `Message ${i}`,
        timestamp: `2024-01-15T10:00:00.000Z`,
        username: 'user1'
      }));

      saveMessagesToStorage(room, messages);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(stored[room].length).toBe(200);
      expect(stored[room][0].text).toBe('Message 50'); // First 50 should be removed
    });

    it('should handle multiple rooms', () => {
      const room1 = 'general';
      const room2 = 'random';
      const messages1 = [{ text: 'Hello', timestamp: '2024-01-15T10:00:00.000Z', username: 'user1' }];
      const messages2 = [{ text: 'Hi', timestamp: '2024-01-15T11:00:00.000Z', username: 'user2' }];

      saveMessagesToStorage(room1, messages1);
      saveMessagesToStorage(room2, messages2);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(stored[room1]).toEqual(messages1);
      expect(stored[room2]).toEqual(messages2);
    });
  });

  describe('loadMessagesFromStorage', () => {
    it('should load messages from localStorage', () => {
      const room = 'general';
      const messages = [
        { text: 'Hello', timestamp: '2024-01-15T10:00:00.000Z', username: 'user1' }
      ];

      saveMessagesToStorage(room, messages);
      const loaded = loadMessagesFromStorage(room);

      expect(loaded).toEqual(messages);
    });

    it('should return empty array for non-existent room', () => {
      const loaded = loadMessagesFromStorage('nonexistent');
      expect(loaded).toEqual([]);
    });

    it('should return empty array when storage is empty', () => {
      const loaded = loadMessagesFromStorage('general');
      expect(loaded).toEqual([]);
    });
  });

  describe('saveUsernameToStorage', () => {
    it('should save username to localStorage', () => {
      saveUsernameToStorage('alice');
      expect(localStorage.getItem(USERNAME_KEY)).toBe('alice');
    });

    it('should remove username when empty string is provided', () => {
      saveUsernameToStorage('alice');
      saveUsernameToStorage('');
      expect(localStorage.getItem(USERNAME_KEY)).toBeNull();
    });

    it('should remove username when null is provided', () => {
      saveUsernameToStorage('alice');
      saveUsernameToStorage(null);
      expect(localStorage.getItem(USERNAME_KEY)).toBeNull();
    });
  });

  describe('loadUsernameFromStorage', () => {
    it('should load username from localStorage', () => {
      localStorage.setItem(USERNAME_KEY, 'alice');
      const username = loadUsernameFromStorage();
      expect(username).toBe('alice');
    });

    it('should return empty string when username is not set', () => {
      const username = loadUsernameFromStorage();
      expect(username).toBe('');
    });
  });

  describe('saveRoomToStorage', () => {
    it('should save room to localStorage', () => {
      saveRoomToStorage('general');
      expect(localStorage.getItem(ROOM_KEY)).toBe('general');
    });

    it('should update room when called multiple times', () => {
      saveRoomToStorage('general');
      saveRoomToStorage('random');
      expect(localStorage.getItem(ROOM_KEY)).toBe('random');
    });
  });

  describe('loadRoomFromStorage', () => {
    it('should load room from localStorage', () => {
      localStorage.setItem(ROOM_KEY, 'general');
      const room = loadRoomFromStorage();
      expect(room).toBe('general');
    });

    it('should return default room when room is not set', () => {
      const room = loadRoomFromStorage();
      expect(room).toBe(DEFAULT_ROOM);
    });
  });
});

