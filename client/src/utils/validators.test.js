import { validateUsername, validateMessage } from './validators';

describe('validators', () => {
  describe('validateUsername', () => {
    it('should return true for valid username', () => {
      expect(validateUsername('alice')).toBe(true);
      expect(validateUsername('bob123')).toBe(true);
      expect(validateUsername('user_name')).toBe(true);
    });

    it('should return false for empty username', () => {
      expect(validateUsername('')).toBe(false);
      expect(validateUsername('   ')).toBe(false);
    });

    it('should return false for username longer than 50 characters', () => {
      const longUsername = 'a'.repeat(51);
      expect(validateUsername(longUsername)).toBe(false);
    });

    it('should return true for username exactly 50 characters', () => {
      const username = 'a'.repeat(50);
      expect(validateUsername(username)).toBe(true);
    });

    it('should trim whitespace before validation', () => {
      expect(validateUsername('  alice  ')).toBe(true);
    });
  });

  describe('validateMessage', () => {
    it('should return true for valid message', () => {
      expect(validateMessage('Hello world')).toBe(true);
      expect(validateMessage('Test message')).toBe(true);
    });

    it('should return false for empty message', () => {
      expect(validateMessage('')).toBe(false);
      expect(validateMessage('   ')).toBe(false);
    });

    it('should return false for message longer than 500 characters', () => {
      const longMessage = 'a'.repeat(501);
      expect(validateMessage(longMessage)).toBe(false);
    });

    it('should return true for message exactly 500 characters', () => {
      const message = 'a'.repeat(500);
      expect(validateMessage(message)).toBe(true);
    });

    it('should trim whitespace before validation', () => {
      expect(validateMessage('  hello  ')).toBe(true);
    });
  });
});


