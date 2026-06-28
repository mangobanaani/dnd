/**
 * Combat Round Manager
 * Handles turn progression, round advancement, and effect ticking
 */

import { Combatant } from '@/app/types/combat';
import { Effect } from '@/app/types/effects';
import { EffectService } from './effect.service';
import { MINIMUM_HIT_POINTS } from '@/app/lib/constants/dnd-rules';

/**
 * Combat state for round management
 */
export interface CombatState {
  combatants: Combatant[];
  currentRound: number;
  currentTurnIndex: number;
}

/**
 * Result of advancing a turn
 */
export interface TurnAdvanceResult extends CombatState {
  currentCombatant: Combatant;
  roundIncremented: boolean;
}

/**
 * Save prompt for UI
 */
export interface SavePrompt {
  combatantId: string;
  combatantName: string;
  effectId: string;
  effectName: string;
  ability: NonNullable<Effect['saveRequired']>['ability'];
  dc: number;
  timing: NonNullable<Effect['saveRequired']>['timing'];
}

/**
 * Result of applying start-of-turn effects
 */
export interface StartOfTurnResult extends CombatState {
  damageApplied: Array<{
    combatantId: string;
    effectName: string;
    amount: number;
    type: string;
  }>;
}

export class CombatRoundService {
  private effectService: EffectService;

  constructor() {
    this.effectService = new EffectService();
  }

  /**
   * Advance to the next turn
   * Handles skipping inactive combatants and incrementing rounds
   */
  advanceTurn(state: CombatState): TurnAdvanceResult {
    let nextIndex = state.currentTurnIndex + 1;
    let nextRound = state.currentRound;
    let roundIncremented = false;

    // Check if we've completed the round
    if (nextIndex >= state.combatants.length) {
      nextIndex = 0;
      nextRound++;
      roundIncremented = true;
    }

    // Tick effects if we incremented the round
    let combatants = state.combatants;
    if (roundIncremented) {
      combatants = this.tickAllEffects(combatants);
    }

    // Skip inactive combatants
    const hasActive = combatants.some(c => c.isActive);
    if (!hasActive) {
      // All combatants inactive — keep current index rather than looping forever
      nextIndex = state.currentTurnIndex;
    } else {
      let iterations = 0;
      while (nextIndex < combatants.length && !combatants[nextIndex].isActive) {
        iterations++;
        if (iterations >= combatants.length) {
          nextIndex = state.currentTurnIndex;
          break;
        }
        nextIndex++;
        if (nextIndex >= combatants.length) {
          nextIndex = 0;
          if (!roundIncremented) {
            nextRound++;
            roundIncremented = true;
            combatants = this.tickAllEffects(combatants);
          }
        }
      }
    }

    return {
      combatants,
      currentRound: nextRound,
      currentTurnIndex: nextIndex,
      currentCombatant: combatants[nextIndex],
      roundIncremented,
    };
  }

  /**
   * Get all required saves for the current combatant
   */
  getRequiredSaves(state: CombatState, timing: 'start' | 'end'): SavePrompt[] {
    const currentCombatant = state.combatants[state.currentTurnIndex];
    if (!currentCombatant) return [];

    const saves: SavePrompt[] = [];

    for (const effect of currentCombatant.effects) {
      if (effect.durationType === 'saves' && effect.saveRequired?.timing === timing) {
        saves.push({
          combatantId: currentCombatant.id,
          combatantName: currentCombatant.name,
          effectId: effect.id,
          effectName: effect.name,
          ability: effect.saveRequired.ability,
          dc: effect.saveRequired.dc,
          timing: effect.saveRequired.timing,
        });
      }
    }

    return saves;
  }

  /**
   * Process the result of a saving throw
   * Remove effect on success, keep on failure
   */
  processSaveResult(state: CombatState, effectId: string, success: boolean): CombatState {
    if (!success) {
      return state; // Keep effect on failed save
    }

    // Remove effect on successful save
    const combatants = state.combatants.map(combatant => {
      const effectIndex = combatant.effects.findIndex(e => e.id === effectId);
      if (effectIndex === -1) return combatant;

      return this.effectService.removeEffect(combatant, effectId) as Combatant;
    });

    return {
      ...state,
      combatants,
    };
  }

  /**
   * Apply damage-per-round effects at start of turn
   */
  applyStartOfTurnEffects(state: CombatState): StartOfTurnResult {
    const currentCombatant = state.combatants[state.currentTurnIndex];
    if (!currentCombatant) {
      return {
        ...state,
        damageApplied: [],
      };
    }

    const damageApplied: StartOfTurnResult['damageApplied'] = [];
    let updatedCombatant = { ...currentCombatant };

    // Apply damage from each effect
    for (const effect of currentCombatant.effects) {
      if (effect.mechanics.damagePerRound && (!effect.mechanics.damagePerRound.timing || effect.mechanics.damagePerRound.timing === 'start')) {
        const { amount, type } = effect.mechanics.damagePerRound;

        // Apply damage (temp HP first, then real HP)
        if (updatedCombatant.temporaryHitPoints > 0) {
          const tempDamage = Math.min(amount, updatedCombatant.temporaryHitPoints);
          updatedCombatant.temporaryHitPoints -= tempDamage;

          const remainingDamage = amount - tempDamage;
          if (remainingDamage > 0) {
            updatedCombatant.currentHitPoints = Math.max(MINIMUM_HIT_POINTS, updatedCombatant.currentHitPoints - remainingDamage);
          }
        } else {
          updatedCombatant.currentHitPoints = Math.max(MINIMUM_HIT_POINTS, updatedCombatant.currentHitPoints - amount);
        }

        damageApplied.push({
          combatantId: currentCombatant.id,
          effectName: effect.name,
          amount,
          type,
        });
      }
    }

    // Update combatants array
    const combatants = state.combatants.map((c, idx) =>
      idx === state.currentTurnIndex ? updatedCombatant : c
    );

    return {
      ...state,
      combatants,
      damageApplied,
    };
  }

  /**
   * Get the current combatant
   */
  getCurrentCombatant(state: CombatState): Combatant | undefined {
    return state.combatants[state.currentTurnIndex];
  }

  /**
   * Check if the current turn is the last in the round
   */
  isRoundComplete(state: CombatState): boolean {
    const lastActiveIndex = state.combatants.reduce<number>((last, c, idx) => (c.isActive ? idx : last), -1);
    if (lastActiveIndex === -1) return true;
    return state.currentTurnIndex === lastActiveIndex;
  }

  /**
   * Tick all round-based effects for all combatants
   */
  private tickAllEffects(combatants: Combatant[]): Combatant[] {
    return combatants.map(combatant => {
      return this.effectService.tickRound(combatant) as Combatant;
    });
  }
}
