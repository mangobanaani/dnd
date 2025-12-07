/**
 * Effect Categorization Tests
 * Tests for categorizing effects as buffs, debuffs, or neutral
 */

import {
  categorizeEffect,
  groupEffectsByCategory,
  isBuffEffect,
  isDebuffEffect,
} from '@/app/lib/utils/effect-categorization';
import { createEffect } from '@/app/types/effects';

describe('Effect Categorization', () => {
  describe('categorizeEffect', () => {
    it('should categorize effect with bonuses as buff', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'cleric-1',
        appliedTo: 'fighter-1',
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: {
          bonuses: [{ type: 'attack', value: '+1d4' }],
        },
      });

      expect(categorizeEffect(effect)).toBe('buff');
    });

    it('should categorize effect with advantage as buff', () => {
      const effect = createEffect({
        name: 'Haste',
        appliedBy: 'wizard-1',
        appliedTo: 'fighter-1',
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: {
          advantageOn: ['dex-saves'],
        },
      });

      expect(categorizeEffect(effect)).toBe('buff');
    });

    it('should categorize effect with temp HP as buff', () => {
      const effect = createEffect({
        name: 'Aid',
        appliedBy: 'cleric-1',
        appliedTo: 'fighter-1',
        durationType: 'rounds',
        roundsRemaining: 4800,
        mechanics: {
          temporaryHitPoints: 5,
        },
      });

      expect(categorizeEffect(effect)).toBe('buff');
    });

    it('should categorize effect with disadvantage as debuff', () => {
      const effect = createEffect({
        name: 'Bane',
        appliedBy: 'enemy-1',
        appliedTo: 'fighter-1',
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: {
          disadvantageOn: ['attacks'],
        },
      });

      expect(categorizeEffect(effect)).toBe('debuff');
    });

    it('should categorize effect with damage as debuff', () => {
      const effect = createEffect({
        name: 'Burning',
        appliedBy: 'enemy-1',
        appliedTo: 'fighter-1',
        durationType: 'rounds',
        roundsRemaining: 3,
        mechanics: {
          damagePerRound: { amount: 5, type: 'fire' },
        },
      });

      expect(categorizeEffect(effect)).toBe('debuff');
    });

    it('should categorize effect with no mechanics as neutral', () => {
      const effect = createEffect({
        name: 'Marked',
        appliedBy: 'dm-1',
        appliedTo: 'fighter-1',
        durationType: 'permanent',
        mechanics: {},
      });

      expect(categorizeEffect(effect)).toBe('neutral');
    });

    it('should prioritize buff over debuff when effect has both', () => {
      const effect = createEffect({
        name: 'Complex Effect',
        appliedBy: 'dm-1',
        appliedTo: 'fighter-1',
        durationType: 'rounds',
        roundsRemaining: 5,
        mechanics: {
          bonuses: [{ type: 'damage', value: '+1d6' }],
          disadvantageOn: ['str-saves'],
        },
      });

      expect(categorizeEffect(effect)).toBe('buff');
    });

    it('should categorize empty bonuses array as neutral', () => {
      const effect = createEffect({
        name: 'Empty Effect',
        appliedBy: 'dm-1',
        appliedTo: 'fighter-1',
        durationType: 'rounds',
        roundsRemaining: 1,
        mechanics: {
          bonuses: [],
        },
      });

      expect(categorizeEffect(effect)).toBe('neutral');
    });

    it('should handle zero temp HP as neutral', () => {
      const effect = createEffect({
        name: 'No Temp HP',
        appliedBy: 'dm-1',
        appliedTo: 'fighter-1',
        durationType: 'rounds',
        roundsRemaining: 1,
        mechanics: {
          temporaryHitPoints: 0,
        },
      });

      expect(categorizeEffect(effect)).toBe('neutral');
    });

    it('should handle zero damage as neutral', () => {
      const effect = createEffect({
        name: 'No Damage',
        appliedBy: 'dm-1',
        appliedTo: 'fighter-1',
        durationType: 'rounds',
        roundsRemaining: 1,
        mechanics: {
          damagePerRound: { amount: 0, type: 'fire' },
        },
      });

      expect(categorizeEffect(effect)).toBe('neutral');
    });
  });

  describe('isBuffEffect', () => {
    it('should return true for buff effects', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'cleric-1',
        appliedTo: 'fighter-1',
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: {
          bonuses: [{ type: 'attack', value: '+1d4' }],
        },
      });

      expect(isBuffEffect(effect)).toBe(true);
    });

    it('should return false for debuff effects', () => {
      const effect = createEffect({
        name: 'Bane',
        appliedBy: 'enemy-1',
        appliedTo: 'fighter-1',
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: {
          disadvantageOn: ['attacks'],
        },
      });

      expect(isBuffEffect(effect)).toBe(false);
    });

    it('should return false for neutral effects', () => {
      const effect = createEffect({
        name: 'Marked',
        appliedBy: 'dm-1',
        appliedTo: 'fighter-1',
        durationType: 'permanent',
        mechanics: {},
      });

      expect(isBuffEffect(effect)).toBe(false);
    });
  });

  describe('isDebuffEffect', () => {
    it('should return true for debuff effects', () => {
      const effect = createEffect({
        name: 'Bane',
        appliedBy: 'enemy-1',
        appliedTo: 'fighter-1',
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: {
          disadvantageOn: ['attacks'],
        },
      });

      expect(isDebuffEffect(effect)).toBe(true);
    });

    it('should return false for buff effects', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'cleric-1',
        appliedTo: 'fighter-1',
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: {
          bonuses: [{ type: 'attack', value: '+1d4' }],
        },
      });

      expect(isDebuffEffect(effect)).toBe(false);
    });

    it('should return false for neutral effects', () => {
      const effect = createEffect({
        name: 'Marked',
        appliedBy: 'dm-1',
        appliedTo: 'fighter-1',
        durationType: 'permanent',
        mechanics: {},
      });

      expect(isDebuffEffect(effect)).toBe(false);
    });
  });

  describe('groupEffectsByCategory', () => {
    it('should group effects into buff, debuff, neutral categories', () => {
      const effects = [
        createEffect({
          name: 'Bless',
          appliedBy: 'cleric-1',
          appliedTo: 'fighter-1',
          durationType: 'rounds',
          roundsRemaining: 10,
          mechanics: {
            bonuses: [{ type: 'attack', value: '+1d4' }],
          },
        }),
        createEffect({
          name: 'Bane',
          appliedBy: 'enemy-1',
          appliedTo: 'fighter-1',
          durationType: 'rounds',
          roundsRemaining: 10,
          mechanics: {
            disadvantageOn: ['attacks'],
          },
        }),
        createEffect({
          name: 'Marked',
          appliedBy: 'dm-1',
          appliedTo: 'fighter-1',
          durationType: 'permanent',
          mechanics: {},
        }),
      ];

      const grouped = groupEffectsByCategory(effects);

      expect(grouped.buff).toHaveLength(1);
      expect(grouped.debuff).toHaveLength(1);
      expect(grouped.neutral).toHaveLength(1);
      expect(grouped.buff[0].name).toBe('Bless');
      expect(grouped.debuff[0].name).toBe('Bane');
      expect(grouped.neutral[0].name).toBe('Marked');
    });

    it('should handle empty array', () => {
      const grouped = groupEffectsByCategory([]);

      expect(grouped.buff).toEqual([]);
      expect(grouped.debuff).toEqual([]);
      expect(grouped.neutral).toEqual([]);
    });

    it('should handle array with only buffs', () => {
      const effects = [
        createEffect({
          name: 'Bless',
          appliedBy: 'cleric-1',
          appliedTo: 'fighter-1',
          durationType: 'rounds',
          roundsRemaining: 10,
          mechanics: {
            bonuses: [{ type: 'attack', value: '+1d4' }],
          },
        }),
        createEffect({
          name: 'Haste',
          appliedBy: 'wizard-1',
          appliedTo: 'fighter-1',
          durationType: 'rounds',
          roundsRemaining: 10,
          mechanics: {
            advantageOn: ['dex-saves'],
          },
        }),
      ];

      const grouped = groupEffectsByCategory(effects);

      expect(grouped.buff).toHaveLength(2);
      expect(grouped.debuff).toEqual([]);
      expect(grouped.neutral).toEqual([]);
    });

    it('should efficiently group in single pass', () => {
      // Create a large array to verify single-pass efficiency
      const effects = Array.from({ length: 100 }, (_, i) =>
        createEffect({
          name: `Effect ${i}`,
          appliedBy: 'dm-1',
          appliedTo: 'fighter-1',
          durationType: 'rounds',
          roundsRemaining: 1,
          mechanics: i % 3 === 0
            ? { bonuses: [{ type: 'attack', value: '+1' }] }
            : i % 3 === 1
            ? { disadvantageOn: ['attacks'] }
            : {},
        })
      );

      const grouped = groupEffectsByCategory(effects);

      expect(grouped.buff.length + grouped.debuff.length + grouped.neutral.length).toBe(100);
    });
  });
});
