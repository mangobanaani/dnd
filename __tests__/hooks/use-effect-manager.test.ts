/**
 * useEffectManager Hook Tests
 * Tests for managing effects on characters and combatants
 */

import { renderHook, act } from '@testing-library/react';
import { useEffectManager } from '@/app/hooks/use-effect-manager';
import { createEffect } from '@/app/types/effects';
import { createDefaultCharacter } from '@/app/lib/factories/character.factory';

describe('useEffectManager', () => {
  describe('Initialization', () => {
    it('should initialize with empty effects', () => {
      const character = createDefaultCharacter('user-1');
      const { result } = renderHook(() => useEffectManager(character));

      expect(result.current.effects).toEqual([]);
      expect(result.current.concentration).toBeUndefined();
    });

    it('should initialize with existing effects', () => {
      const character = createDefaultCharacter('user-1');
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 10,
      });
      character.effects = [effect];

      const { result } = renderHook(() => useEffectManager(character));

      expect(result.current.effects).toHaveLength(1);
      expect(result.current.effects[0].name).toBe('Bless');
    });

    it('should initialize with concentration', () => {
      const character = createDefaultCharacter('user-1');
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

      const { result } = renderHook(() => useEffectManager(character));

      expect(result.current.concentration).toBeDefined();
      expect(result.current.concentration?.spell).toBe('Haste');
    });
  });

  describe('Adding Effects', () => {
    it('should add a new effect', () => {
      const character = createDefaultCharacter('user-1');
      const { result } = renderHook(() => useEffectManager(character));

      const effect = createEffect({
        name: 'Shield',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 1,
      });

      act(() => {
        result.current.addEffect(effect);
      });

      expect(result.current.effects).toHaveLength(1);
      expect(result.current.effects[0].name).toBe('Shield');
    });

    it('should add concentration effect and set concentration', () => {
      const character = createDefaultCharacter('user-1');
      const { result } = renderHook(() => useEffectManager(character));

      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });

      act(() => {
        result.current.addEffect(effect);
      });

      expect(result.current.effects).toHaveLength(1);
      expect(result.current.concentration).toBeDefined();
      expect(result.current.concentration?.spell).toBe('Bless');
    });

    it('should break existing concentration when adding new concentration effect', () => {
      const character = createDefaultCharacter('user-1');
      const { result } = renderHook(() => useEffectManager(character));

      const bless = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });

      const haste = createEffect({
        name: 'Haste',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });

      act(() => {
        result.current.addEffect(bless);
      });

      expect(result.current.effects).toHaveLength(1);
      expect(result.current.concentration?.spell).toBe('Bless');

      act(() => {
        result.current.addEffect(haste);
      });

      expect(result.current.effects).toHaveLength(1);
      expect(result.current.effects[0].name).toBe('Haste');
      expect(result.current.concentration?.spell).toBe('Haste');
    });

    it('should call onChange when effect is added', () => {
      const character = createDefaultCharacter('user-1');
      const onChange = jest.fn();
      const { result } = renderHook(() => useEffectManager(character, { onChange }));

      const effect = createEffect({
        name: 'Shield',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 1,
      });

      act(() => {
        result.current.addEffect(effect);
      });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          effects: expect.arrayContaining([effect]),
        })
      );
    });
  });

  describe('Removing Effects', () => {
    it('should remove an effect by id', () => {
      const character = createDefaultCharacter('user-1');
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 10,
      });
      character.effects = [effect];

      const { result } = renderHook(() => useEffectManager(character));

      act(() => {
        result.current.removeEffect(effect.id);
      });

      expect(result.current.effects).toHaveLength(0);
    });

    it('should break concentration when removing concentration effect', () => {
      const character = createDefaultCharacter('user-1');
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

      const { result } = renderHook(() => useEffectManager(character));

      act(() => {
        result.current.removeEffect(effect.id);
      });

      expect(result.current.effects).toHaveLength(0);
      expect(result.current.concentration).toBeUndefined();
    });

    it('should call onChange when effect is removed', () => {
      const character = createDefaultCharacter('user-1');
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 10,
      });
      character.effects = [effect];

      const onChange = jest.fn();
      const { result } = renderHook(() => useEffectManager(character, { onChange }));

      act(() => {
        result.current.removeEffect(effect.id);
      });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          effects: [],
        })
      );
    });
  });

  describe('Updating Effects', () => {
    it('should update an effect', () => {
      const character = createDefaultCharacter('user-1');
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 10,
      });
      character.effects = [effect];

      const { result } = renderHook(() => useEffectManager(character));

      const updatedEffect = { ...effect, roundsRemaining: 5 };

      act(() => {
        result.current.updateEffect(updatedEffect);
      });

      expect(result.current.effects[0].roundsRemaining).toBe(5);
    });

    it('should call onChange when effect is updated', () => {
      const character = createDefaultCharacter('user-1');
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 10,
      });
      character.effects = [effect];

      const onChange = jest.fn();
      const { result } = renderHook(() => useEffectManager(character, { onChange }));

      const updatedEffect = { ...effect, roundsRemaining: 5 };

      act(() => {
        result.current.updateEffect(updatedEffect);
      });

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('Ticking Effects', () => {
    it('should tick all round-based effects', () => {
      const character = createDefaultCharacter('user-1');
      const effect1 = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 10,
      });
      const effect2 = createEffect({
        name: 'Shield',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 3,
      });
      character.effects = [effect1, effect2];

      const { result } = renderHook(() => useEffectManager(character));

      act(() => {
        result.current.tickRound();
      });

      expect(result.current.effects[0].roundsRemaining).toBe(9);
      expect(result.current.effects[1].roundsRemaining).toBe(2);
    });

    it('should remove expired effects after ticking', () => {
      const character = createDefaultCharacter('user-1');
      const effect = createEffect({
        name: 'Shield',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 1,
      });
      character.effects = [effect];

      const { result } = renderHook(() => useEffectManager(character));

      act(() => {
        result.current.tickRound();
      });

      expect(result.current.effects).toHaveLength(0);
    });

    it('should break concentration if concentration effect expires', () => {
      const character = createDefaultCharacter('user-1');
      const effect = createEffect({
        name: 'Haste',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 1,
        mechanics: { requiresConcentration: true },
      });
      character.effects = [effect];
      character.concentration = {
        spell: 'Haste',
        effectIds: [effect.id],
      };

      const { result } = renderHook(() => useEffectManager(character));

      act(() => {
        result.current.tickRound();
      });

      expect(result.current.effects).toHaveLength(0);
      expect(result.current.concentration).toBeUndefined();
    });
  });

  describe('Breaking Concentration', () => {
    it('should break concentration manually', () => {
      const character = createDefaultCharacter('user-1');
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

      const { result } = renderHook(() => useEffectManager(character));

      act(() => {
        result.current.breakConcentration();
      });

      expect(result.current.effects).toHaveLength(0);
      expect(result.current.concentration).toBeUndefined();
    });

    it('should do nothing if not concentrating', () => {
      const character = createDefaultCharacter('user-1');
      const { result } = renderHook(() => useEffectManager(character));

      act(() => {
        result.current.breakConcentration();
      });

      expect(result.current.effects).toEqual([]);
      expect(result.current.concentration).toBeUndefined();
    });
  });

  describe('Filtering Effects', () => {
    it('should get only concentration effects', () => {
      const character = createDefaultCharacter('user-1');
      const bless = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });
      const shield = createEffect({
        name: 'Shield',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 1,
        mechanics: { requiresConcentration: false },
      });
      character.effects = [bless, shield];

      const { result } = renderHook(() => useEffectManager(character));

      expect(result.current.concentrationEffects).toHaveLength(1);
      expect(result.current.concentrationEffects[0].name).toBe('Bless');
    });

    it('should check if concentrating', () => {
      const character = createDefaultCharacter('user-1');
      const { result } = renderHook(() => useEffectManager(character));

      expect(result.current.isConcentrating).toBe(false);

      const effect = createEffect({
        name: 'Haste',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });

      act(() => {
        result.current.addEffect(effect);
      });

      expect(result.current.isConcentrating).toBe(true);
    });
  });

  describe('Effect Stacking Validation', () => {
    it('should check for same-name stacking before adding', () => {
      const character = createDefaultCharacter('user-1');
      const { result } = renderHook(() => useEffectManager(character));

      const bless1 = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 5,
      });

      act(() => {
        result.current.addEffect(bless1);
      });

      expect(result.current.effects).toHaveLength(1);

      const bless2 = createEffect({
        name: 'Bless',
        appliedBy: 'user-2',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      const stackingResult = result.current.checkStacking(bless2);

      expect(stackingResult.canApply).toBe(false);
      expect(stackingResult.violations).toContainEqual(
        expect.objectContaining({ rule: 'same-name' })
      );
    });

    it('should provide temp HP stacking info', () => {
      const character = createDefaultCharacter('user-1');
      const { result } = renderHook(() => useEffectManager(character));

      const aid = createEffect({
        name: 'Aid',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: {
          temporaryHitPoints: 5,
        },
      });

      act(() => {
        result.current.addEffect(aid);
      });

      const falseLife = createEffect({
        name: 'False Life',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 1,
        mechanics: {
          temporaryHitPoints: 10,
        },
      });

      const stackingResult = result.current.checkStacking(falseLife);

      expect(stackingResult.canApply).toBe(false);
      expect(stackingResult.violations).toContainEqual(
        expect.objectContaining({ rule: 'temp-hp' })
      );
    });

    it('should allow non-conflicting effects', () => {
      const character = createDefaultCharacter('user-1');
      const { result } = renderHook(() => useEffectManager(character));

      const bless = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
      });

      act(() => {
        result.current.addEffect(bless);
      });

      const haste = createEffect({
        name: 'Haste',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
      });

      const stackingResult = result.current.checkStacking(haste);

      expect(stackingResult.canApply).toBe(true);
      expect(stackingResult.violations).toHaveLength(0);
    });

    it('should provide advantage/disadvantage analysis', () => {
      const character = createDefaultCharacter('user-1');
      const { result } = renderHook(() => useEffectManager(character));

      const poisoned = createEffect({
        name: 'Poisoned',
        appliedBy: 'dm-1',
        appliedTo: character.id,
        durationType: 'saves',
        mechanics: {
          disadvantageOn: ['attacks'],
        },
      });

      act(() => {
        result.current.addEffect(poisoned);
      });

      const advantageResult = result.current.getAdvantageState('attacks');

      expect(advantageResult.netEffect).toBe('disadvantage');
    });
  });
});
