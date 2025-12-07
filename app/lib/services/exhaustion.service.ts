/**
 * Exhaustion Service
 * Manages D&D 5e exhaustion levels on characters and combatants
 */

import { Character } from '@/app/types/character';
import { Combatant } from '@/app/types/combat';
import {
  ExhaustionLevel,
  validateExhaustionLevel,
  getExhaustionPenalties,
  ExhaustionPenalties,
} from '@/app/types/exhaustion';
import { MAX_EXHAUSTION_LEVEL, MINIMUM_EXHAUSTION_LEVEL } from '@/app/lib/constants/dnd-rules';

type ExhaustionTarget = Character | Combatant;

export class ExhaustionService {
  /**
   * Add exhaustion levels
   */
  addExhaustion(target: ExhaustionTarget, levels: number = 1): ExhaustionTarget {
    const currentLevel = target.exhaustionLevel || MINIMUM_EXHAUSTION_LEVEL;
    const newLevel = Math.min(MAX_EXHAUSTION_LEVEL, currentLevel + levels);

    return {
      ...target,
      exhaustionLevel: newLevel as ExhaustionLevel,
    };
  }

  /**
   * Remove exhaustion levels
   */
  removeExhaustion(target: ExhaustionTarget, levels: number = 1): ExhaustionTarget {
    const currentLevel = target.exhaustionLevel || MINIMUM_EXHAUSTION_LEVEL;
    const newLevel = Math.max(MINIMUM_EXHAUSTION_LEVEL, currentLevel - levels);

    return {
      ...target,
      exhaustionLevel: newLevel as ExhaustionLevel,
    };
  }

  /**
   * Set exhaustion to a specific level
   */
  setExhaustion(target: ExhaustionTarget, level: ExhaustionLevel): ExhaustionTarget {
    validateExhaustionLevel(level);

    return {
      ...target,
      exhaustionLevel: level,
    };
  }

  /**
   * Get penalties for current exhaustion level
   */
  getPenalties(target: ExhaustionTarget): ExhaustionPenalties {
    const level = (target.exhaustionLevel || 0) as ExhaustionLevel;
    return getExhaustionPenalties(level);
  }

  /**
   * Check if character is dead from exhaustion
   */
  isDead(target: ExhaustionTarget): boolean {
    return (target.exhaustionLevel || 0) >= 6;
  }

  /**
   * Apply long rest (reduces exhaustion by 1)
   * D&D 5e rule: A long rest reduces exhaustion by 1 level
   */
  applyLongRest(target: ExhaustionTarget): ExhaustionTarget {
    return this.removeExhaustion(target, 1);
  }

  /**
   * Check if character has disadvantage on specific action type
   */
  hasDisadvantageOn(target: ExhaustionTarget, actionType: string): boolean {
    const penalties = this.getPenalties(target);
    return penalties.disadvantageOn.includes(actionType);
  }

  /**
   * Get modified speed based on exhaustion
   */
  getModifiedSpeed(target: ExhaustionTarget, baseSpeed: number): number {
    const penalties = this.getPenalties(target);
    return baseSpeed * penalties.speedMultiplier;
  }

  /**
   * Get modified HP maximum based on exhaustion
   */
  getModifiedHPMax(target: ExhaustionTarget): number {
    const penalties = this.getPenalties(target);
    const baseMax = target.maxHitPoints;
    return Math.floor(baseMax * penalties.hpMaxMultiplier);
  }
}
