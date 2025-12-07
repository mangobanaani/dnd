/**
 * Effect Lifecycle Integration Tests
 * Tests complete workflows from creation to removal
 */

import { renderHook, act } from '@testing-library/react';
import { useEffectManager } from '@/app/hooks/use-effect-manager';
import { useEffectTemplates } from '@/app/hooks/use-effect-templates';
import { createDefaultCharacter } from '@/app/lib/factories/character.factory';
import { createCombatantFromCharacter } from '@/app/lib/factories/combatant.factory';
import {
  syncCharacterToCombatant,
  syncCombatantToCharacter,
  applyStartOfTurnEffects,
  getRequiredSavingThrows,
} from '@/app/lib/utils/combat-effects';

describe('Effect Lifecycle Integration', () => {
  describe('Character → Combat → Character Flow', () => {
    it('should maintain effects when entering combat', () => {
      // Create character
      const character = createDefaultCharacter('user-1');
      character.name = 'Fighter';
      character.currentHitPoints = 50;

      // Add effect to character using templates
      const { result: templates } = renderHook(() => useEffectTemplates());
      const blessEffect = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: character.id,
      });

      character.effects = [blessEffect];
      character.concentration = {
        spell: 'Bless',
        effectIds: [blessEffect.id],
      };

      // Enter combat
      const combatant = createCombatantFromCharacter(character, 15);

      // Verify effects transferred
      expect(combatant.effects).toHaveLength(1);
      expect(combatant.effects[0].name).toBe('Bless');
      expect(combatant.concentration).toBeDefined();
      expect(combatant.concentration?.spell).toBe('Bless');
    });

    it('should sync effects back to character after combat', () => {
      // Create character and combatant
      const character = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(character, 15);

      // Add effects during combat
      const { result: templates } = renderHook(() => useEffectTemplates());
      const hasteEffect = templates.current.applyTemplate('Haste', {
        appliedBy: 'user-1',
        appliedTo: combatant.id,
      });

      combatant.effects = [hasteEffect];
      combatant.concentration = {
        spell: 'Haste',
        effectIds: [hasteEffect.id],
      };
      combatant.currentHitPoints = 30;

      // Exit combat - sync back to character
      const updatedCharacter = syncCombatantToCharacter(combatant, character);

      // Verify effects persisted
      expect(updatedCharacter.effects).toHaveLength(1);
      expect(updatedCharacter.effects[0].name).toBe('Haste');
      expect(updatedCharacter.concentration?.spell).toBe('Haste');
      expect(updatedCharacter.currentHitPoints).toBe(30);
    });

    it('should handle effects modified during combat', () => {
      // Start with character with effect
      const character = createDefaultCharacter('user-1');
      const { result: templates } = renderHook(() => useEffectTemplates());

      const blessEffect = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: character.id,
        roundsRemaining: 10,
      });

      character.effects = [blessEffect];

      // Enter combat
      let combatant = createCombatantFromCharacter(character, 15);

      // Simulate 3 rounds
      const { result: manager } = renderHook(() => useEffectManager(combatant));

      act(() => {
        manager.current.tickRound();
      });
      act(() => {
        manager.current.tickRound();
      });
      act(() => {
        manager.current.tickRound();
      });

      // Exit combat
      combatant = {
        ...combatant,
        effects: manager.current.effects,
      };
      const updatedCharacter = syncCombatantToCharacter(combatant, character);

      // Verify effect duration updated
      expect(updatedCharacter.effects[0].roundsRemaining).toBe(7); // 10 - 3
    });
  });

  describe('Template → Effect → Application Flow', () => {
    it('should create and apply effect from template', () => {
      const character = createDefaultCharacter('user-1');
      const { result: templates } = renderHook(() => useEffectTemplates());
      const { result: manager } = renderHook(() => useEffectManager(character));

      // Find template
      const template = templates.current.getTemplate('Shield');
      expect(template).toBeDefined();

      // Create effect from template
      const effect = templates.current.applyTemplate('Shield', {
        appliedBy: 'user-1',
        appliedTo: character.id,
      });

      // Apply to character
      act(() => {
        manager.current.addEffect(effect);
      });

      // Verify applied
      expect(manager.current.effects).toHaveLength(1);
      expect(manager.current.effects[0].name).toBe('Shield');
      expect(manager.current.effects[0].roundsRemaining).toBe(1);
    });

    it('should apply multiple effects from different categories', () => {
      const character = createDefaultCharacter('user-1');
      const { result: templates } = renderHook(() => useEffectTemplates());
      const { result: manager } = renderHook(() => useEffectManager(character));

      // Apply spell
      const bless = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: character.id,
      });

      // Apply condition
      const poisoned = templates.current.applyTemplate('Poisoned', {
        appliedBy: 'dm-1',
        appliedTo: character.id,
      });

      act(() => {
        manager.current.addEffect(bless);
        manager.current.addEffect(poisoned);
      });

      expect(manager.current.effects).toHaveLength(2);
      expect(manager.current.concentrationEffects).toHaveLength(1); // Only Bless requires concentration
    });

    it('should override concentration when applying new concentration effect', () => {
      const character = createDefaultCharacter('user-1');
      const { result: templates } = renderHook(() => useEffectTemplates());
      const { result: manager } = renderHook(() => useEffectManager(character));

      // Apply first concentration spell
      const bless = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: character.id,
      });

      act(() => {
        manager.current.addEffect(bless);
      });

      expect(manager.current.concentration?.spell).toBe('Bless');
      expect(manager.current.effects).toHaveLength(1);

      // Apply second concentration spell
      const haste = templates.current.applyTemplate('Haste', {
        appliedBy: 'user-1',
        appliedTo: character.id,
      });

      act(() => {
        manager.current.addEffect(haste);
      });

      // First effect should be removed, only second remains
      expect(manager.current.concentration?.spell).toBe('Haste');
      expect(manager.current.effects).toHaveLength(1);
      expect(manager.current.effects[0].name).toBe('Haste');
    });
  });

  describe('Effect Duration Lifecycle', () => {
    it('should handle effect from creation to expiration', () => {
      const character = createDefaultCharacter('user-1');
      const { result: templates } = renderHook(() => useEffectTemplates());
      const { result: manager } = renderHook(() => useEffectManager(character));

      // Create 3-round effect
      const effect = templates.current.applyTemplate('Shield', {
        appliedBy: 'user-1',
        appliedTo: character.id,
        roundsRemaining: 3,
      });

      act(() => {
        manager.current.addEffect(effect);
      });

      expect(manager.current.effects[0].roundsRemaining).toBe(3);

      // Round 1
      act(() => {
        manager.current.tickRound();
      });
      expect(manager.current.effects[0].roundsRemaining).toBe(2);

      // Round 2
      act(() => {
        manager.current.tickRound();
      });
      expect(manager.current.effects[0].roundsRemaining).toBe(1);

      // Round 3
      act(() => {
        manager.current.tickRound();
      });

      // Effect should be removed
      expect(manager.current.effects).toHaveLength(0);
    });

    it('should maintain multiple effects with different durations', () => {
      const character = createDefaultCharacter('user-1');
      const { result: templates } = renderHook(() => useEffectTemplates());
      const { result: manager } = renderHook(() => useEffectManager(character));

      // Short effect (1 round)
      const shield = templates.current.applyTemplate('Shield', {
        appliedBy: 'user-1',
        appliedTo: character.id,
        roundsRemaining: 1,
      });

      // Long effect (5 rounds)
      const aid = templates.current.applyTemplate('Aid', {
        appliedBy: 'user-1',
        appliedTo: character.id,
        roundsRemaining: 5,
      });

      act(() => {
        manager.current.addEffect(shield);
        manager.current.addEffect(aid);
      });

      expect(manager.current.effects).toHaveLength(2);

      // Tick one round
      act(() => {
        manager.current.tickRound();
      });

      // Shield expires, Aid remains
      expect(manager.current.effects).toHaveLength(1);
      expect(manager.current.effects[0].name).toBe('Aid');
      expect(manager.current.effects[0].roundsRemaining).toBe(4);
    });

    it('should handle permanent effects not being removed', () => {
      const character = createDefaultCharacter('user-1');
      const { result: templates } = renderHook(() => useEffectTemplates());
      const { result: manager } = renderHook(() => useEffectManager(character));

      // Create permanent effect
      const hex = templates.current.applyTemplate('Hex', {
        appliedBy: 'user-1',
        appliedTo: 'enemy-1',
      });

      // Hex is permanent (doesn't tick)
      const modifiedHex = {
        ...hex,
        durationType: 'permanent' as const,
        roundsRemaining: undefined,
      };

      act(() => {
        manager.current.addEffect(modifiedHex);
      });

      // Tick multiple rounds
      act(() => {
        manager.current.tickRound();
        manager.current.tickRound();
        manager.current.tickRound();
      });

      // Effect should still exist
      expect(manager.current.effects).toHaveLength(1);
      expect(manager.current.effects[0].name).toBe('Hex');
    });
  });

  describe('Combat Turn Effects', () => {
    it('should apply damage at start of turn', () => {
      const character = createDefaultCharacter('user-1');
      character.currentHitPoints = 50;
      const combatant = createCombatantFromCharacter(character, 15);

      const { result: templates } = renderHook(() => useEffectTemplates());

      // Add burning effect (5 damage per round at start)
      const burning = templates.current.applyTemplate('Hex', {
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
      });

      // Modify to be damage effect
      const damageEffect = {
        ...burning,
        name: 'Burning',
        mechanics: {
          damagePerRound: {
            amount: 5,
            type: 'fire',
            timing: 'start' as const,
          },
        },
      };

      combatant.effects = [damageEffect];

      // Start of turn
      const result = applyStartOfTurnEffects(combatant);

      expect(result.currentHitPoints).toBe(45);
      expect(result.damageLog).toHaveLength(1);
      expect(result.damageLog[0].amount).toBe(5);
    });

    it('should prompt for saves at end of turn', () => {
      const character = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(character, 15);

      const { result: templates } = renderHook(() => useEffectTemplates());

      // Add save-based effect
      const poisoned = templates.current.applyTemplate('Poisoned', {
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
        saveRequired: {
          ability: 'CON',
          dc: 12,
          timing: 'end',
        },
      });

      combatant.effects = [poisoned];

      // Get saves needed
      const saves = getRequiredSavingThrows(combatant, 'end');

      expect(saves).toHaveLength(1);
      expect(saves[0].ability).toBe('CON');
      expect(saves[0].dc).toBe(12);
      expect(saves[0].effectName).toBe('Poisoned');
    });
  });

  describe('Complete Combat Scenario', () => {
    it('should handle full combat encounter with effects', () => {
      // Setup
      const character = createDefaultCharacter('user-1');
      character.name = 'Wizard';
      character.maxHitPoints = 40;
      character.currentHitPoints = 40;

      // Pre-combat: cast Bless
      const { result: templates } = renderHook(() => useEffectTemplates());
      const bless = templates.current.applyTemplate('Bless', {
        appliedBy: character.id,
        appliedTo: character.id,
        roundsRemaining: 10,
      });

      character.effects = [bless];
      character.concentration = {
        spell: 'Bless',
        effectIds: [bless.id],
      };

      // Enter combat
      let combatant = createCombatantFromCharacter(character, 18);

      expect(combatant.effects).toHaveLength(1);
      expect(combatant.concentration?.spell).toBe('Bless');

      // Round 1: Get hit by poison
      const poisoned = templates.current.applyTemplate('Poisoned', {
        appliedBy: 'dm-1',
        appliedTo: combatant.id,
      });

      const { result: manager } = renderHook(() => useEffectManager(combatant));

      act(() => {
        manager.current.addEffect(poisoned);
      });

      // Now has 2 effects
      expect(manager.current.effects).toHaveLength(2);

      // Round 2: Start of turn
      act(() => {
        manager.current.tickRound();
      });

      // Bless and Poisoned both ticked
      expect(manager.current.effects[0].roundsRemaining).toBe(9); // Bless
      expect(manager.current.concentration).toBeDefined(); // Still concentrating

      // Round 3: Take damage, break concentration
      act(() => {
        manager.current.breakConcentration();
      });

      // Bless removed, only Poisoned remains
      expect(manager.current.effects).toHaveLength(1);
      expect(manager.current.effects[0].name).toBe('Poisoned');
      expect(manager.current.concentration).toBeUndefined();

      // Exit combat
      combatant = {
        ...combatant,
        effects: manager.current.effects,
        concentration: manager.current.concentration,
      };

      const updatedCharacter = syncCombatantToCharacter(combatant, character);

      // Character still poisoned after combat
      expect(updatedCharacter.effects).toHaveLength(1);
      expect(updatedCharacter.effects[0].name).toBe('Poisoned');
    });
  });
});
