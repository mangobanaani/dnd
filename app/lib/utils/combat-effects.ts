/**
 * Combat Effects Integration Utilities
 * Helper functions for integrating effects into combat flow
 */

import { Combatant } from '@/app/types/combat';
import { Character } from '@/app/types/character';
import { Effect } from '@/app/types/effects';
import { EffectService } from '@/app/lib/services/effect.service';
import { MINIMUM_CONCENTRATION_DC } from '@/app/lib/constants/dnd-rules';

const effectService = new EffectService();

export interface DamageLog {
  source: string;
  amount: number;
  type: string;
}

export interface StartOfTurnResult {
  currentHitPoints: number;
  temporaryHitPoints: number;
  damageLog: DamageLog[];
}

export interface SaveRequirement {
  effectId: string;
  effectName: string;
  ability: string;
  dc: number;
}

export interface ConcentrationCheck {
  dc: number;
  spell: string;
}

/**
 * Apply start-of-turn effects (damage, healing, etc.)
 */
export function applyStartOfTurnEffects(combatant: Combatant): StartOfTurnResult {
  let currentHitPoints = combatant.currentHitPoints;
  let temporaryHitPoints = combatant.temporaryHitPoints || 0;
  const damageLog: DamageLog[] = [];

  // Get all start-of-turn damage effects
  const damageEffects = combatant.effects.filter(
    (e) =>
      e.mechanics.damagePerRound &&
      (!e.mechanics.damagePerRound.timing || e.mechanics.damagePerRound.timing === 'start')
  );

  // Apply each damage effect
  for (const effect of damageEffects) {
    if (!effect.mechanics.damagePerRound) continue;

    const damage = effect.mechanics.damagePerRound.amount;
    const type = effect.mechanics.damagePerRound.type;

    damageLog.push({
      source: effect.name,
      amount: damage,
      type,
    });

    // Apply damage (temp HP absorbs first)
    if (temporaryHitPoints > 0) {
      if (temporaryHitPoints >= damage) {
        temporaryHitPoints -= damage;
      } else {
        const overflow = damage - temporaryHitPoints;
        temporaryHitPoints = 0;
        currentHitPoints -= overflow;
      }
    } else {
      currentHitPoints -= damage;
    }
  }

  return {
    currentHitPoints,
    temporaryHitPoints,
    damageLog,
  };
}

/**
 * Get required saving throws for start or end of turn
 */
export function getRequiredSavingThrows(
  combatant: Combatant,
  timing: 'start' | 'end'
): SaveRequirement[] {
  const saves: SaveRequirement[] = [];

  for (const effect of combatant.effects) {
    if (
      effect.durationType === 'saves' &&
      effect.saveRequired &&
      effect.saveRequired.timing === timing
    ) {
      saves.push({
        effectId: effect.id,
        effectName: effect.name,
        ability: effect.saveRequired.ability,
        dc: effect.saveRequired.dc,
      });
    }
  }

  return saves;
}

/**
 * Check if concentration check is needed after taking damage
 * Returns the DC and spell name, or null if not concentrating
 */
export function checkConcentrationDamage(
  combatant: Combatant,
  damage: number
): ConcentrationCheck | null {
  if (!combatant.concentration) {
    return null;
  }

  const dc = Math.max(MINIMUM_CONCENTRATION_DC, Math.floor(damage / 2));

  return {
    dc,
    spell: combatant.concentration.spell,
  };
}

/**
 * Sync effects and HP from combatant back to character
 * Used when combat ends or character is updated
 */
export function syncCombatantToCharacter(
  combatant: Combatant,
  character: Character
): Character {
  return {
    ...character,
    effects: combatant.effects,
    concentration: combatant.concentration,
    currentHitPoints: combatant.currentHitPoints,
    temporaryHitPoints: combatant.temporaryHitPoints || 0,
  };
}

/**
 * Sync effects and HP from character to combatant
 * Used when creating combatant or refreshing state
 */
export function syncCharacterToCombatant(
  character: Character,
  combatant: Combatant
): Combatant {
  return {
    ...combatant,
    effects: character.effects,
    concentration: character.concentration,
    currentHitPoints: character.currentHitPoints,
    temporaryHitPoints: character.temporaryHitPoints,
  };
}
