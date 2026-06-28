"use client";

/**
 * useEffectManager Hook
 * Manages effects on characters and combatants
 */

import { useState, useCallback, useMemo } from 'react';
import { Effect } from '@/app/types/effects';
import { Character } from '@/app/types/character';
import { Combatant } from '@/app/types/combat';
import { EffectService, EffectTarget } from '@/app/lib/services/effect.service';
import {
  EffectStackingService,
  AllStackingRulesResult,
  AdvantageDisadvantageResult,
} from '@/app/lib/services/effect-stacking.service';

export interface UseEffectManagerOptions {
  onChange?: (target: EffectTarget) => void;
}

export interface UseEffectManagerResult {
  effects: Effect[];
  concentration: { spell: string; effectIds: string[] } | undefined;
  concentrationEffects: Effect[];
  isConcentrating: boolean;
  addEffect: (effect: Effect) => void;
  removeEffect: (effectId: string) => void;
  updateEffect: (effect: Effect) => void;
  tickRound: () => void;
  breakConcentration: () => void;
  checkStacking: (newEffect: Effect) => AllStackingRulesResult;
  getAdvantageState: (checkType: string) => AdvantageDisadvantageResult;
}

const effectService = new EffectService();
const stackingService = new EffectStackingService();

export function useEffectManager(
  initialTarget: EffectTarget,
  options: UseEffectManagerOptions = {}
): UseEffectManagerResult {
  const { onChange } = options;

  const [target, setTarget] = useState<EffectTarget>(initialTarget);

  const updateTarget = useCallback(
    (updatedTarget: EffectTarget) => {
      setTarget(updatedTarget);
      if (onChange) {
        onChange(updatedTarget);
      }
    },
    [onChange]
  );

  const addEffect = useCallback(
    (effect: Effect) => {
      setTarget((prevTarget) => {
        const updated = effectService.addEffect(prevTarget, effect);
        if (onChange) {
          onChange(updated);
        }
        return updated;
      });
    },
    [onChange]
  );

  const removeEffect = useCallback(
    (effectId: string) => {
      setTarget((prevTarget) => {
        const updated = effectService.removeEffect(prevTarget, effectId);
        if (onChange) {
          onChange(updated);
        }
        return updated;
      });
    },
    [onChange]
  );

  const updateEffect = useCallback(
    (effect: Effect) => {
      setTarget((prevTarget) => {
        const updated = effectService.updateEffect(prevTarget, effect);
        if (onChange) {
          onChange(updated);
        }
        return updated;
      });
    },
    [onChange]
  );

  const tickRound = useCallback(() => {
    setTarget((prevTarget) => {
      const updated = effectService.tickRound(prevTarget);
      if (onChange) {
        onChange(updated);
      }
      return updated;
    });
  }, [onChange]);

  const breakConcentration = useCallback(() => {
    setTarget((prevTarget) => {
      if (prevTarget.concentration) {
        const updated = effectService.breakConcentration(prevTarget);
        if (onChange) {
          onChange(updated);
        }
        return updated;
      }
      return prevTarget;
    });
  }, [onChange]);

  const concentrationEffects = useMemo(() => {
    return target.effects.filter((e) => e.mechanics.requiresConcentration === true);
  }, [target.effects]);

  const isConcentrating = useMemo(() => {
    return target.concentration !== undefined;
  }, [target.concentration]);

  const checkStacking = useCallback(
    (newEffect: Effect): AllStackingRulesResult => {
      return stackingService.checkAllStackingRules(target.effects, newEffect);
    },
    [target.effects]
  );

  const getAdvantageState = useCallback(
    (checkType: string): AdvantageDisadvantageResult => {
      return stackingService.getCurrentAdvantageState(target.effects, checkType);
    },
    [target.effects]
  );

  return {
    effects: target.effects,
    concentration: target.concentration,
    concentrationEffects,
    isConcentrating,
    addEffect,
    removeEffect,
    updateEffect,
    tickRound,
    breakConcentration,
    checkStacking,
    getAdvantageState,
  };
}
