/**
 * Character Schema Tests
 * Tests for Zod-based Character validation
 */

import { validateCharacter, characterSchema } from '@/app/lib/schemas/character.schema';
import { createDefaultCharacter } from '@/app/types/character';

describe('Character Schema Validation', () => {
  const createTestCharacter = () => ({
    id: 'char-test-1',
    ...createDefaultCharacter('player-1'),
  });

  describe('validateCharacter', () => {
    it('should validate a complete valid character', () => {
      const character = createTestCharacter();
      const result = validateCharacter(character);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(character.id);
        expect(result.data.name).toBe(character.name);
      }
    });

    it('should validate character with all optional fields', () => {
      const character = {
        ...createTestCharacter(),
        notes: 'Test notes',
        background: 'Acolyte',
        alignment: 'Lawful Good',
      };

      const result = validateCharacter(character);
      expect(result.success).toBe(true);
    });

    it('should fail validation for missing required id', () => {
      const invalidChar = {
        ...createTestCharacter(),
        id: undefined,
      };

      const result = validateCharacter(invalidChar);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('id');
      }
    });

    it('should fail validation for missing required name', () => {
      const invalidChar = {
        ...createTestCharacter(),
        name: undefined,
      };

      const result = validateCharacter(invalidChar);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('name');
      }
    });

    it('should fail validation for invalid level (negative)', () => {
      const invalidChar = {
        ...createTestCharacter(),
        level: -1,
      };

      const result = validateCharacter(invalidChar);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('level');
      }
    });

    it('should fail validation for invalid level (too high)', () => {
      const invalidChar = {
        ...createTestCharacter(),
        level: 21,
      };

      const result = validateCharacter(invalidChar);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('level');
      }
    });

    it('should validate character with effects array', () => {
      const character = {
        ...createTestCharacter(),
        effects: [],
      };

      const result = validateCharacter(character);
      expect(result.success).toBe(true);
    });

    it('should validate character with exhaustion level (0-6)', () => {
      const character = {
        ...createTestCharacter(),
        exhaustionLevel: 3,
      };

      const result = validateCharacter(character);
      expect(result.success).toBe(true);
    });

    it('should fail validation for invalid exhaustion level', () => {
      const invalidChar = {
        ...createTestCharacter(),
        exhaustionLevel: 7,
      };

      const result = validateCharacter(invalidChar);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('exhaustion');
      }
    });

    it('should validate character with valid ability scores', () => {
      const character = {
        ...createTestCharacter(),
        abilityScores: {
          strength: 10,
          dexterity: 14,
          constitution: 12,
          intelligence: 8,
          wisdom: 15,
          charisma: 13,
        },
      };

      const result = validateCharacter(character);
      expect(result.success).toBe(true);
    });

    it('should fail validation for invalid ability score (too low)', () => {
      const defaultChar = createTestCharacter();
      const invalidChar = {
        ...defaultChar,
        abilityScores: {
          ...defaultChar.abilityScores,
          strength: 0,
        },
      };

      const result = validateCharacter(invalidChar);
      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid ability score (too high)', () => {
      const defaultChar = createTestCharacter();
      const invalidChar = {
        ...defaultChar,
        abilityScores: {
          ...defaultChar.abilityScores,
          strength: 31,
        },
      };

      const result = validateCharacter(invalidChar);
      expect(result.success).toBe(false);
    });

    it('should validate character with HP within valid range', () => {
      const character = {
        ...createTestCharacter(),
        maxHitPoints: 50,
        currentHitPoints: 30,
        temporaryHitPoints: 5,
      };

      const result = validateCharacter(character);
      expect(result.success).toBe(true);
    });

    it('should fail validation for negative current HP', () => {
      const invalidChar = {
        ...createTestCharacter(),
        currentHitPoints: -10,
      };

      const result = validateCharacter(invalidChar);
      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid HP (current > max)', () => {
      const invalidChar = {
        ...createTestCharacter(),
        maxHitPoints: 30,
        currentHitPoints: 50,
      };

      const result = validateCharacter(invalidChar);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('current');
      }
    });
  });

  describe('Character from JSON', () => {
    it('should parse and validate valid character JSON', () => {
      const character = createTestCharacter();
      const json = JSON.stringify(character);

      const parsed = JSON.parse(json);
      const result = validateCharacter(parsed);

      expect(result.success).toBe(true);
    });

    it('should fail validation for malformed character data', () => {
      const invalidData = {
        id: 'char-1',
        // Missing required fields
      };

      const result = validateCharacter(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
