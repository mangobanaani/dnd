/**
 * Character Factory
 * Functions for creating and initializing characters with effects
 */

import { Character, CharacterClass } from '@/app/types/character';
import { Effect } from '@/app/types/effects';
import { EffectService } from '../services/effect.service';

const effectService = new EffectService();

/**
 * Create a default character with all fields initialized
 */
export function createDefaultCharacter(playerId: string): Character {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    name: '',
    race: '',
    classes: [],
    level: 1,
    background: '',
    alignment: '',
    experiencePoints: 0,

    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },

    maxHitPoints: 10,
    currentHitPoints: 10,
    temporaryHitPoints: 0,
    hitDice: [],

    armorClass: 10,
    initiative: 0,
    speed: 30,

    proficiencyBonus: 2,
    savingThrows: [],
    skills: [],

    features: [],
    traits: [],

    equipment: [],
    inventory: [],
    currency: {
      copper: 0,
      silver: 0,
      electrum: 0,
      gold: 0,
      platinum: 0,
    },
    carriedWeight: 0,
    maxCarryWeight: 150,

    effects: [],
    concentration: undefined,
    exhaustionLevel: 0,

    playerId,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Create a character from a template with custom fields
 */
export function createCharacterFromTemplate(
  playerId: string,
  template: Partial<Character>
): Character {
  const defaultChar = createDefaultCharacter(playerId);

  // Calculate total level from classes if provided
  let totalLevel = template.level;
  if (template.classes && template.classes.length > 0) {
    totalLevel = template.classes.reduce((sum, cls) => sum + cls.level, 0);
  }

  // If maxHitPoints is set but currentHitPoints isn't, match them
  const maxHp = template.maxHitPoints ?? defaultChar.maxHitPoints;
  const currentHp = template.currentHitPoints ?? maxHp;

  return {
    ...defaultChar,
    ...template,
    level: totalLevel ?? defaultChar.level,
    maxHitPoints: maxHp,
    currentHitPoints: currentHp,
    effects: template.effects ?? [],
    concentration: template.concentration,
  };
}

/**
 * Initialize effects field for older characters
 * Used for data migration
 */
export function initializeCharacterEffects(character: Omit<Character, 'effects'> & { effects?: Effect[] }): Character {
  return {
    ...character,
    effects: character.effects ?? [],
    concentration: character.concentration,
  };
}

/**
 * Add an effect to a character
 * Handles concentration logic
 */
export function addEffectToCharacter(character: Character, effect: Effect): Character {
  return effectService.addEffect(character, effect) as Character;
}
