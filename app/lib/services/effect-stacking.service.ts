/**
 * Effect Stacking Service
 * Implements D&D 5e stacking rules for effects
 */

import { Effect } from '@/app/types/effects';

export interface StackingCheckResult {
  canStack: boolean;
  reason?: string;
  conflictingEffectId?: string;
  suggestion?: 'replace' | 'keep-existing' | 'keep-both';
  totalBonus?: number;
  recommendedValue?: number;
}

export interface AdvantageDisadvantageResult {
  hasAdvantage: boolean;
  hasDisadvantage: boolean;
  netEffect: 'advantage' | 'disadvantage' | 'normal';
}

export interface StackingViolation {
  rule: string;
  message: string;
  conflictingEffectId?: string;
}

export interface AllStackingRulesResult {
  canApply: boolean;
  violations: StackingViolation[];
  suggestion?: 'replace' | 'keep-existing' | 'apply-anyway';
}

export class EffectStackingService {
  /**
   * Check if a new effect can stack with existing effects (same name rule)
   * D&D 5e Rule: Effects with the same name from the same source don't stack
   *
   * Enhanced with effectType: Same-name effects from different types can coexist
   * - A "Shield" spell and a "Shield" item can both be active
   * - Two "Shield" spells cannot both be active
   */
  checkStacking(existingEffects: Effect[], newEffect: Effect): StackingCheckResult {
    const duplicate = existingEffects.find(
      (e) => e.name === newEffect.name && e.effectType === newEffect.effectType
    );

    if (duplicate) {
      return {
        canStack: false,
        reason: 'same-name',
        conflictingEffectId: duplicate.id,
        suggestion: 'replace',
      };
    }

    return {
      canStack: true,
    };
  }

  /**
   * Check advantage/disadvantage interaction
   * D&D 5e Rule: Multiple advantage = advantage, advantage + disadvantage = normal
   */
  checkAdvantageDisadvantage(
    existingEffects: Effect[],
    newEffect: Effect,
    checkType: string
  ): AdvantageDisadvantageResult {
    const allEffects = [...existingEffects, newEffect];

    let hasAdvantage = false;
    let hasDisadvantage = false;

    for (const effect of allEffects) {
      if (effect.mechanics.advantageOn?.includes(checkType)) {
        hasAdvantage = true;
      }
      if (effect.mechanics.disadvantageOn?.includes(checkType)) {
        hasDisadvantage = true;
      }
    }

    let netEffect: 'advantage' | 'disadvantage' | 'normal' = 'normal';
    if (hasAdvantage && !hasDisadvantage) {
      netEffect = 'advantage';
    } else if (hasDisadvantage && !hasAdvantage) {
      netEffect = 'disadvantage';
    }

    return {
      hasAdvantage,
      hasDisadvantage,
      netEffect,
    };
  }

  /**
   * Get current advantage/disadvantage state for existing effects only
   * This is a convenience method for checking current state without adding a new effect
   *
   * D&D 5e Rule: Multiple advantage = advantage, advantage + disadvantage = normal
   *
   * @param effects - Current active effects
   * @param checkType - Type of check (e.g., 'attacks', 'saves', 'ability-checks')
   * @returns AdvantageDisadvantageResult showing net effect
   */
  getCurrentAdvantageState(
    effects: Effect[],
    checkType: string
  ): AdvantageDisadvantageResult {
    let hasAdvantage = false;
    let hasDisadvantage = false;

    for (const effect of effects) {
      if (effect.mechanics.advantageOn?.includes(checkType)) {
        hasAdvantage = true;
      }
      if (effect.mechanics.disadvantageOn?.includes(checkType)) {
        hasDisadvantage = true;
      }
    }

    let netEffect: 'advantage' | 'disadvantage' | 'normal' = 'normal';
    if (hasAdvantage && !hasDisadvantage) {
      netEffect = 'advantage';
    } else if (hasDisadvantage && !hasAdvantage) {
      netEffect = 'disadvantage';
    }

    return {
      hasAdvantage,
      hasDisadvantage,
      netEffect,
    };
  }

