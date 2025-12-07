/**
 * Combat Flow Integration Tests
 * Tests combat system integration with effects
 */

import { renderHook, act } from '@testing-library/react';
import { useEffectTemplates } from '@/app/hooks/use-effect-templates';
import { createDefaultCharacter } from '@/app/lib/factories/character.factory';
import { createCombatantFromCharacter } from '@/app/lib/factories/combatant.factory';
import {
  applyStartOfTurnEffects,
  getRequiredSavingThrows,
  checkConcentrationDamage,
} from '@/app/lib/utils/combat-effects';
import { CombatRoundService } from '@/app/lib/services/combat-round.service';
import { Combatant } from '@/app/types/combat';

describe('Combat Flow Integration', () => {
  describe('Initiative and Turn Order', () => {
    it('should maintain turn order with effects', () => {
      // Create 3 combatants
      const char1 = createDefaultCharacter('user-1');
      const char2 = createDefaultCharacter('user-2');
      const char3 = createDefaultCharacter('user-3');

      const combatant1 = createCombatantFromCharacter(char1, 18); // Highest
      const combatant2 = createCombatantFromCharacter(char2, 12);
      const combatant3 = createCombatantFromCharacter(char3, 8);  // Lowest

      const combatants = [combatant1, combatant2, combatant3];

      // Add effect to middle combatant
      const { result: templates } = renderHook(() => useEffectTemplates());
      const bless = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-2',
        appliedTo: combatant2.id,
      });

      combatant2.effects = [bless];

      // Verify initiative order preserved
      const sorted = [...combatants].sort((a, b) => b.initiative - a.initiative);
      expect(sorted[0].id).toBe(combatant1.id);
      expect(sorted[1].id).toBe(combatant2.id);
      expect(sorted[1].effects).toHaveLength(1);
      expect(sorted[2].id).toBe(combatant3.id);
    });

    it('should handle effects on all combatants in initiative order', () => {
      const char1 = createDefaultCharacter('user-1');
      const char2 = createDefaultCharacter('user-2');

      const combatant1 = createCombatantFromCharacter(char1, 15);
      const combatant2 = createCombatantFromCharacter(char2, 10);

      const { result: templates } = renderHook(() => useEffectTemplates());

      // Both have different effects
      const haste = templates.current.applyTemplate('Haste', {
        appliedBy: 'user-1',
        appliedTo: combatant1.id,
        roundsRemaining: 5,
      });

      const poisoned = templates.current.applyTemplate('Poisoned', {
        appliedBy: 'dm-1',
        appliedTo: combatant2.id,
      });

      combatant1.effects = [haste];
      combatant2.effects = [poisoned];

      // Verify both have their effects
      expect(combatant1.effects[0].name).toBe('Haste');
      expect(combatant2.effects[0].name).toBe('Poisoned');
    });
  });

  describe('Turn Progression with Effects', () => {
    it('should tick effects at end of turn', () => {
      const combat = new CombatRoundService();
      const char = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(char, 15);

      const { result: templates } = renderHook(() => useEffectTemplates());
      const bless = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: combatant.id,
        roundsRemaining: 5,
      });

      combatant.effects = [bless];

      let state = {
        combatants: [combatant],
        currentRound: 1,
        currentTurnIndex: 0,
      };

      expect(state.combatants[0].effects[0].roundsRemaining).toBe(5);

      // Advance turn (completes round)
      state = combat.advanceTurn(state);
      expect(state.combatants[0].effects[0].roundsRemaining).toBe(4);
    });

    it('should remove expired effects during turn', () => {
      const combat = new CombatRoundService();
      const char = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(char, 15);

      const { result: templates } = renderHook(() => useEffectTemplates());
      const shield = templates.current.applyTemplate('Shield', {
        appliedBy: 'user-1',
        appliedTo: combatant.id,
        roundsRemaining: 1,
      });

      combatant.effects = [shield];

      let state = {
        combatants: [combatant],
        currentRound: 1,
        currentTurnIndex: 0,
      };

      expect(state.combatants[0].effects).toHaveLength(1);

      // Advance turn - should expire
      state = combat.advanceTurn(state);
      expect(state.combatants[0].effects).toHaveLength(0);
    });

    it('should maintain permanent effects through turns', () => {
      const combat = new CombatRoundService();
      const char = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(char, 15);

      const { result: templates } = renderHook(() => useEffectTemplates());
      const grappled = templates.current.applyTemplate('Grappled', {
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
      });

      combatant.effects = [grappled];

      let state = {
        combatants: [combatant],
        currentRound: 1,
        currentTurnIndex: 0,
      };

      expect(state.combatants[0].effects).toHaveLength(1);

      // Advance multiple turns
      state = combat.advanceTurn(state);
      state = combat.advanceTurn(state);
      state = combat.advanceTurn(state);

      expect(state.combatants[0].effects).toHaveLength(1);
      expect(state.combatants[0].effects[0].name).toBe('Grappled');
    });
  });

  describe('Round Progression', () => {
    it('should track rounds correctly', () => {
      const combat = new CombatRoundService();
      const char1 = createDefaultCharacter('user-1');
      const char2 = createDefaultCharacter('user-2');

      const combatant1 = createCombatantFromCharacter(char1, 20);
      const combatant2 = createCombatantFromCharacter(char2, 10);

      let state = {
        combatants: [combatant1, combatant2],
        currentRound: 1,
        currentTurnIndex: 0,
      };

      expect(state.currentRound).toBe(1);

      // Advance through 2 turns (1 full round)
      state = combat.advanceTurn(state); // combatant2's turn
      state = combat.advanceTurn(state); // Back to combatant1, round 2

      expect(state.currentRound).toBe(2);
    });

    it('should tick effects only once per round per combatant', () => {
      const combat = new CombatRoundService();
      const char1 = createDefaultCharacter('user-1');
      const char2 = createDefaultCharacter('user-2');

      const combatant1 = createCombatantFromCharacter(char1, 20);
      const combatant2 = createCombatantFromCharacter(char2, 10);

      const { result: templates } = renderHook(() => useEffectTemplates());
      const bless = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: combatant1.id,
        roundsRemaining: 10,
      });

      combatant1.effects = [bless];

      let state = {
        combatants: [combatant1, combatant2],
        currentRound: 1,
        currentTurnIndex: 0,
      };

      expect(state.combatants[0].effects[0].roundsRemaining).toBe(10);

      // End combatant1's turn
      state = combat.advanceTurn(state);
      expect(state.combatants[0].effects[0].roundsRemaining).toBe(10); // Not ticked yet

      // End combatant2's turn (new round)
      state = combat.advanceTurn(state);

      // combatant1's effect should tick once for the completed round
      expect(state.combatants[0].effects[0].roundsRemaining).toBe(9);
    });
  });

  describe('Start of Turn Effects', () => {
    it('should apply damage at start of turn', () => {
      const char = createDefaultCharacter('user-1');
      char.currentHitPoints = 50;
      const combatant = createCombatantFromCharacter(char, 15);

      const { result: templates } = renderHook(() => useEffectTemplates());
      const burning = templates.current.applyTemplate('Hex', {
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
      });

      // Modify to be start-of-turn damage
      const damageEffect = {
        ...burning,
        name: 'Burning',
        mechanics: {
          damagePerRound: {
            amount: 10,
            type: 'fire' as const,
            timing: 'start' as const,
          },
        },
      };

      combatant.effects = [damageEffect];

      const result = applyStartOfTurnEffects(combatant);

      expect(result.currentHitPoints).toBe(40);
      expect(result.damageLog).toHaveLength(1);
      expect(result.damageLog[0].amount).toBe(10);
      expect(result.damageLog[0].type).toBe('fire');
    });

    it('should apply multiple damage sources', () => {
      const char = createDefaultCharacter('user-1');
      char.currentHitPoints = 100;
      const combatant = createCombatantFromCharacter(char, 15);

      // Create two damage effects
      const burning = {
        id: '1',
        name: 'Burning',
        icon: '🔥',
        description: 'On fire',
        source: 'spell' as const,
        effectType: 'spell' as const,
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
        createdAt: new Date().toISOString(),
        durationType: 'rounds' as const,
        roundsRemaining: 5,
        mechanics: {
          damagePerRound: {
            amount: 5,
            type: 'fire' as const,
            timing: 'start' as const,
          },
        },
      };

      const poison = {
        id: '2',
        name: 'Poison Damage',
        icon: '🤢',
        description: 'Taking poison damage',
        source: 'spell' as const,
        effectType: 'spell' as const,
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
        createdAt: new Date().toISOString(),
        durationType: 'rounds' as const,
        roundsRemaining: 3,
        mechanics: {
          damagePerRound: {
            amount: 8,
            type: 'poison' as const,
            timing: 'start' as const,
          },
        },
      };

      combatant.effects = [burning, poison];

      const result = applyStartOfTurnEffects(combatant);

      expect(result.currentHitPoints).toBe(87); // 100 - 5 - 8
      expect(result.damageLog).toHaveLength(2);
    });

    it('should handle temporary HP absorption', () => {
      const char = createDefaultCharacter('user-1');
      char.currentHitPoints = 50;
      const combatant = createCombatantFromCharacter(char, 15);
      combatant.temporaryHitPoints = 15;

      const burning = {
        id: '1',
        name: 'Burning',
        icon: '🔥',
        description: 'On fire',
        source: 'spell' as const,
        effectType: 'spell' as const,
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
        createdAt: new Date().toISOString(),
        durationType: 'rounds' as const,
        roundsRemaining: 5,
        mechanics: {
          damagePerRound: {
            amount: 10,
            type: 'fire' as const,
            timing: 'start' as const,
          },
        },
      };

      combatant.effects = [burning];

      const result = applyStartOfTurnEffects(combatant);

      // Temp HP absorbs all damage
      expect(result.temporaryHitPoints).toBe(5);
      expect(result.currentHitPoints).toBe(50); // No real damage
      expect(result.damageLog).toHaveLength(1);
    });
  });

  describe('End of Turn Saves', () => {
    it('should identify required saves at end of turn', () => {
      const char = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(char, 15);

      const { result: templates } = renderHook(() => useEffectTemplates());
      const poisoned = templates.current.applyTemplate('Poisoned', {
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
      });

      combatant.effects = [poisoned];

      const saves = getRequiredSavingThrows(combatant, 'end');

      expect(saves).toHaveLength(1);
      expect(saves[0].ability).toBe('CON');
      expect(saves[0].dc).toBe(10);
      expect(saves[0].effectName).toBe('Poisoned');
    });

    it('should identify multiple saves needed', () => {
      const char = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(char, 15);

      const { result: templates } = renderHook(() => useEffectTemplates());

      const poisoned = templates.current.applyTemplate('Poisoned', {
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
      });

      const frightened = templates.current.applyTemplate('Frightened', {
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
      });

      combatant.effects = [poisoned, frightened];

      const saves = getRequiredSavingThrows(combatant, 'end');

      expect(saves).toHaveLength(2);
      expect(saves.map((s) => s.ability)).toContain('CON');
      expect(saves.map((s) => s.ability)).toContain('WIS');
    });

    it('should not include start-of-turn saves', () => {
      const char = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(char, 15);

      const { result: templates } = renderHook(() => useEffectTemplates());
      const poisoned = templates.current.applyTemplate('Poisoned', {
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
        saveRequired: {
          ability: 'CON',
          dc: 12,
          timing: 'start', // Start of turn
        },
      });

      combatant.effects = [poisoned];

      const endSaves = getRequiredSavingThrows(combatant, 'end');
      expect(endSaves).toHaveLength(0);

      const startSaves = getRequiredSavingThrows(combatant, 'start');
      expect(startSaves).toHaveLength(1);
    });
  });

  describe('Concentration During Combat', () => {
    it('should calculate concentration DC from damage', () => {
      const char = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(char, 15);

      const { result: templates } = renderHook(() => useEffectTemplates());
      const haste = templates.current.applyTemplate('Haste', {
        appliedBy: 'user-1',
        appliedTo: combatant.id,
      });

      combatant.effects = [haste];
      combatant.concentration = {
        spell: 'Haste',
        effectIds: [haste.id],
      };

      // Take 20 damage
      const check = checkConcentrationDamage(combatant, 20);

      expect(check).toBeDefined();
      expect(check?.spell).toBe('Haste');
      expect(check?.dc).toBe(10); // Max of half damage (10) or 10
    });

    it('should use minimum DC of 10 for concentration', () => {
      const char = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(char, 15);

      const { result: templates } = renderHook(() => useEffectTemplates());
      const bless = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: combatant.id,
      });

      combatant.effects = [bless];
      combatant.concentration = {
        spell: 'Bless',
        effectIds: [bless.id],
      };

      // Take 5 damage (half = 2.5, rounded down = 2)
      const check = checkConcentrationDamage(combatant, 5);

      expect(check).toBeDefined();
      expect(check?.dc).toBe(10); // Minimum DC
    });

    it('should return null if not concentrating', () => {
      const char = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(char, 15);

      const check = checkConcentrationDamage(combatant, 20);

      expect(check).toBeNull();
    });
  });

  describe('Complete Combat Round', () => {
    it('should handle full round with all mechanics', () => {
      const combat = new CombatRoundService();

      // Create wizard with concentration spell
      const wizard = createDefaultCharacter('user-1');
      wizard.name = 'Wizard';
      wizard.currentHitPoints = 40;
      const wizardCombatant = createCombatantFromCharacter(wizard, 15);

      // Create fighter
      const fighter = createDefaultCharacter('user-2');
      fighter.name = 'Fighter';
      fighter.currentHitPoints = 60;
      const fighterCombatant = createCombatantFromCharacter(fighter, 12);

      const { result: templates } = renderHook(() => useEffectTemplates());

      // Wizard casts Bless on fighter
      const bless = templates.current.applyTemplate('Bless', {
        appliedBy: wizardCombatant.id,
        appliedTo: fighterCombatant.id,
        roundsRemaining: 5,
      });

      wizardCombatant.concentration = {
        spell: 'Bless',
        effectIds: [bless.id],
      };
      fighterCombatant.effects = [bless];

      // Start combat
      let state = {
        combatants: [wizardCombatant, fighterCombatant],
        currentRound: 1,
        currentTurnIndex: 0,
      };

      expect(state.currentRound).toBe(1);
      expect(state.combatants[0].name).toBe('Wizard');

      // Wizard's turn - end turn
      state = combat.advanceTurn(state);
      expect(state.combatants[state.currentTurnIndex].name).toBe('Fighter');

      // Fighter still has Bless
      expect(state.combatants[1].effects[0].name).toBe('Bless');
      expect(state.combatants[1].effects[0].roundsRemaining).toBe(5); // Not ticked yet

      // Fighter's turn - effect should tick at end when round completes
      state = combat.advanceTurn(state);

      // Back to round 2, wizard's turn
      expect(state.currentRound).toBe(2);
      expect(state.combatants[0].name).toBe('Wizard');

      // Fighter's Bless should have ticked
      expect(state.combatants[1].effects[0].roundsRemaining).toBe(4);
    });
  });
});
