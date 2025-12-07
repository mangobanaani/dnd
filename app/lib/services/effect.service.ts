/**
 * Effect Service
 * Manages effect application, removal, and duration tracking
 */

import {
  Effect,
  Concentration,
  isRoundBasedEffect,
  createConcentration,
} from '@/app/types/effects';
import { MINIMUM_CONCENTRATION_DC } from '@/app/lib/constants/dnd-rules';

/**
 * Target that can have effects applied (Character or Combatant)
 */
export interface EffectTarget {
  id: string;
  effects: Effect[];
  tempHp?: number;
  concentration?: Concentration;
}

/**
 * Result of a concentration check
 */
export interface ConcentrationCheckResult {
  dc: number;
  passed: boolean;
}

export class EffectService {
  /**
   * Add an effect to a target
   * If effect requires concentration, break existing concentration
   */
  addEffect(target: EffectTarget, effect: Effect): EffectTarget {
    let updated = { ...target };

    // If new effect requires concentration, break existing concentration
    if (effect.mechanics.requiresConcentration) {
      if (updated.concentration) {
        // Break existing concentration
        updated = this.breakConcentration(updated);
      }

      // Set new concentration
      updated.concentration = createConcentration(effect.name, [effect.id]);
    }

    // Add effect
    return {
      ...updated,
      effects: [...updated.effects, effect],
    };
  }

  /**
   * Remove an effect from a target by ID
   */
  removeEffect(target: EffectTarget, effectId: string): EffectTarget {
    const effect = target.effects.find(e => e.id === effectId);

    // Remove the effect
    const effects = target.effects.filter(e => e.id !== effectId);

    // Clear concentration if this was the concentrated effect
    let concentration = target.concentration;
    if (effect?.mechanics.requiresConcentration && concentration?.effectIds.includes(effectId)) {
      concentration = undefined;
    }

    return {
      ...target,
      effects,
      concentration,
    };
  }

  /**
   * Update an existing effect
   */
  updateEffect(target: EffectTarget, effect: Effect): EffectTarget {
    const effects = target.effects.map(e => (e.id === effect.id ? effect : e));

    return {
      ...target,
      effects,
    };
  }

  /**
   * Tick round - decrement round-based effects and remove expired ones
   * Optimized single-pass algorithm
   */
  tickRound(target: EffectTarget): EffectTarget {
    const updatedEffects: Effect[] = [];

    for (const effect of target.effects) {
      if (isRoundBasedEffect(effect) && effect.roundsRemaining !== undefined) {
        const newRounds = effect.roundsRemaining - 1;
        // Only keep effect if rounds remain
        if (newRounds > 0) {
          updatedEffects.push({
            ...effect,
            roundsRemaining: newRounds,
          });
        }
        // If newRounds <= 0, effect expires and is not added to updatedEffects
      } else {
        // Non-round-based effects pass through unchanged
        updatedEffects.push(effect);
      }
    }

    // Update concentration if concentrated effect expired
    let concentration = target.concentration;
    if (concentration) {
      const concentratedEffect = updatedEffects.find(e =>
        concentration?.effectIds.includes(e.id)
      );
      if (!concentratedEffect) {
        concentration = undefined;
      }
    }

    return {
      ...target,
      effects: updatedEffects,
      concentration,
    };
  }

  /**
   * Check concentration save
   * DC is 10 or half the damage taken, whichever is higher
   * Returns { dc, passed } where passed is null if no roll provided
   */
  checkConcentration(damage: number, roll?: number): ConcentrationCheckResult {
    const dc = Math.max(MINIMUM_CONCENTRATION_DC, Math.floor(damage / 2));
    const passed = roll !== undefined ? roll >= dc : true;

    return { dc, passed };
  }

  /**
   * Break concentration - remove all concentration effects
   */
  breakConcentration(target: EffectTarget): EffectTarget {
    if (!target.concentration) {
      return target;
    }

    // Remove all effects that are part of the concentration
    const effects = target.effects.filter(
      effect => !target.concentration?.effectIds.includes(effect.id)
    );

    return {
      ...target,
      effects,
      concentration: undefined,
    };
  }

  /**
   * Check if a user can remove an effect
   * DM can remove any effect
   * Players can only remove effects they created
   */
  canRemoveEffect(userId: string, effect: Effect, isDM: boolean): boolean {
    if (isDM) {
      return true;
    }

    return effect.appliedBy === userId;
  }

  /**
   * Get all effects of a specific duration type
   */
  getEffectsByType(target: EffectTarget, durationType: Effect['durationType']): Effect[] {
    return target.effects.filter(effect => effect.durationType === durationType);
  }
}
