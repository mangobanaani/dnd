/**
 * Concentration Workflow Integration Tests
 * Tests complete concentration mechanics across the system
 */

import { renderHook, act } from '@testing-library/react';
import { useEffectManager } from '@/app/hooks/use-effect-manager';
import { useEffectTemplates } from '@/app/hooks/use-effect-templates';
import { createDefaultCharacter } from '@/app/lib/factories/character.factory';
import { createCombatantFromCharacter } from '@/app/lib/factories/combatant.factory';
import { checkConcentrationDamage } from '@/app/lib/utils/combat-effects';
import { EffectService } from '@/app/lib/services/effect.service';

describe('Concentration Workflow Integration', () => {
  describe('Starting Concentration', () => {
    it('should establish concentration when adding concentration effect', () => {
      const character = createDefaultCharacter('user-1');
      const { result: manager } = renderHook(() => useEffectManager(character));
      const { result: templates } = renderHook(() => useEffectTemplates());

      const bless = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: character.id,
      });

      act(() => {
        manager.current.addEffect(bless);
      });

      expect(manager.current.isConcentrating).toBe(true);
      expect(manager.current.concentration).toBeDefined();
      expect(manager.current.concentration?.spell).toBe('Bless');
      expect(manager.current.concentration?.effectIds).toContain(bless.id);
    });

    it('should support multiple effects under one concentration', () => {
      const character = createDefaultCharacter('user-1');
      const char2 = createDefaultCharacter('user-2');
      const char3 = createDefaultCharacter('user-3');

      const { result: manager } = renderHook(() => useEffectManager(character));
      const { result: templates } = renderHook(() => useEffectTemplates());

      // Bless can affect multiple targets, all under one concentration
      const bless1 = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: char2.id,
      });

      const bless2 = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: char3.id,
      });

      // Manually set up concentration tracking multiple effects
      character.concentration = {
        spell: 'Bless',
        effectIds: [bless1.id, bless2.id],
      };
      character.effects = [bless1, bless2];

      const { result: manager2 } = renderHook(() => useEffectManager(character));

      expect(manager2.current.concentration?.effectIds).toHaveLength(2);
      expect(manager2.current.effects).toHaveLength(2);
    });

    it('should not allow non-concentration effects to set concentration', () => {
      const character = createDefaultCharacter('user-1');
      const { result: manager } = renderHook(() => useEffectManager(character));
      const { result: templates } = renderHook(() => useEffectTemplates());

      const poisoned = templates.current.applyTemplate('Poisoned', {
        appliedBy: 'dm-1',
        appliedTo: character.id,
      });

      act(() => {
        manager.current.addEffect(poisoned);
      });

      expect(manager.current.isConcentrating).toBe(false);
      expect(manager.current.concentration).toBeUndefined();
      expect(manager.current.effects).toHaveLength(1);
    });
  });

  describe('Breaking Concentration', () => {
    it('should remove all concentration effects when broken', () => {
      const character = createDefaultCharacter('user-1');
      const { result: manager } = renderHook(() => useEffectManager(character));
      const { result: templates } = renderHook(() => useEffectTemplates());

      const haste = templates.current.applyTemplate('Haste', {
        appliedBy: 'user-1',
        appliedTo: character.id,
      });

      act(() => {
        manager.current.addEffect(haste);
      });

      expect(manager.current.effects).toHaveLength(1);
      expect(manager.current.isConcentrating).toBe(true);

      act(() => {
        manager.current.breakConcentration();
      });

      expect(manager.current.effects).toHaveLength(0);
      expect(manager.current.isConcentrating).toBe(false);
      expect(manager.current.concentration).toBeUndefined();
    });

    it('should keep non-concentration effects when breaking concentration', () => {
      const character = createDefaultCharacter('user-1');
      const { result: manager } = renderHook(() => useEffectManager(character));
      const { result: templates } = renderHook(() => useEffectTemplates());

      const bless = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: character.id,
      });

      const poisoned = templates.current.applyTemplate('Poisoned', {
        appliedBy: 'dm-1',
        appliedTo: character.id,
      });

      act(() => {
        manager.current.addEffect(bless);
        manager.current.addEffect(poisoned);
      });

      expect(manager.current.effects).toHaveLength(2);

      act(() => {
        manager.current.breakConcentration();
      });

      expect(manager.current.effects).toHaveLength(1);
      expect(manager.current.effects[0].name).toBe('Poisoned');
    });

    it('should handle breaking concentration when not concentrating', () => {
      const character = createDefaultCharacter('user-1');
      const { result: manager } = renderHook(() => useEffectManager(character));

      expect(() => {
        act(() => {
          manager.current.breakConcentration();
        });
      }).not.toThrow();

      expect(manager.current.isConcentrating).toBe(false);
    });
  });

  describe('Swapping Concentration', () => {
    it('should break old concentration when adding new concentration effect', () => {
      const character = createDefaultCharacter('user-1');
      const { result: manager } = renderHook(() => useEffectManager(character));
      const { result: templates } = renderHook(() => useEffectTemplates());

      // First concentration spell
      const bless = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: character.id,
      });

      act(() => {
        manager.current.addEffect(bless);
      });

      expect(manager.current.concentration?.spell).toBe('Bless');
      expect(manager.current.effects).toHaveLength(1);

      // Second concentration spell
      const haste = templates.current.applyTemplate('Haste', {
        appliedBy: 'user-1',
        appliedTo: character.id,
      });

      act(() => {
        manager.current.addEffect(haste);
      });

      // Old concentration broken, new one active
      expect(manager.current.concentration?.spell).toBe('Haste');
      expect(manager.current.effects).toHaveLength(1);
      expect(manager.current.effects[0].name).toBe('Haste');
    });

    it('should preserve duration of new spell when swapping', () => {
      const character = createDefaultCharacter('user-1');
      const { result: manager } = renderHook(() => useEffectManager(character));
      const { result: templates } = renderHook(() => useEffectTemplates());

      const bless = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: character.id,
        roundsRemaining: 10,
      });

      act(() => {
        manager.current.addEffect(bless);
      });

      const haste = templates.current.applyTemplate('Haste', {
        appliedBy: 'user-1',
        appliedTo: character.id,
        roundsRemaining: 5,
      });

      act(() => {
        manager.current.addEffect(haste);
      });

      expect(manager.current.effects[0].roundsRemaining).toBe(5);
    });
  });

  describe('Concentration During Combat', () => {
    it('should calculate concentration save DC correctly', () => {
      const character = createDefaultCharacter('user-1');
      character.currentHitPoints = 50;
      const combatant = createCombatantFromCharacter(character, 15);

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

      // Test various damage amounts
      const check1 = checkConcentrationDamage(combatant, 5);
      expect(check1?.dc).toBe(10); // Min DC

      const check2 = checkConcentrationDamage(combatant, 20);
      expect(check2?.dc).toBe(10); // Half of 20 = 10

      const check3 = checkConcentrationDamage(combatant, 30);
      expect(check3?.dc).toBe(15); // Half of 30 = 15

      const check4 = checkConcentrationDamage(combatant, 50);
      expect(check4?.dc).toBe(25); // Half of 50 = 25
    });

    it('should maintain concentration across multiple rounds', () => {
      const character = createDefaultCharacter('user-1');
      const { result: manager } = renderHook(() => useEffectManager(character));
      const { result: templates } = renderHook(() => useEffectTemplates());

      const bless = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: character.id,
        roundsRemaining: 5,
      });

      act(() => {
        manager.current.addEffect(bless);
      });

      // Tick multiple rounds
      act(() => {
        manager.current.tickRound();
      });
      expect(manager.current.isConcentrating).toBe(true);

      act(() => {
        manager.current.tickRound();
      });
      expect(manager.current.isConcentrating).toBe(true);

      act(() => {
        manager.current.tickRound();
      });
      expect(manager.current.isConcentrating).toBe(true);

      expect(manager.current.effects[0].roundsRemaining).toBe(2);
      expect(manager.current.concentration?.spell).toBe('Bless');
    });

    it('should break concentration when effect expires', () => {
      const character = createDefaultCharacter('user-1');
      const { result: manager } = renderHook(() => useEffectManager(character));
      const { result: templates } = renderHook(() => useEffectTemplates());

      const bless = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: character.id,
        roundsRemaining: 2,
      });

      act(() => {
        manager.current.addEffect(bless);
      });

      expect(manager.current.isConcentrating).toBe(true);

      act(() => {
        manager.current.tickRound();
      });
      expect(manager.current.isConcentrating).toBe(true);

      act(() => {
        manager.current.tickRound();
      });

      // Effect expired, concentration should be broken
      expect(manager.current.effects).toHaveLength(0);
      expect(manager.current.isConcentrating).toBe(false);
      expect(manager.current.concentration).toBeUndefined();
    });
  });

  describe('Multiple Characters Concentrating', () => {
    it('should allow multiple characters to concentrate simultaneously', () => {
      const wizard = createDefaultCharacter('user-1');
      const cleric = createDefaultCharacter('user-2');

      const { result: wizardManager } = renderHook(() => useEffectManager(wizard));
      const { result: clericManager } = renderHook(() => useEffectManager(cleric));
      const { result: templates } = renderHook(() => useEffectTemplates());

      // Wizard casts Haste
      const haste = templates.current.applyTemplate('Haste', {
        appliedBy: 'user-1',
        appliedTo: wizard.id,
      });

      // Cleric casts Bless
      const bless = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-2',
        appliedTo: cleric.id,
      });

      act(() => {
        wizardManager.current.addEffect(haste);
        clericManager.current.addEffect(bless);
      });

      expect(wizardManager.current.isConcentrating).toBe(true);
      expect(wizardManager.current.concentration?.spell).toBe('Haste');

      expect(clericManager.current.isConcentrating).toBe(true);
      expect(clericManager.current.concentration?.spell).toBe('Bless');
    });

    it('should independently break concentration for different characters', () => {
      const wizard = createDefaultCharacter('user-1');
      const cleric = createDefaultCharacter('user-2');

      const { result: wizardManager } = renderHook(() => useEffectManager(wizard));
      const { result: clericManager } = renderHook(() => useEffectManager(cleric));
      const { result: templates } = renderHook(() => useEffectTemplates());

      const haste = templates.current.applyTemplate('Haste', {
        appliedBy: 'user-1',
        appliedTo: wizard.id,
      });

      const bless = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-2',
        appliedTo: cleric.id,
      });

      act(() => {
        wizardManager.current.addEffect(haste);
        clericManager.current.addEffect(bless);
      });

      // Wizard breaks concentration
      act(() => {
        wizardManager.current.breakConcentration();
      });

      expect(wizardManager.current.isConcentrating).toBe(false);
      expect(clericManager.current.isConcentrating).toBe(true);
    });
  });

  describe('Concentration Edge Cases', () => {
    it('should handle removing concentration effect directly', () => {
      const character = createDefaultCharacter('user-1');
      const { result: manager } = renderHook(() => useEffectManager(character));
      const { result: templates } = renderHook(() => useEffectTemplates());

      const bless = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: character.id,
      });

      act(() => {
        manager.current.addEffect(bless);
      });

      const effectId = manager.current.effects[0].id;

      act(() => {
        manager.current.removeEffect(effectId);
      });

      expect(manager.current.effects).toHaveLength(0);
      expect(manager.current.isConcentrating).toBe(false);
    });

    it('should track concentration effects correctly', () => {
      const character = createDefaultCharacter('user-1');
      const { result: manager } = renderHook(() => useEffectManager(character));
      const { result: templates } = renderHook(() => useEffectTemplates());

      const bless = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: character.id,
      });

      const poisoned = templates.current.applyTemplate('Poisoned', {
        appliedBy: 'dm-1',
        appliedTo: character.id,
      });

      const frightened = templates.current.applyTemplate('Frightened', {
        appliedBy: 'dm-1',
        appliedTo: character.id,
      });

      act(() => {
        manager.current.addEffect(bless);
        manager.current.addEffect(poisoned);
        manager.current.addEffect(frightened);
      });

      expect(manager.current.effects).toHaveLength(3);
      expect(manager.current.concentrationEffects).toHaveLength(1);
      expect(manager.current.concentrationEffects[0].name).toBe('Bless');
    });

    it('should handle updating concentration effect', () => {
      const character = createDefaultCharacter('user-1');
      const { result: manager } = renderHook(() => useEffectManager(character));
      const { result: templates } = renderHook(() => useEffectTemplates());

      const bless = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: character.id,
        roundsRemaining: 5,
      });

      act(() => {
        manager.current.addEffect(bless);
      });

      const updatedEffect = { ...manager.current.effects[0], roundsRemaining: 10 };

      act(() => {
        manager.current.updateEffect(updatedEffect);
      });

      expect(manager.current.effects[0].roundsRemaining).toBe(10);
      expect(manager.current.isConcentrating).toBe(true);
      expect(manager.current.concentration?.spell).toBe('Bless');
    });
  });

  describe('Service-Level Concentration', () => {
    it('should handle concentration via EffectService directly', () => {
      const effectService = new EffectService();
      const character = createDefaultCharacter('user-1');

      const { result: templates } = renderHook(() => useEffectTemplates());
      const haste = templates.current.applyTemplate('Haste', {
        appliedBy: 'user-1',
        appliedTo: character.id,
      });

      const updated = effectService.addEffect(character, haste);

      expect(updated.concentration).toBeDefined();
      expect(updated.concentration?.spell).toBe('Haste');
      expect(updated.effects).toHaveLength(1);

      const broken = effectService.breakConcentration(updated);

      expect(broken.concentration).toBeUndefined();
      expect(broken.effects).toHaveLength(0);
    });

    it('should swap concentration via EffectService', () => {
      const effectService = new EffectService();
      const character = createDefaultCharacter('user-1');

      const { result: templates } = renderHook(() => useEffectTemplates());
      const bless = templates.current.applyTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: character.id,
      });

      let updated = effectService.addEffect(character, bless);
      expect(updated.concentration?.spell).toBe('Bless');

      const haste = templates.current.applyTemplate('Haste', {
        appliedBy: 'user-1',
        appliedTo: character.id,
      });

      updated = effectService.addEffect(updated, haste);

      expect(updated.concentration?.spell).toBe('Haste');
      expect(updated.effects).toHaveLength(1);
      expect(updated.effects[0].name).toBe('Haste');
    });
  });
});
