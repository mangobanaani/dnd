/**
 * Effect System Tests
 * Tests for effect creation, validation, and type safety
 */

import {
  Effect,
  Concentration,
  createEffect,
  validateEffect,
  isRoundBasedEffect,
  isSaveBasedEffect,
  isTimeBasedEffect,
  createConcentration,
} from '@/app/types/effects';

describe('Effect Type System', () => {
  describe('createEffect', () => {
    it('should create a basic effect with required fields', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      expect(effect).toMatchObject({
        name: 'Bless',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'rounds',
        roundsRemaining: 10,
        source: 'player',
      });
      expect(effect.id).toBeDefined();
      expect(effect.createdAt).toBeDefined();
    });

    it('should create effect with custom icon and description', () => {
      const effect = createEffect({
        name: 'Poisoned',
        icon: '🤢',
        description: 'Disadvantage on attack rolls and ability checks',
        appliedBy: 'dm-123',
        appliedTo: 'char-456',
        durationType: 'saves',
        saveRequired: {
          ability: 'CON',
          dc: 12,
          timing: 'end',
        },
      });

      expect(effect.icon).toBe('🤢');
      expect(effect.description).toBe('Disadvantage on attack rolls and ability checks');
    });

    it('should create effect with mechanics', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: {
          bonuses: [
            { type: 'attack', value: '+1d4' },
            { type: 'save', value: '+1d4' },
          ],
          requiresConcentration: true,
        },
      });

      expect(effect.mechanics.bonuses).toHaveLength(2);
      expect(effect.mechanics.requiresConcentration).toBe(true);
    });

    it('should default source to player when not specified', () => {
      const effect = createEffect({
        name: 'Test',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'permanent',
      });

      expect(effect.source).toBe('player');
    });

    it('should allow DM source', () => {
      const effect = createEffect({
        name: 'Poisoned',
        appliedBy: 'dm-123',
        appliedTo: 'char-456',
        durationType: 'saves',
        source: 'dm',
        saveRequired: {
          ability: 'CON',
          dc: 12,
          timing: 'end',
        },
      });

      expect(effect.source).toBe('dm');
    });
  });

  describe('validateEffect', () => {
    it('should validate a complete effect', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      expect(() => validateEffect(effect)).not.toThrow();
    });

    it('should reject effect without name', () => {
      const effect = createEffect({
        name: '',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'permanent',
      });

      expect(() => validateEffect(effect)).toThrow('Effect name is required');
    });

    it('should reject effect without appliedBy', () => {
      const effect = createEffect({
        name: 'Test',
        appliedBy: '',
        appliedTo: 'char-456',
        durationType: 'permanent',
      });

      expect(() => validateEffect(effect)).toThrow('appliedBy is required');
    });

    it('should reject effect without appliedTo', () => {
      const effect = createEffect({
        name: 'Test',
        appliedBy: 'user-123',
        appliedTo: '',
        durationType: 'permanent',
      });

      expect(() => validateEffect(effect)).toThrow('appliedTo is required');
    });

    it('should reject round-based effect without roundsRemaining', () => {
      const effect = createEffect({
        name: 'Test',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'rounds',
      });

      expect(() => validateEffect(effect)).toThrow('roundsRemaining is required for round-based effects');
    });

    it('should reject save-based effect without saveRequired', () => {
      const effect = createEffect({
        name: 'Test',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'saves',
      });

      expect(() => validateEffect(effect)).toThrow('saveRequired is required for save-based effects');
    });

    it('should reject time-based effect without timeExpiry', () => {
      const effect = createEffect({
        name: 'Test',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'time',
      });

      expect(() => validateEffect(effect)).toThrow('timeExpiry is required for time-based effects');
    });

    it('should reject invalid roundsRemaining', () => {
      const effect = createEffect({
        name: 'Test',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'rounds',
        roundsRemaining: -5,
      });

      expect(() => validateEffect(effect)).toThrow('roundsRemaining must be positive');
    });

    it('should reject invalid save DC', () => {
      const effect = createEffect({
        name: 'Test',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'saves',
        saveRequired: {
          ability: 'CON',
          dc: 0,
          timing: 'end',
        },
      });

      expect(() => validateEffect(effect)).toThrow('Save DC must be between 1 and 30');
    });
  });

  describe('Effect type guards', () => {
    it('should identify round-based effects', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      expect(isRoundBasedEffect(effect)).toBe(true);
      expect(isSaveBasedEffect(effect)).toBe(false);
      expect(isTimeBasedEffect(effect)).toBe(false);
    });

    it('should identify save-based effects', () => {
      const effect = createEffect({
        name: 'Poisoned',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'saves',
        saveRequired: {
          ability: 'CON',
          dc: 12,
          timing: 'end',
        },
      });

      expect(isRoundBasedEffect(effect)).toBe(false);
      expect(isSaveBasedEffect(effect)).toBe(true);
      expect(isTimeBasedEffect(effect)).toBe(false);
    });

    it('should identify time-based effects', () => {
      const effect = createEffect({
        name: 'Mage Armor',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'time',
        timeExpiry: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      });

      expect(isRoundBasedEffect(effect)).toBe(false);
      expect(isSaveBasedEffect(effect)).toBe(false);
      expect(isTimeBasedEffect(effect)).toBe(true);
    });
  });

  describe('Concentration', () => {
    it('should create concentration tracking', () => {
      const concentration = createConcentration('Bless', ['effect-1', 'effect-2', 'effect-3']);

      expect(concentration).toEqual({
        spell: 'Bless',
        effectIds: ['effect-1', 'effect-2', 'effect-3'],
      });
    });

    it('should handle single effect concentration', () => {
      const concentration = createConcentration('Hold Person', ['effect-1']);

      expect(concentration.spell).toBe('Hold Person');
      expect(concentration.effectIds).toHaveLength(1);
    });

    it('should reject empty spell name', () => {
      expect(() => createConcentration('', ['effect-1'])).toThrow('Spell name is required');
    });

    it('should reject empty effect list', () => {
      expect(() => createConcentration('Bless', [])).toThrow('At least one effect is required');
    });
  });

  describe('Effect mechanics', () => {
    it('should support advantage mechanics', () => {
      const effect = createEffect({
        name: 'Guiding Bolt',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'rounds',
        roundsRemaining: 1,
        mechanics: {
          advantageOn: ['next-attack'],
        },
      });

      expect(effect.mechanics.advantageOn).toContain('next-attack');
    });

    it('should support disadvantage mechanics', () => {
      const effect = createEffect({
        name: 'Poisoned',
        appliedBy: 'dm-123',
        appliedTo: 'char-456',
        durationType: 'saves',
        source: 'dm',
        saveRequired: {
          ability: 'CON',
          dc: 12,
          timing: 'end',
        },
        mechanics: {
          disadvantageOn: ['attacks', 'ability-checks'],
        },
      });

      expect(effect.mechanics.disadvantageOn).toHaveLength(2);
    });

    it('should support damage per round', () => {
      const effect = createEffect({
        name: 'Burning',
        appliedBy: 'dm-123',
        appliedTo: 'char-456',
        durationType: 'rounds',
        source: 'dm',
        roundsRemaining: 3,
        mechanics: {
          damagePerRound: { amount: 5, type: 'fire' },
        },
      });

      expect(effect.mechanics.damagePerRound).toEqual({ amount: 5, type: 'fire' });
    });

    it('should support multiple bonuses', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: {
          bonuses: [
            { type: 'attack', value: '+1d4' },
            { type: 'save', value: '+1d4' },
          ],
        },
      });

      expect(effect.mechanics.bonuses).toHaveLength(2);
      expect(effect.mechanics.bonuses?.[0]).toEqual({ type: 'attack', value: '+1d4' });
    });

    it('should support temporaryHitPoints in mechanics', () => {
      const effect = createEffect({
        name: 'Temp HP Buff',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'rounds',
        roundsRemaining: 5,
        mechanics: {
          temporaryHitPoints: 15,
        },
      });

      expect(effect.mechanics.temporaryHitPoints).toBe(15);
    });

    it('should allow temporaryHitPoints in EffectMechanics interface', () => {
      // This test validates the interface accepts temporaryHitPoints
      const mechanics = {
        temporaryHitPoints: 20,
        bonuses: [{ type: 'ac', value: '+2' }],
      };

      const effect = createEffect({
        name: 'Shield',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'rounds',
        roundsRemaining: 1,
        mechanics,
      });

      expect(effect.mechanics.temporaryHitPoints).toBe(20);
    });

    it('should allow undefined temporaryHitPoints', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: {
          bonuses: [{ type: 'attack', value: '+1d4' }],
        },
      });

      expect(effect.mechanics.temporaryHitPoints).toBeUndefined();
    });
  });

  describe('Effect Type (spell vs item vs feature)', () => {
    it('should support effectType field for spells', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'rounds',
        roundsRemaining: 10,
        effectType: 'spell',
      });

      expect(effect.effectType).toBe('spell');
    });

    it('should support effectType field for items', () => {
      const effect = createEffect({
        name: 'Ring of Protection',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'permanent',
        effectType: 'item',
      });

      expect(effect.effectType).toBe('item');
    });

    it('should support effectType field for features', () => {
      const effect = createEffect({
        name: 'Rage',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'rounds',
        roundsRemaining: 10,
        effectType: 'feature',
      });

      expect(effect.effectType).toBe('feature');
    });

    it('should support effectType field for conditions', () => {
      const effect = createEffect({
        name: 'Poisoned',
        appliedBy: 'dm-123',
        appliedTo: 'char-456',
        durationType: 'saves',
        effectType: 'condition',
        saveRequired: {
          ability: 'CON',
          dc: 12,
          timing: 'end',
        },
      });

      expect(effect.effectType).toBe('condition');
    });

    it('should default effectType to spell when not specified', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-123',
        appliedTo: 'char-456',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      expect(effect.effectType).toBe('spell');
    });
  });
});
