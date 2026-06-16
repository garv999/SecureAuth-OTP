import { describe, it, expect } from 'vitest';
import { formatSessionAge } from './session';

describe('Session Utils', () => {
  describe('formatSessionAge', () => {
    it('should format minutes correctly', () => {
      const past = new Date(Date.now() - 5 * 60000).toISOString();
      expect(formatSessionAge(past)).toBe('5m');
    });

    it('should format hours and minutes correctly', () => {
      const past = new Date(Date.now() - (2 * 60 * 60000 + 15 * 60000)).toISOString();
      expect(formatSessionAge(past)).toBe('2h 15m');
    });

    it('should return 0m for future or immediate dates', () => {
      expect(formatSessionAge(new Date().toISOString())).toBe('0m');
    });
  });
});
