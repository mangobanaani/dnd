/**
 * Combat Effects Integration Tests
 * Tests for integrating effects into combat flow
 */

import {
  applyStartOfTurnEffects,
  getRequiredSavingThrows,
  checkConcentrationDamage,
  syncCombatantToCharacter,
  syncCharacterToCombatant,
} from '@/app/lib/utils/combat-effects';
import { createEffect } from '@/app/types/effects';
import { createCombatantFromCharacter } from '@/app/lib/factories/combatant.factory';
import { createDefaultCharacter } from '@/app/lib/factories/character.factory';

describe('Combat Effects Integration', () => {
  describe('applyStartOfTurnEffects', () => {
    it('should apply damage from start-of-turn effects', () => {
      const character = createDefaultCharacter('user-1');
      character.currentHitPoints = 50;
      const combatant = createCombatantFromCharacter(character, 15);

      const burningEffect = createEffect({
        name: 'Burning',
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
        durationType: 'rounds',
        roundsRemaining: 3,
        mechanics: {
          damagePerRound: {
            amount: 5,
            type: 'fire',
            timing: 'start',
          },
        },
      });

      combatant.effects = [burningEffect];

      const result = applyStartOfTurnEffects(combatant);

      expect(result.currentHitPoints).toBe(45); // 50 - 5
      expect(result.damageLog).toHaveLength(1);
      expect(result.damageLog[0]).toMatchObject({
        source: 'Burning',
        amount: 5,
        type: 'fire',
      });
    });

    it('should apply temporary hit points to absorb damage', () => {
      const character = createDefaultCharacter('user-1');
      character.currentHitPoints = 50;
      const combatant = createCombatantFromCharacter(character, 15);
      combatant.temporaryHitPoints = 10;

      const burningEffect = createEffect({
        name: 'Burning',
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
        durationType: 'rounds',
        roundsRemaining: 3,
        mechanics: {
          damagePerRound: {
            amount: 5,
            type: 'fire',
            timing: 'start',
          },
        },
      });

      combatant.effects = [burningEffect];

      const result = applyStartOfTurnEffects(combatant);

      expect(result.currentHitPoints).toBe(50); // Not damaged, temp HP absorbed it
      expect(result.temporaryHitPoints).toBe(5); // 10 - 5
    });

    it('should overflow damage to real HP when temp HP depleted', () => {
      const character = createDefaultCharacter('user-1');
      character.currentHitPoints = 50;
      const combatant = createCombatantFromCharacter(character, 15);
      combatant.temporaryHitPoints = 3;

      const burningEffect = createEffect({
        name: 'Burning',
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
        durationType: 'rounds',
        roundsRemaining: 3,
        mechanics: {
          damagePerRound: {
            amount: 5,
            type: 'fire',
            timing: 'start',
          },
        },
      });

      combatant.effects = [burningEffect];

      const result = applyStartOfTurnEffects(combatant);

      expect(result.currentHitPoints).toBe(48); // 50 - 2 (overflow)
      expect(result.temporaryHitPoints).toBe(0); // Depleted
    });

    it('should handle multiple damage effects', () => {
      const character = createDefaultCharacter('user-1');
      character.currentHitPoints = 50;
      const combatant = createCombatantFromCharacter(character, 15);

      const burning = createEffect({
        name: 'Burning',
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
        durationType: 'rounds',
        roundsRemaining: 3,
        mechanics: {
          damagePerRound: { amount: 5, type: 'fire', timing: 'start' },
        },
      });

      const poison = createEffect({
        name: 'Poisoned',
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
        durationType: 'rounds',
        roundsRemaining: 5,
        mechanics: {
          damagePerRound: { amount: 3, type: 'poison', timing: 'start' },
        },
      });

      combatant.effects = [burning, poison];

      const result = applyStartOfTurnEffects(combatant);

      expect(result.currentHitPoints).toBe(42); // 50 - 5 - 3
      expect(result.damageLog).toHaveLength(2);
    });

    it('should skip end-of-turn damage effects', () => {
      const character = createDefaultCharacter('user-1');
      character.currentHitPoints = 50;
      const combatant = createCombatantFromCharacter(character, 15);

      const effect = createEffect({
        name: 'Delayed Burn',
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
        durationType: 'rounds',
        roundsRemaining: 3,
        mechanics: {
          damagePerRound: { amount: 5, type: 'fire', timing: 'end' },
        },
      });

      combatant.effects = [effect];

      const result = applyStartOfTurnEffects(combatant);

      expect(result.currentHitPoints).toBe(50); // No damage
      expect(result.damageLog).toHaveLength(0);
    });
  });

  describe('getRequiredSavingThrows', () => {
    it('should return empty array if no save-based effects', () => {
      const character = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(character, 15);

      const result = getRequiredSavingThrows(combatant, 'start');

      expect(result).toEqual([]);
    });

    it('should return saves for start-of-turn effects', () => {
      const character = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(character, 15);

      const effect = createEffect({
        name: 'Poisoned',
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
        durationType: 'saves',
        saveRequired: {
          ability: 'CON',
          dc: 12,
          timing: 'start',
        },
      });

      combatant.effects = [effect];

      const result = getRequiredSavingThrows(combatant, 'start');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        effectId: effect.id,
        effectName: 'Poisoned',
        ability: 'CON',
        dc: 12,
      });
    });

    it('should not return end-of-turn saves when checking start', () => {
      const character = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(character, 15);

      const effect = createEffect({
        name: 'Paralyzed',
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
        durationType: 'saves',
        saveRequired: {
          ability: 'CON',
          dc: 15,
          timing: 'end',
        },
      });

      combatant.effects = [effect];

      const result = getRequiredSavingThrows(combatant, 'start');

      expect(result).toEqual([]);
    });

    it('should return multiple saves if multiple effects require them', () => {
      const character = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(character, 15);

      const poison = createEffect({
        name: 'Poisoned',
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
        durationType: 'saves',
        saveRequired: { ability: 'CON', dc: 12, timing: 'end' },
      });

      const stunned = createEffect({
        name: 'Stunned',
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
        durationType: 'saves',
        saveRequired: { ability: 'CON', dc: 15, timing: 'end' },
      });

      combatant.effects = [poison, stunned];

      const result = getRequiredSavingThrows(combatant, 'end');

      expect(result).toHaveLength(2);
    });
  });

  describe('checkConcentrationDamage', () => {
    it('should return null if not concentrating', () => {
      const character = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(character, 15);

      const result = checkConcentrationDamage(combatant, 10);

      expect(result).toBeNull();
    });

    it('should calculate DC from damage', () => {
      const character = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(character, 15);

      const effect = createEffect({
        name: 'Haste',
        appliedBy: 'user-1',
        appliedTo: combatant.id,
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });

      combatant.effects = [effect];
      combatant.concentration = {
        spell: 'Haste',
        effectIds: [effect.id],
      };

      const result = checkConcentrationDamage(combatant, 10);

      expect(result).toMatchObject({
        dc: 10, // max(10, 10/2=5) = 10
        spell: 'Haste',
      });
    });

    it('should use minimum DC of 10', () => {
      const character = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(character, 15);

      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: combatant.id,
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });

      combatant.effects = [effect];
      combatant.concentration = {
        spell: 'Bless',
        effectIds: [effect.id],
      };

      const result = checkConcentrationDamage(combatant, 5);

      expect(result?.dc).toBe(10); // Minimum DC
    });

    it('should use half damage for high damage', () => {
      const character = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(character, 15);

      const effect = createEffect({
        name: 'Haste',
        appliedBy: 'user-1',
        appliedTo: combatant.id,
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });

      combatant.effects = [effect];
      combatant.concentration = {
        spell: 'Haste',
        effectIds: [effect.id],
      };

      const result = checkConcentrationDamage(combatant, 40);

      expect(result?.dc).toBe(20); // 40 / 2
    });
  });

  describe('syncCombatantToCharacter', () => {
    it('should sync effects from combatant to character', () => {
      const character = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(character, 15);

      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: combatant.id,
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      combatant.effects = [effect];

      const synced = syncCombatantToCharacter(combatant, character);

      expect(synced.effects).toHaveLength(1);
      expect(synced.effects[0].name).toBe('Bless');
    });

    it('should sync concentration state', () => {
      const character = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(character, 15);

      const effect = createEffect({
        name: 'Haste',
        appliedBy: 'user-1',
        appliedTo: combatant.id,
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });

      combatant.effects = [effect];
      combatant.concentration = {
        spell: 'Haste',
        effectIds: [effect.id],
      };

      const synced = syncCombatantToCharacter(combatant, character);

      expect(synced.concentration).toBeDefined();
      expect(synced.concentration?.spell).toBe('Haste');
    });

    it('should sync HP values', () => {
      const character = createDefaultCharacter('user-1');
      character.maxHitPoints = 50;
      character.currentHitPoints = 50;
      const combatant = createCombatantFromCharacter(character, 15);

      combatant.currentHitPoints = 30;
      combatant.temporaryHitPoints = 5;

      const synced = syncCombatantToCharacter(combatant, character);

      expect(synced.currentHitPoints).toBe(30);
      expect(synced.temporaryHitPoints).toBe(5);
    });
  });

  describe('syncCharacterToCombatant', () => {
    it('should sync effects from character to combatant', () => {
      const character = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(character, 15);

      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      character.effects = [effect];

      const synced = syncCharacterToCombatant(character, combatant);

      expect(synced.effects).toHaveLength(1);
      expect(synced.effects[0].name).toBe('Bless');
    });

    it('should sync concentration state', () => {
      const character = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(character, 15);

      const effect = createEffect({
        name: 'Haste',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });

      character.effects = [effect];
      character.concentration = {
        spell: 'Haste',
        effectIds: [effect.id],
      };

      const synced = syncCharacterToCombatant(character, combatant);

      expect(synced.concentration).toBeDefined();
      expect(synced.concentration?.spell).toBe('Haste');
    });

    it('should sync HP values', () => {
      const character = createDefaultCharacter('user-1');
      character.currentHitPoints = 30;
      character.temporaryHitPoints = 5;

      const combatant = createCombatantFromCharacter(character, 15);

      const synced = syncCharacterToCombatant(character, combatant);

      expect(synced.currentHitPoints).toBe(30);
      expect(synced.temporaryHitPoints).toBe(5);
    });
  });
});
