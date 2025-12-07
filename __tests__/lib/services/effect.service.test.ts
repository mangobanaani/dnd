/**
 * Effect Service Tests
 * Tests for effect management, duration tracking, and concentration mechanics
 */

import {
  EffectService,
  EffectTarget,
  ConcentrationCheckResult,
} from '@/app/lib/services/effect.service';
import { createEffect, Effect } from '@/app/types/effects';

describe('EffectService', () => {
  let service: EffectService;
  let mockTarget: EffectTarget;

  beforeEach(() => {
    service = new EffectService();
    mockTarget = {
      id: 'char-1',
      effects: [],
      tempHp: 0,
    };
  });

  describe('addEffect', () => {
    it('should add effect to target', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      const updated = service.addEffect(mockTarget, effect);

      expect(updated.effects).toHaveLength(1);
      expect(updated.effects[0]).toEqual(effect);
    });

    it('should add multiple effects', () => {
      const effect1 = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      const effect2 = createEffect({
        name: 'Haste',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      let updated = service.addEffect(mockTarget, effect1);
      updated = service.addEffect(updated, effect2);

      expect(updated.effects).toHaveLength(2);
    });

    it('should set concentration when effect requires it', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: {
          requiresConcentration: true,
        },
      });

      const updated = service.addEffect(mockTarget, effect);

      expect(updated.concentration).toBeDefined();
      expect(updated.concentration?.spell).toBe('Bless');
      expect(updated.concentration?.effectIds).toContain(effect.id);
    });

    it('should break existing concentration when adding new concentration spell', () => {
      const bless = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });

      const haste = createEffect({
        name: 'Haste',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });

      let updated = service.addEffect(mockTarget, bless);
      updated = service.addEffect(updated, haste);

      expect(updated.effects).toHaveLength(1); // Only Haste remains
      expect(updated.effects[0].name).toBe('Haste');
      expect(updated.concentration?.spell).toBe('Haste');
    });
  });

  describe('removeEffect', () => {
    it('should remove effect by ID', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      const withEffect = service.addEffect(mockTarget, effect);
      const updated = service.removeEffect(withEffect, effect.id);

      expect(updated.effects).toHaveLength(0);
    });

    it('should remove only specified effect', () => {
      const effect1 = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      const effect2 = createEffect({
        name: 'Haste',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      let updated = service.addEffect(mockTarget, effect1);
      updated = service.addEffect(updated, effect2);
      updated = service.removeEffect(updated, effect1.id);

      expect(updated.effects).toHaveLength(1);
      expect(updated.effects[0].name).toBe('Haste');
    });

    it('should clear concentration when removing concentrated spell', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });

      const withEffect = service.addEffect(mockTarget, effect);
      const updated = service.removeEffect(withEffect, effect.id);

      expect(updated.concentration).toBeUndefined();
    });

    it('should handle removing non-existent effect', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      const withEffect = service.addEffect(mockTarget, effect);
      const updated = service.removeEffect(withEffect, 'non-existent-id');

      expect(updated.effects).toHaveLength(1);
    });
  });

  describe('tickRound', () => {
    it('should decrement round-based effects', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 3,
      });

      const withEffect = service.addEffect(mockTarget, effect);
      const updated = service.tickRound(withEffect);

      expect(updated.effects[0].roundsRemaining).toBe(2);
    });

    it('should remove effects that reach 0 rounds', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 1,
      });

      const withEffect = service.addEffect(mockTarget, effect);
      const updated = service.tickRound(withEffect);

      expect(updated.effects).toHaveLength(0);
    });

    it('should not affect save-based or permanent effects', () => {
      const saveEffect = createEffect({
        name: 'Poisoned',
        appliedBy: 'dm-1',
        appliedTo: 'char-1',
        durationType: 'saves',
        saveRequired: {
          ability: 'CON',
          dc: 12,
          timing: 'end',
        },
      });

      const permanentEffect = createEffect({
        name: 'Inspiration',
        appliedBy: 'dm-1',
        appliedTo: 'char-1',
        durationType: 'permanent',
      });

      let updated = service.addEffect(mockTarget, saveEffect);
      updated = service.addEffect(updated, permanentEffect);
      updated = service.tickRound(updated);

      expect(updated.effects).toHaveLength(2);
    });

    it('should handle multiple round-based effects', () => {
      const effect1 = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 3,
      });

      const effect2 = createEffect({
        name: 'Haste',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 1,
      });

      let updated = service.addEffect(mockTarget, effect1);
      updated = service.addEffect(updated, effect2);
      updated = service.tickRound(updated);

      expect(updated.effects).toHaveLength(1); // Haste expired
      expect(updated.effects[0].name).toBe('Bless');
      expect(updated.effects[0].roundsRemaining).toBe(2);
    });
  });

  describe('checkConcentration', () => {
    it('should pass check for damage less than 10', () => {
      const result = service.checkConcentration(5);

      expect(result.dc).toBe(10);
      expect(result.passed).toBe(true);
    });

    it('should calculate DC as half damage when greater than 10', () => {
      const result = service.checkConcentration(24);

      expect(result.dc).toBe(12);
    });

    it('should fail check if roll is below DC', () => {
      const result = service.checkConcentration(20, 9);

      expect(result.dc).toBe(10);
      expect(result.passed).toBe(false);
    });

    it('should pass check if roll meets DC', () => {
      const result = service.checkConcentration(20, 10);

      expect(result.dc).toBe(10);
      expect(result.passed).toBe(true);
    });

    it('should pass check if roll exceeds DC', () => {
      const result = service.checkConcentration(20, 15);

      expect(result.dc).toBe(10);
      expect(result.passed).toBe(true);
    });

    it('should handle high damage values', () => {
      const result = service.checkConcentration(100);

      expect(result.dc).toBe(50);
    });
  });

  describe('breakConcentration', () => {
    it('should remove all concentration effects', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });

      const withEffect = service.addEffect(mockTarget, effect);
      const updated = service.breakConcentration(withEffect);

      expect(updated.effects).toHaveLength(0);
      expect(updated.concentration).toBeUndefined();
    });

    it('should keep non-concentration effects', () => {
      const concentrationEffect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });

      const normalEffect = createEffect({
        name: 'Inspiration',
        appliedBy: 'dm-1',
        appliedTo: 'char-1',
        durationType: 'permanent',
      });

      let updated = service.addEffect(mockTarget, concentrationEffect);
      updated = service.addEffect(updated, normalEffect);
      updated = service.breakConcentration(updated);

      expect(updated.effects).toHaveLength(1);
      expect(updated.effects[0].name).toBe('Inspiration');
      expect(updated.concentration).toBeUndefined();
    });

    it('should handle target with no concentration', () => {
      const effect = createEffect({
        name: 'Inspiration',
        appliedBy: 'dm-1',
        appliedTo: 'char-1',
        durationType: 'permanent',
      });

      const withEffect = service.addEffect(mockTarget, effect);
      const updated = service.breakConcentration(withEffect);

      expect(updated.effects).toHaveLength(1);
      expect(updated.concentration).toBeUndefined();
    });
  });

  describe('canRemoveEffect', () => {
    it('should allow DM to remove any effect', () => {
      const effect = createEffect({
        name: 'Poisoned',
        appliedBy: 'dm-1',
        appliedTo: 'char-1',
        durationType: 'saves',
        source: 'dm',
        saveRequired: {
          ability: 'CON',
          dc: 12,
          timing: 'end',
        },
      });

      const canRemove = service.canRemoveEffect('dm-1', effect, true);
      expect(canRemove).toBe(true);
    });

    it('should allow creator to remove their own effect', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'player-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      const canRemove = service.canRemoveEffect('player-1', effect, false);
      expect(canRemove).toBe(true);
    });

    it('should not allow player to remove DM effect', () => {
      const effect = createEffect({
        name: 'Poisoned',
        appliedBy: 'dm-1',
        appliedTo: 'char-1',
        durationType: 'saves',
        source: 'dm',
        saveRequired: {
          ability: 'CON',
          dc: 12,
          timing: 'end',
        },
      });

      const canRemove = service.canRemoveEffect('player-1', effect, false);
      expect(canRemove).toBe(false);
    });

    it('should not allow player to remove another player effect', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'player-1',
        appliedTo: 'char-2',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      const canRemove = service.canRemoveEffect('player-2', effect, false);
      expect(canRemove).toBe(false);
    });
  });

  describe('getEffectsByType', () => {
    it('should filter round-based effects', () => {
      const roundEffect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      const saveEffect = createEffect({
        name: 'Poisoned',
        appliedBy: 'dm-1',
        appliedTo: 'char-1',
        durationType: 'saves',
        saveRequired: {
          ability: 'CON',
          dc: 12,
          timing: 'end',
        },
      });

      let updated = service.addEffect(mockTarget, roundEffect);
      updated = service.addEffect(updated, saveEffect);

      const roundEffects = service.getEffectsByType(updated, 'rounds');
      expect(roundEffects).toHaveLength(1);
      expect(roundEffects[0].name).toBe('Bless');
    });

    it('should return empty array when no effects match', () => {
      const effect = createEffect({
        name: 'Inspiration',
        appliedBy: 'dm-1',
        appliedTo: 'char-1',
        durationType: 'permanent',
      });

      const updated = service.addEffect(mockTarget, effect);
      const roundEffects = service.getEffectsByType(updated, 'rounds');

      expect(roundEffects).toHaveLength(0);
    });
  });
});
