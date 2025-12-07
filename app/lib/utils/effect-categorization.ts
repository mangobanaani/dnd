/**
 * Effect Categorization Utilities
 * Shared logic for categorizing effects as buffs, debuffs, or neutral
 */

import { Effect } from '@/app/types/effects';

export type EffectCategory = 'buff' | 'debuff' | 'neutral';

export interface GroupedEffects {
  buff: Effect[];
  debuff: Effect[];
  neutral: Effect[];
}

/**
 * Categorize an effect as buff, debuff, or neutral based on its mechanics
 */
export function categorizeEffect(effect: Effect): EffectCategory {
  const { mechanics } = effect;

  // Check for beneficial indicators (buffs take priority)
  const hasBonuses = mechanics.bonuses && mechanics.bonuses.length > 0;
  const hasAdvantage = mechanics.advantageOn && mechanics.advantageOn.length > 0;
  const hasTempHP = mechanics.temporaryHitPoints && mechanics.temporaryHitPoints > 0;

  if (hasBonuses || hasAdvantage || hasTempHP) {
    return 'buff';
  }

  // Check for harmful indicators
  const hasDisadvantage = mechanics.disadvantageOn && mechanics.disadvantageOn.length > 0;
  const hasDamage = mechanics.damagePerRound && mechanics.damagePerRound.amount > 0;

  if (hasDisadvantage || hasDamage) {
    return 'debuff';
  }

  return 'neutral';
}

/**
 * Check if an effect is a buff
 */
export function isBuffEffect(effect: Effect): boolean {
  return categorizeEffect(effect) === 'buff';
}

/**
 * Check if an effect is a debuff
 */
export function isDebuffEffect(effect: Effect): boolean {
  return categorizeEffect(effect) === 'debuff';
}

/**
 * Group effects by category in a single pass
 */
export function groupEffectsByCategory(effects: Effect[]): GroupedEffects {
  const grouped: GroupedEffects = {
    buff: [],
    debuff: [],
    neutral: [],
  };

  for (const effect of effects) {
    const category = categorizeEffect(effect);
    grouped[category].push(effect);
  }

  return grouped;
}