  /**
   * Check bonus stacking
   *
   * D&D 5e Rule: Bonuses stack UNLESS they come from the same spell/source
   *
   * IMPORTANT IMPLEMENTATION NOTE:
   * Unlike D&D 3.5e/Pathfinder, D&D 5e does NOT have typed bonuses
   * (no "enhancement bonus", "dodge bonus", "deflection bonus", etc.).
   * In D&D 5e, ALL bonuses from DIFFERENT sources stack.
   *
   * This method returns true for all bonus stacking because the
   * same-source restriction is already handled by checkStacking()
   * via the same-name rule.
   *
   * Examples:
   * - Shield (+5 AC) + Shield of Faith (+2 AC) = +7 AC total (STACK)
   * - Shield (+5 AC) + Shield (+5 AC) = NO (prevented by same-name rule)
   * - Bless (+1d4 attack) + Bardic Inspiration (+1d6 attack) = BOTH apply (STACK)
   *
   * Limitation: This implementation assumes all bonuses come from spell effects
   * with unique names. Magic items or other permanent bonuses that share names
   * would incorrectly be prevented from stacking.
   *
   * @param existingEffects - Current active effects
   * @param newEffect - Effect being added
   * @returns StackingCheckResult indicating bonuses can stack
   */
  checkBonusStacking(
    existingEffects: Effect[],
    newEffect: Effect
  ): StackingCheckResult {
    // In D&D 5e, bonuses stack unless from the same source
    // Same source = same name, checked by checkStacking()
    // Therefore, always allow bonus stacking here
    return {
      canStack: true,
    };
  }

  /**
   * Check temporary HP stacking
   * D&D 5e Rule: Temporary HP doesn't stack, take highest
   */
  checkTemporaryHPStacking(
    existingEffects: Effect[],
    newEffect: Effect
  ): StackingCheckResult {
    const existingTempHP = existingEffects.find(
      (e) => e.mechanics.temporaryHitPoints !== undefined
    );

    const newTempHP = newEffect.mechanics.temporaryHitPoints;

    if (existingTempHP && newTempHP !== undefined) {
      const existingValue = existingTempHP.mechanics.temporaryHitPoints ?? 0;
      const recommendedValue = Math.max(existingValue, newTempHP);

      return {
        canStack: false,
        reason: 'temp-hp-no-stack',
        conflictingEffectId: existingTempHP.id,
        recommendedValue,
      };
    }

    return {
      canStack: true,
    };
  }

  /**
   * Perform all stacking checks
   */
  checkAllStackingRules(
    existingEffects: Effect[],
    newEffect: Effect
  ): AllStackingRulesResult {
    const violations: StackingViolation[] = [];

    // Check same-name rule
    const sameNameCheck = this.checkStacking(existingEffects, newEffect);
    if (!sameNameCheck.canStack) {
      violations.push({
        rule: 'same-name',
        message: `Effect "${newEffect.name}" already exists`,
        conflictingEffectId: sameNameCheck.conflictingEffectId,
      });
    }

    // Check temp HP rule
    const tempHPCheck = this.checkTemporaryHPStacking(existingEffects, newEffect);
    if (!tempHPCheck.canStack) {
      violations.push({
        rule: 'temp-hp',
        message: 'Temporary HP does not stack, keep highest value',
        conflictingEffectId: tempHPCheck.conflictingEffectId,
      });
    }

    const canApply = violations.length === 0;
    let suggestion: 'replace' | 'keep-existing' | 'apply-anyway' | undefined;

    if (!canApply) {
      // If there's a same-name violation, suggest replace
      if (violations.some((v) => v.rule === 'same-name')) {
        suggestion = 'replace';
      }
    }

    return {
      canApply,
      violations,
      suggestion,
    };
  }
}
