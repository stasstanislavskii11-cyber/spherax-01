import { formatTimestamp, getInitialLetter } from './formatters';

describe('formatters', () => {
  describe('formatTimestamp', () => {
    it('should format timestamp correctly', () => {
      const timestamp = '2024-01-15T10:30:00.000Z';
      const formatted = formatTimestamp(timestamp);
      expect(formatted).toMatch(/\d{1,2}:\d{2}/); // Matches time format like "10:30" or "1:30"
    });

    it('should handle different timestamps', () => {
      const timestamp1 = '2024-01-15T14:45:30.000Z';
      const timestamp2 = '2024-01-15T09:05:15.000Z';
      
      const formatted1 = formatTimestamp(timestamp1);
      const formatted2 = formatTimestamp(timestamp2);
      
      expect(formatted1).toBeTruthy();
      expect(formatted2).toBeTruthy();
      expect(formatted1).not.toBe(formatted2);
    });

    it('should return a string', () => {
      const timestamp = new Date().toISOString();
      const formatted = formatTimestamp(timestamp);
      expect(typeof formatted).toBe('string');
    });
  });

  describe('getInitialLetter', () => {
    it('should return first letter uppercase for valid name', () => {
      expect(getInitialLetter('alice')).toBe('A');
      expect(getInitialLetter('bob')).toBe('B');
      expect(getInitialLetter('charlie')).toBe('C');
    });

    it('should handle already uppercase names', () => {
      expect(getInitialLetter('Alice')).toBe('A');
      expect(getInitialLetter('BOB')).toBe('B');
    });

    it('should return "?" for empty string', () => {
      expect(getInitialLetter('')).toBe('?');
    });

    it('should return "?" for null or undefined', () => {
      expect(getInitialLetter(null)).toBe('?');
      expect(getInitialLetter(undefined)).toBe('?');
    });

    it('should return first letter for multi-word names', () => {
      expect(getInitialLetter('alice smith')).toBe('A');
      expect(getInitialLetter('bob jones')).toBe('B');
    });

    it('should handle single character names', () => {
      expect(getInitialLetter('a')).toBe('A');
      expect(getInitialLetter('z')).toBe('Z');
    });
  });
});


