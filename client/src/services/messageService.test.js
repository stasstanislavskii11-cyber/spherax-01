import { mergeMessageHistory, saveSystemMessage } from './messageService';
import { loadMessagesFromStorage, saveMessagesToStorage } from './storageService';
import { GLOBAL_ROOM } from '../utils/constants';

// Mock the storage service
jest.mock('./storageService', () => ({
  loadMessagesFromStorage: jest.fn(),
  saveMessagesToStorage: jest.fn(),
}));

describe('messageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('mergeMessageHistory', () => {
    it('should merge server messages with stored messages', () => {
      const room = 'general';
      const storedMessages = [
        { text: 'Old message', timestamp: '2024-01-15T10:00:00.000Z', room, username: 'user1' }
      ];
      const serverMessages = [
        { text: 'New message', timestamp: '2024-01-15T11:00:00.000Z', username: 'user2' }
      ];

      loadMessagesFromStorage.mockReturnValue(storedMessages);

      const result = mergeMessageHistory(room, serverMessages);

      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('Old message');
      expect(result[1].text).toBe('New message');
    });

    it('should deduplicate messages by timestamp and text', () => {
      const room = 'general';
      const storedMessages = [
        { text: 'Same message', timestamp: '2024-01-15T10:00:00.000Z', room, username: 'user1' }
      ];
      const serverMessages = [
        { text: 'Same message', timestamp: '2024-01-15T10:00:00.000Z', username: 'user1' }
      ];

      loadMessagesFromStorage.mockReturnValue(storedMessages);

      const result = mergeMessageHistory(room, serverMessages);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Same message');
    });

    it('should sort messages by timestamp', () => {
      const room = 'general';
      const storedMessages = [
        { text: 'Second', timestamp: '2024-01-15T11:00:00.000Z', room, username: 'user1' }
      ];
      const serverMessages = [
        { text: 'First', timestamp: '2024-01-15T10:00:00.000Z', username: 'user2' }
      ];

      loadMessagesFromStorage.mockReturnValue(storedMessages);

      const result = mergeMessageHistory(room, serverMessages);

      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('First');
      expect(result[1].text).toBe('Second');
    });

    it('should filter stored messages by room', () => {
      const room = 'general';
      const storedMessages = [
        { text: 'General message', timestamp: '2024-01-15T10:00:00.000Z', room: 'general', username: 'user1' },
        { text: 'Other room message', timestamp: '2024-01-15T10:00:00.000Z', room: 'random', username: 'user1' }
      ];
      const serverMessages = [];

      loadMessagesFromStorage.mockReturnValue(storedMessages);

      const result = mergeMessageHistory(room, serverMessages);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('General message');
    });

    it('should handle empty server messages', () => {
      const room = 'general';
      const storedMessages = [
        { text: 'Stored message', timestamp: '2024-01-15T10:00:00.000Z', room, username: 'user1' }
      ];

      loadMessagesFromStorage.mockReturnValue(storedMessages);

      const result = mergeMessageHistory(room, []);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Stored message');
    });

    it('should handle null or undefined server messages', () => {
      const room = 'general';
      const storedMessages = [
        { text: 'Stored message', timestamp: '2024-01-15T10:00:00.000Z', room, username: 'user1' }
      ];

      loadMessagesFromStorage.mockReturnValue(storedMessages);

      const result1 = mergeMessageHistory(room, null);
      const result2 = mergeMessageHistory(room, undefined);

      expect(result1).toHaveLength(1);
      expect(result2).toHaveLength(1);
    });
  });

  describe('saveSystemMessage', () => {
    it('should save system message for global room', () => {
      const message = {
        type: 'system',
        text: 'User joined',
        timestamp: '2024-01-15T10:00:00.000Z',
        room: GLOBAL_ROOM
      };

      loadMessagesFromStorage.mockReturnValue([]);

      saveSystemMessage(message);

      expect(saveMessagesToStorage).toHaveBeenCalledWith(
        GLOBAL_ROOM,
        expect.arrayContaining([
          expect.objectContaining({
            type: 'system',
            text: 'User joined',
            room: GLOBAL_ROOM
          })
        ])
      );
    });

    it('should not save system message for non-global room', () => {
      const message = {
        type: 'system',
        text: 'User joined',
        timestamp: '2024-01-15T10:00:00.000Z',
        room: 'general'
      };

      saveSystemMessage(message);

      expect(saveMessagesToStorage).not.toHaveBeenCalled();
    });

    it('should limit global messages to 200', () => {
      const message = {
        type: 'system',
        text: 'User joined',
        timestamp: '2024-01-15T10:00:00.000Z',
        room: GLOBAL_ROOM
      };

      const existingMessages = Array.from({ length: 200 }, (_, i) => ({
        type: 'system',
        text: `Message ${i}`,
        timestamp: `2024-01-15T${String(10 + i).padStart(2, '0')}:00:00.000Z`,
        room: GLOBAL_ROOM
      }));

      loadMessagesFromStorage.mockReturnValue(existingMessages);

      saveSystemMessage(message);

      expect(saveMessagesToStorage).toHaveBeenCalledWith(
        GLOBAL_ROOM,
        expect.arrayContaining([
          expect.objectContaining({ text: 'User joined' })
        ])
      );

      const savedMessages = saveMessagesToStorage.mock.calls[0][1];
      expect(savedMessages.length).toBe(200);
      expect(savedMessages[0].text).toBe('Message 1'); // First message should be removed
    });
  });
});



