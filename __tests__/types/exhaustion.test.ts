/**
 * Exhaustion Type System Tests
 * Tests D&D 5e exhaustion mechanics
 */

import {
  ExhaustionLevel,
  ExhaustionEffect,
  getExhaustionEffects,
  validateExhaustionLevel,
  getExhaustionPenalties,
  canIncreaseExhaustion,
  canDecreaseExhaustion,
} from '@/app/types/exhaustion';

describe('Exhaustion Type System', () => {
  describe('ExhaustionLevel validation', () => {
    it('should validate valid exhaustion levels', () => {
      expect(() => validateExhaustionLevel(0)).not.toThrow();
      expect(() => validateExhaustionLevel(1)).not.toThrow();
      expect(() => validateExhaustionLevel(3)).not.toThrow();
      expect(() => validateExhaustionLevel(6)).not.toThrow();
    });

    it('should reject negative exhaustion levels', () => {
      expect(() => validateExhaustionLevel(-1)).toThrow('Exhaustion level must be between 0 and 6');
    });

    it('should reject exhaustion levels above 6', () => {
      expect(() => validateExhaustionLevel(7)).toThrow('Exhaustion level must be between 0 and 6');
    });

    it('should reject non-integer exhaustion levels', () => {
      expect(() => validateExhaustionLevel(2.5)).toThrow('Exhaustion level must be an integer');
    });
  });

  describe('getExhaustionEffects', () => {
    it('should return no effects for level 0', () => {
      const effects = getExhaustionEffects(0);
      expect(effects).toHaveLength(0);
    });

    it('should return correct effects for level 1', () => {
      const effects = getExhaustionEffects(1);
      expect(effects).toHaveLength(1);
      expect(effects[0]).toMatchObject({
        level: 1,
        description: 'Disadvantage on ability checks',
        disadvantageOn: ['ability-checks'],
      });
    });

    it('should return cumulative effects for level 3', () => {
      const effects = getExhaustionEffects(3);
      expect(effects).toHaveLength(3);
      expect(effects.map(e => e.level)).toEqual([1, 2, 3]);
      expect(effects[2]).toMatchObject({
        level: 3,
        description: 'Disadvantage on attack rolls and saving throws',
      });
    });

    it('should return all effects for level 6', () => {
      const effects = getExhaustionEffects(6);
      expect(effects).toHaveLength(6);
      expect(effects[5]).toMatchObject({
        level: 6,
        description: 'Death',
        isDeath: true,
      });
    });

    it('should include speed reduction for level 2', () => {
      const effects = getExhaustionEffects(2);
      const level2Effect = effects.find(e => e.level === 2);
      expect(level2Effect).toMatchObject({
        speedMultiplier: 0.5,
      });
    });

    it('should include HP max halved for level 4', () => {
      const effects = getExhaustionEffects(4);
      const level4Effect = effects.find(e => e.level === 4);
      expect(level4Effect).toMatchObject({
        hpMaxMultiplier: 0.5,
      });
    });

    it('should include speed 0 for level 5', () => {
      const effects = getExhaustionEffects(5);
      const level5Effect = effects.find(e => e.level === 5);
      expect(level5Effect).toMatchObject({
        speedMultiplier: 0,
      });
    });
  });

  describe('getExhaustionPenalties', () => {
    it('should aggregate disadvantages from all levels', () => {
      const penalties = getExhaustionPenalties(3);
      expect(penalties.disadvantageOn).toContain('ability-checks');
      expect(penalties.disadvantageOn).toContain('attacks');
      expect(penalties.disadvantageOn).toContain('saves');
    });

    it('should use most restrictive speed modifier', () => {
      const penalties2 = getExhaustionPenalties(2);
      expect(penalties2.speedMultiplier).toBe(0.5);

      const penalties5 = getExhaustionPenalties(5);
      expect(penalties5.speedMultiplier).toBe(0); // Most restrictive
    });

    it('should return death flag for level 6', () => {
      const penalties = getExhaustionPenalties(6);
      expect(penalties.isDeath).toBe(true);
    });

    it('should return no penalties for level 0', () => {
      const penalties = getExhaustionPenalties(0);
      expect(penalties.disadvantageOn).toHaveLength(0);
      expect(penalties.speedMultiplier).toBe(1);
      expect(penalties.hpMaxMultiplier).toBe(1);
      expect(penalties.isDeath).toBe(false);
    });

    it('should include HP max multiplier', () => {
      const penalties = getExhaustionPenalties(4);
      expect(penalties.hpMaxMultiplier).toBe(0.5);
    });
  });

  describe('canIncreaseExhaustion', () => {
    it('should allow increasing from 0 to 1', () => {
      expect(canIncreaseExhaustion(0)).toBe(true);
    });

    it('should allow increasing from 5 to 6', () => {
      expect(canIncreaseExhaustion(5)).toBe(true);
    });

    it('should not allow increasing from 6', () => {
      expect(canIncreaseExhaustion(6)).toBe(false);
    });

    it('should not allow increasing from invalid level', () => {
      expect(canIncreaseExhaustion(-1)).toBe(false);
      expect(canIncreaseExhaustion(7)).toBe(false);
    });
  });

  describe('canDecreaseExhaustion', () => {
    it('should allow decreasing from 6 to 5', () => {
      expect(canDecreaseExhaustion(6)).toBe(true);
    });

    it('should allow decreasing from 1 to 0', () => {
      expect(canDecreaseExhaustion(1)).toBe(true);
    });

    it('should not allow decreasing from 0', () => {
      expect(canDecreaseExhaustion(0)).toBe(false);
    });

    it('should not allow decreasing from invalid level', () => {
      expect(canDecreaseExhaustion(-1)).toBe(false);
      expect(canDecreaseExhaustion(7)).toBe(false);
    });
  });

  describe('ExhaustionEffect structure', () => {
    it('should have all required properties', () => {
      const effects = getExhaustionEffects(3);
      effects.forEach(effect => {
        expect(effect).toHaveProperty('level');
        expect(effect).toHaveProperty('description');
        expect(typeof effect.level).toBe('number');
        expect(typeof effect.description).toBe('string');
      });
    });

    it('should have optional penalty properties', () => {
      const level1 = getExhaustionEffects(1)[0];
      expect(level1.disadvantageOn).toBeDefined();

      const level2 = getExhaustionEffects(2)[1];
      expect(level2.speedMultiplier).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple calls consistently', () => {
      const effects1 = getExhaustionEffects(3);
      const effects2 = getExhaustionEffects(3);
      expect(effects1).toEqual(effects2);
    });

    it('should handle all valid levels', () => {
      for (let level = 0; level <= 6; level++) {
        const effects = getExhaustionEffects(level as ExhaustionLevel);
        expect(effects).toHaveLength(level);
      }
    });

    it('should maintain level order in effects array', () => {
      const effects = getExhaustionEffects(6);
      for (let i = 0; i < effects.length; i++) {
        expect(effects[i].level).toBe(i + 1);
      }
    });
  });
});
