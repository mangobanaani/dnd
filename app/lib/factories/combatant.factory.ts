/**
 * Combatant Factory
 * Functions for creating combatants from characters and monsters
 */

import { Combatant } from '@/app/types/combat';
import { Character } from '@/app/types/character';
import { Monster } from '@/app/types/monster';
import { Effect } from '@/app/types/effects';
import { EffectService } from '../services/effect.service';

const effectService = new EffectService();

/**
 * Calculate ability modifier from ability score
 */
function calculateModifier(abilityScore: number): number {
  return Math.floor((abilityScore - 10) / 2);
}

/**
 * Create a combatant from a character
 */
export function createCombatantFromCharacter(
  character: Character,
  initiative: number
): Combatant {
  return {
    id: crypto.randomUUID(),
    name: character.name,
    type: 'player',
    initiative,
    initiativeModifier: character.initiative,
    maxHitPoints: character.maxHitPoints,
    currentHitPoints: character.currentHitPoints,
    temporaryHitPoints: character.temporaryHitPoints,
    ac: character.armorClass,
    isActive: true,
    conditions: [],
    effects: character.effects || [],
    concentration: character.concentration,
    exhaustionLevel: character.exhaustionLevel || 0,
    characterId: character.id,
    addedAt: new Date().toISOString(),
  };
}

/**
 * Create a combatant from a monster
 */
export function createCombatantFromMonster(
  monster: Monster,
  initiative: number
): Combatant {
  // Use enhanced fields if available, otherwise defaults
  const hp = monster.hit_points ?? 10;
  const ac = monster.armor_class ?? 10;
  const dexModifier = monster.dexterity ? calculateModifier(monster.dexterity) : 0;

  return {
    id: crypto.randomUUID(),
    name: monster.name,
    type: 'monster',
    initiative,
    initiativeModifier: dexModifier,
    maxHitPoints: hp,
    currentHitPoints: hp,
    temporaryHitPoints: 0,
    ac,
    isActive: true,
    conditions: [],
    effects: [],
    concentration: undefined,
    exhaustionLevel: 0,
    monsterId: monster.slug || monster.name.toLowerCase().replace(/\s+/g, '-'),
    addedAt: new Date().toISOString(),
  };
}

/**
 * Initialize effects field for older combatants
 * Used for data migration
 */
export function initializeCombatantEffects(combatant: Omit<Combatant, 'effects'> & { effects?: Effect[] }): Combatant {
  return {
    ...combatant,
    effects: combatant.effects ?? [],
    concentration: combatant.concentration,
  };
}

/**
 * Add an effect to a combatant
 * Handles concentration logic
 */
export function addEffectToCombatant(combatant: Combatant, effect: Effect): Combatant {
  return effectService.addEffect(combatant, effect) as Combatant;
}
