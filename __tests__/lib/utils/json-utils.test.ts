/**
 * JSON Utils Tests
 * Safe JSON parsing with error handling
 */

import { safeParseJSON } from '@/app/lib/utils/json-utils';

describe('safeParseJSON', () => {
  describe('Valid JSON', () => {
    it('should parse valid JSON object', () => {
      const json = '{"name": "Test", "value": 42}';
      const result = safeParseJSON(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'Test', value: 42 });
      }
    });

    it('should parse valid JSON array', () => {
      const json = '[1, 2, 3]';
      const result = safeParseJSON(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([1, 2, 3]);
      }
    });

    it('should parse JSON with nested objects', () => {
      const json = '{"user": {"name": "Alice", "age": 30}}';
      const result = safeParseJSON<{ user: { name: string; age: number } }>(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.user.name).toBe('Alice');
      }
    });

    it('should parse empty object', () => {
      const json = '{}';
      const result = safeParseJSON(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });

    it('should parse empty array', () => {
      const json = '[]';
      const result = safeParseJSON(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });
  });

  describe('Invalid JSON', () => {
    it('should handle malformed JSON', () => {
      const json = '{invalid json}';
      const result = safeParseJSON(json);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error).toContain('JSON');
      }
    });

    it('should handle unclosed brackets', () => {
      const json = '{"name": "Test"';
      const result = safeParseJSON(json);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should handle invalid escape sequences', () => {
      const json = '{"name": "\\xInvalid"}';
      const result = safeParseJSON(json);

      expect(result.success).toBe(false);
    });

    it('should handle trailing commas', () => {
      const json = '{"name": "Test",}';
      const result = safeParseJSON(json);

      // JSON.parse in strict mode rejects trailing commas
      expect(result.success).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      const result = safeParseJSON('');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should handle null string', () => {
      const json = 'null';
      const result = safeParseJSON(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it('should handle boolean true', () => {
      const json = 'true';
      const result = safeParseJSON(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(true);
      }
    });

    it('should handle number', () => {
      const json = '42';
      const result = safeParseJSON(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(42);
      }
    });
  });

  describe('With Default Value', () => {
    it('should return default value on parse failure', () => {
      const json = '{invalid}';
      const defaultValue = { name: 'Default' };
      const result = safeParseJSON(json, defaultValue);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.defaultValue).toEqual(defaultValue);
      }
    });

    it('should not use default value on success', () => {
      const json = '{"name": "Valid"}';
      const defaultValue = { name: 'Default' };
      const result = safeParseJSON(json, defaultValue);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Valid');
      }
    });
  });

  describe('Type Safety with Generic', () => {
    interface User {
      name: string;
      age: number;
    }

    it('should maintain type information', () => {
      const json = '{"name": "Alice", "age": 30}';
      const result = safeParseJSON<User>(json);

      expect(result.success).toBe(true);
      if (result.success) {
        // TypeScript should infer data as User
        expect(result.data.name).toBe('Alice');
        expect(result.data.age).toBe(30);
      }
    });
  });
});
