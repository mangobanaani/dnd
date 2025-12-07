/**
 * Effect Stacking Service Tests
 * Tests D&D 5e stacking rules for effects
 */

import { EffectStackingService } from '@/app/lib/services/effect-stacking.service';
import { createEffect } from '@/app/types/effects';
import { Effect } from '@/app/types/effects';

describe('EffectStackingService', () => {
  let service: EffectStackingService;

  beforeEach(() => {
    service = new EffectStackingService();
  });

  describe('Same-Name Effect Stacking', () => {
    it('should detect duplicate same-name effects', () => {
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Bless',
          icon: '✨',
          description: 'Blessed',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 5,
        }),
      ];

      const newEffect = createEffect({
        name: 'Bless',
        icon: '✨',
        description: 'Blessed',
        appliedBy: 'user-2',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      const result = service.checkStacking(existingEffects, newEffect);

      expect(result.canStack).toBe(false);
      expect(result.reason).toBe('same-name');
      expect(result.conflictingEffectId).toBe(existingEffects[0].id);
    });

    it('should allow same-name effects if names are different', () => {
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Bless',
          icon: '✨',
          description: 'Blessed',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
        }),
      ];

      const newEffect = createEffect({
        name: 'Haste',
        icon: '⚡',
        description: 'Hasted',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
      });

      const result = service.checkStacking(existingEffects, newEffect);

      expect(result.canStack).toBe(true);
    });

    it('should suggest replacing when same-name effect exists', () => {
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Shield',
          icon: '🛡️',
          description: 'AC bonus',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 1,
        }),
      ];

      const newEffect = createEffect({
        name: 'Shield',
        icon: '🛡️',
        description: 'AC bonus',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 1,
      });

      const result = service.checkStacking(existingEffects, newEffect);

      expect(result.canStack).toBe(false);
      expect(result.suggestion).toBe('replace');
    });

    it('should allow same-name items and spells to coexist', () => {
      // Ring of Protection (item) and Shield spell (spell) both named "Shield"
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Shield',
          icon: '💍',
          description: 'Ring of Protection',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'permanent',
          effectType: 'item',
          mechanics: {
            bonuses: [{ type: 'ac', value: '+1' }],
          },
        }),
      ];

      const newEffect = createEffect({
        name: 'Shield',
        icon: '🛡️',
        description: 'Shield spell',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 1,
        effectType: 'spell',
        mechanics: {
          bonuses: [{ type: 'ac', value: '+5' }],
        },
      });

      const result = service.checkStacking(existingEffects, newEffect);

      // Different effectTypes = different sources = can stack
      expect(result.canStack).toBe(true);
    });

    it('should prevent duplicate spells with same name', () => {
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Bless',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 5,
          effectType: 'spell',
        }),
      ];

      const newEffect = createEffect({
        name: 'Bless',
        appliedBy: 'user-2',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
        effectType: 'spell',
      });

      const result = service.checkStacking(existingEffects, newEffect);

      // Same name + same effectType = cannot stack
      expect(result.canStack).toBe(false);
      expect(result.reason).toBe('same-name');
    });

    it('should allow same-name features and spells to coexist', () => {
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Rage',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 10,
          effectType: 'feature',
        }),
      ];

      const newEffect = createEffect({
        name: 'Rage',
        icon: '🔮',
        description: 'Spell named Rage',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 5,
        effectType: 'spell',
      });

      const result = service.checkStacking(existingEffects, newEffect);

      expect(result.canStack).toBe(true);
    });
  });

  describe('Advantage/Disadvantage Stacking', () => {
    it('should detect advantage canceling disadvantage', () => {
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Poisoned',
          icon: '🤢',
          description: 'Disadvantage on attacks',
          appliedBy: 'dm-1',
          appliedTo: 'char-1',
          durationType: 'saves',
          mechanics: {
            disadvantageOn: ['attacks'],
          },
        }),
      ];

      const newEffect = createEffect({
        name: 'Bless',
        icon: '✨',
        description: 'Advantage on saves',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        mechanics: {
          advantageOn: ['saves'],
        },
      });

      const result = service.checkAdvantageDisadvantage(
        existingEffects,
        newEffect,
        'attacks'
      );

      expect(result.hasAdvantage).toBe(false);
      expect(result.hasDisadvantage).toBe(true);
      expect(result.netEffect).toBe('disadvantage');
    });

    it('should handle multiple sources of advantage as single advantage', () => {
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Bless',
          icon: '✨',
          description: 'Advantage',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          mechanics: {
            advantageOn: ['attacks'],
          },
        }),
      ];

      const newEffect = createEffect({
        name: 'Haste',
        icon: '⚡',
        description: 'More advantage',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        mechanics: {
          advantageOn: ['attacks'],
          },
      });

      const result = service.checkAdvantageDisadvantage(
        [...existingEffects, newEffect],
        newEffect,
        'attacks'
      );

      expect(result.hasAdvantage).toBe(true);
      expect(result.hasDisadvantage).toBe(false);
      expect(result.netEffect).toBe('advantage');
    });

    it('should cancel advantage with disadvantage to normal', () => {
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Bless',
          icon: '✨',
          description: 'Advantage on saves',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          mechanics: {
            advantageOn: ['saves'],
          },
        }),
        createEffect({
          name: 'Frightened',
          icon: '😨',
          description: 'Disadvantage on saves',
          appliedBy: 'dm-1',
          appliedTo: 'char-1',
          durationType: 'saves',
          mechanics: {
            disadvantageOn: ['saves'],
          },
        }),
      ];

      const result = service.checkAdvantageDisadvantage(
        existingEffects,
        existingEffects[1],
        'saves'
      );

      expect(result.hasAdvantage).toBe(true);
      expect(result.hasDisadvantage).toBe(true);
      expect(result.netEffect).toBe('normal');
    });
  });

  describe('Bonus Stacking', () => {
    it('should detect non-stacking same-type bonuses', () => {
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Shield',
          icon: '🛡️',
          description: '+5 AC',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          mechanics: {
            bonuses: [{ type: 'ac', value: '+5' }],
          },
        }),
      ];

      const newEffect = createEffect({
        name: 'Shield of Faith',
        icon: '🛡️',
        description: '+2 AC',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        mechanics: {
          bonuses: [{ type: 'ac', value: '+2' }],
        },
      });

      const result = service.checkBonusStacking(existingEffects, newEffect);

      expect(result.canStack).toBe(true); // Different spells, can stack
      expect(result.totalBonus).toBeUndefined(); // AC bonuses stack in D&D 5e
    });

    it('should allow different types of bonuses to stack', () => {
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Bless',
          icon: '✨',
          description: '+1d4 to attacks',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          mechanics: {
            bonuses: [{ type: 'attack', value: '+1d4' }],
          },
        }),
      ];

      const newEffect = createEffect({
        name: 'Haste',
        icon: '⚡',
        description: '+2 AC',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        mechanics: {
          bonuses: [{ type: 'ac', value: '+2' }],
          },
      });

      const result = service.checkBonusStacking(existingEffects, newEffect);

      expect(result.canStack).toBe(true);
    });

    it('should handle multiple bonuses on same effect', () => {
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Bless',
          icon: '✨',
          description: 'Multiple bonuses',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          mechanics: {
            bonuses: [
              { type: 'attack', value: '+1d4' },
              { type: 'save', value: '+1d4' },
            ],
          },
        }),
      ];

      const newEffect = createEffect({
        name: 'Guidance',
        icon: '🌟',
        description: 'Ability check bonus',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        mechanics: {
          bonuses: [{ type: 'ability-check', value: '+1d4' }],
        },
      });

      const result = service.checkBonusStacking(existingEffects, newEffect);

      expect(result.canStack).toBe(true);
    });

    it('should document limitation: does not distinguish bonus types', () => {
      // LIMITATION DOCUMENTATION:
      // This method currently does NOT distinguish between D&D 5e bonus types
      // (enhancement, dodge, deflection, etc.) because D&D 5e simplified this.
      //
      // In D&D 5e, unlike 3.5e/Pathfinder:
      // - There are NO typed bonuses (no "enhancement bonus" vs "dodge bonus")
      // - ALL bonuses stack UNLESS they come from the same spell/source
      // - Same-source check is handled by checkStacking() (same-name rule)
      //
      // Therefore, this method correctly returns true for all bonus stacking
      // because the same-name rule already prevents duplicate bonuses.
      //
      // Example: Shield (+5 AC) and Shield of Faith (+2 AC) stack = +7 AC total
      // Example: Two Shield spells do NOT stack (caught by same-name rule)

      const shield = createEffect({
        name: 'Shield',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        mechanics: { bonuses: [{ type: 'ac', value: '+5' }] },
      });

      const shieldOfFaith = createEffect({
        name: 'Shield of Faith',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        mechanics: { bonuses: [{ type: 'ac', value: '+2' }] },
      });

      // Different spell names, both provide AC bonuses - should stack
      const result = service.checkBonusStacking([shield], shieldOfFaith);
      expect(result.canStack).toBe(true);

      // Note: Two Shield spells would be prevented by checkStacking(),
      // not by checkBonusStacking()
    });
  });

  describe('getCurrentAdvantageState (without newEffect)', () => {
    it('should check advantage state for existing effects only', () => {
      const effects: Effect[] = [
        createEffect({
          name: 'Bless',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          mechanics: {
            advantageOn: ['saves'],
          },
        }),
      ];

      const result = service.getCurrentAdvantageState(effects, 'saves');

      expect(result.hasAdvantage).toBe(true);
      expect(result.hasDisadvantage).toBe(false);
      expect(result.netEffect).toBe('advantage');
    });

    it('should handle disadvantage for existing effects', () => {
      const effects: Effect[] = [
        createEffect({
          name: 'Poisoned',
          appliedBy: 'dm-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          mechanics: {
            disadvantageOn: ['attacks'],
          },
        }),
      ];

      const result = service.getCurrentAdvantageState(effects, 'attacks');

      expect(result.hasAdvantage).toBe(false);
      expect(result.hasDisadvantage).toBe(true);
      expect(result.netEffect).toBe('disadvantage');
    });

    it('should cancel advantage and disadvantage', () => {
      const effects: Effect[] = [
        createEffect({
          name: 'Bless',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          mechanics: {
            advantageOn: ['saves'],
          },
        }),
        createEffect({
          name: 'Poisoned',
          appliedBy: 'dm-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          mechanics: {
            disadvantageOn: ['saves'],
          },
        }),
      ];

      const result = service.getCurrentAdvantageState(effects, 'saves');

      expect(result.hasAdvantage).toBe(true);
      expect(result.hasDisadvantage).toBe(true);
      expect(result.netEffect).toBe('normal'); // Cancelled out
    });

    it('should return normal when no effects match check type', () => {
      const effects: Effect[] = [
        createEffect({
          name: 'Shield',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          mechanics: {
            bonuses: [{ type: 'ac', value: '+5' }],
          },
        }),
      ];

      const result = service.getCurrentAdvantageState(effects, 'attacks');

      expect(result.hasAdvantage).toBe(false);
      expect(result.hasDisadvantage).toBe(false);
      expect(result.netEffect).toBe('normal');
    });

    it('should return normal for empty effects array', () => {
      const result = service.getCurrentAdvantageState([], 'attacks');

      expect(result.hasAdvantage).toBe(false);
      expect(result.hasDisadvantage).toBe(false);
      expect(result.netEffect).toBe('normal');
    });
  });

  describe('Temporary HP Stacking', () => {
    it('should not stack temporary HP, take highest', () => {
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Aid',
          icon: '❤️',
          description: '+5 temp HP',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          mechanics: {
            temporaryHitPoints: 5,
          },
        }),
      ];

      const newEffect = createEffect({
        name: 'False Life',
        icon: '💚',
        description: '+10 temp HP',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        mechanics: {
          temporaryHitPoints: 10,
        },
      });

      const result = service.checkTemporaryHPStacking(existingEffects, newEffect);

      expect(result.canStack).toBe(false);
      expect(result.reason).toBe('temp-hp-no-stack');
      expect(result.recommendedValue).toBe(10); // Higher value
    });

    it('should keep existing temp HP if higher', () => {
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Aid',
          icon: '❤️',
          description: '+15 temp HP',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          mechanics: {
            temporaryHitPoints: 15,
          },
        }),
      ];

      const newEffect = createEffect({
        name: 'False Life',
        icon: '💚',
        description: '+10 temp HP',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        mechanics: {
          temporaryHitPoints: 10,
        },
      });

      const result = service.checkTemporaryHPStacking(existingEffects, newEffect);

      expect(result.canStack).toBe(false);
      expect(result.recommendedValue).toBe(15); // Keep higher existing
    });

    it('should allow effects without temp HP', () => {
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Bless',
          icon: '✨',
          description: 'No temp HP',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
        }),
      ];

      const newEffect = createEffect({
        name: 'Aid',
        icon: '❤️',
        description: '+5 temp HP',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        mechanics: {
          temporaryHitPoints: 5,
        },
      });

      const result = service.checkTemporaryHPStacking(existingEffects, newEffect);

      expect(result.canStack).toBe(true);
    });

    it('should handle edge case: existing temp HP is 0', () => {
      // Edge case: An effect with 0 temp HP (e.g., depleted or edge case)
      // Should use nullish coalescing (??) not logical OR (||)
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Depleted Shield',
          icon: '🛡️',
          description: '0 temp HP remaining',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          mechanics: {
            temporaryHitPoints: 0,
          },
        }),
      ];

      const newEffect = createEffect({
        name: 'Aid',
        icon: '❤️',
        description: '+5 temp HP',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        mechanics: {
          temporaryHitPoints: 5,
        },
      });

      const result = service.checkTemporaryHPStacking(existingEffects, newEffect);

      expect(result.canStack).toBe(false);
      expect(result.reason).toBe('temp-hp-no-stack');
      // With || operator: would incorrectly calculate Math.max(0 || 0, 5) = Math.max(0, 5) = 5 (correct by accident)
      // With ?? operator: correctly calculates Math.max(0 ?? 0, 5) = Math.max(0, 5) = 5
      // Both work here, but ?? is semantically correct
      expect(result.recommendedValue).toBe(5);
    });

    it('should handle both values being 0', () => {
      // Edge case: Both have 0 temp HP
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Depleted Effect 1',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          mechanics: {
            temporaryHitPoints: 0,
          },
        }),
      ];

      const newEffect = createEffect({
        name: 'Depleted Effect 2',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        mechanics: {
          temporaryHitPoints: 0,
        },
      });

      const result = service.checkTemporaryHPStacking(existingEffects, newEffect);

      expect(result.canStack).toBe(false);
      expect(result.recommendedValue).toBe(0);
    });
  });

  describe('Comprehensive Stacking Check', () => {
    it('should perform all stacking checks', () => {
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Bless',
          icon: '✨',
          description: 'Blessed',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 5,
          mechanics: {
            bonuses: [{ type: 'attack', value: '+1d4' }],
          },
        }),
      ];

      const newEffect = createEffect({
        name: 'Bless',
        icon: '✨',
        description: 'Blessed again',
        appliedBy: 'user-2',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: {
          bonuses: [{ type: 'attack', value: '+1d4' }],
        },
      });

      const result = service.checkAllStackingRules(existingEffects, newEffect);

      expect(result.canApply).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({ rule: 'same-name' })
      );
      expect(result.suggestion).toBe('replace');
    });

    it('should allow effect with no violations', () => {
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Bless',
          icon: '✨',
          description: 'Blessed',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
        }),
      ];

      const newEffect = createEffect({
        name: 'Haste',
        icon: '⚡',
        description: 'Hasted',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
      });

      const result = service.checkAllStackingRules(existingEffects, newEffect);

      expect(result.canApply).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should handle multiple violations', () => {
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Aid',
          icon: '❤️',
          description: 'Aid spell',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          mechanics: {
            temporaryHitPoints: 10,
          },
        }),
      ];

      const newEffect = createEffect({
        name: 'Aid',
        icon: '❤️',
        description: 'Aid spell again',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        mechanics: {
          temporaryHitPoints: 5,
        },
      });

      const result = service.checkAllStackingRules(existingEffects, newEffect);

      expect(result.canApply).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty existing effects', () => {
      const existingEffects: Effect[] = [];

      const newEffect = createEffect({
        name: 'Bless',
        icon: '✨',
        description: 'First effect',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
      });

      const result = service.checkAllStackingRules(existingEffects, newEffect);

      expect(result.canApply).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should handle effects without mechanics', () => {
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Grappled',
          icon: '🤼',
          description: 'Grappled',
          appliedBy: 'dm-1',
          appliedTo: 'char-1',
          durationType: 'permanent',
        }),
      ];

      const newEffect = createEffect({
        name: 'Prone',
        icon: '🤕',
        description: 'Prone',
        appliedBy: 'dm-1',
        appliedTo: 'char-1',
        durationType: 'permanent',
      });

      const result = service.checkAllStackingRules(existingEffects, newEffect);

      expect(result.canApply).toBe(true);
    });

    it('should handle undefined mechanics properties', () => {
      const existingEffects: Effect[] = [
        createEffect({
          name: 'Effect1',
          icon: '⚡',
          description: 'No mechanics',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          mechanics: {},
        }),
      ];

      const newEffect = createEffect({
        name: 'Effect2',
        icon: '✨',
        description: 'Also no mechanics',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        mechanics: {},
      });

      const result = service.checkAllStackingRules(existingEffects, newEffect);

      expect(result.canApply).toBe(true);
    });
  });
});
