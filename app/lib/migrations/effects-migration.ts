/**
 * Effects Migration Utilities
 * Functions to migrate existing data to include effects system
 */

import { Character } from '@/app/types/character';
import { Combatant } from '@/app/types/combat';
import { Effect } from '@/app/types/effects';

/**
 * Current data version
 * Version 1: Original data without effects
 * Version 2: Data with effects system
 */
export const CURRENT_VERSION = 2;

/**
 * Minimal fields required for migration check
 */
export interface MigrationData {
  effects?: Effect[] | null;
  exhaustionLevel?: number;
  [key: string]: any;
}

/**
 * Legacy character (pre-effects system)
 */
export type LegacyCharacter = Omit<Character, 'effects' | 'exhaustionLevel'> & {
  effects?: never;
  exhaustionLevel?: never;
};

/**
 * Legacy combatant (pre-effects system)
 */
export type LegacyCombatant = Omit<Combatant, 'effects' | 'exhaustionLevel'> & {
  effects?: never;
  exhaustionLevel?: never;
};

/**
 * Check if data needs migration
 */
export function needsMigration(data: MigrationData): boolean {
  return !data.effects || data.effects === null || data.effects === undefined;
}

/**
 * Get data version
 */
export function getDataVersion(data: MigrationData): number {
  return needsMigration(data) ? 1 : CURRENT_VERSION;
}

/**
 * Migrate a single character to include effects
 */
export function migrateCharacter(character: MigrationData): Character {
  // If already has effects, return as-is
  if (character.effects && Array.isArray(character.effects)) {
    return character as Character;
  }

  // Add effects and exhaustionLevel fields
  return {
    ...(character as any),
    effects: [],
    exhaustionLevel: character.exhaustionLevel ?? 0,
    concentration: character.concentration,
  } as Character;
}

/**
 * Migrate a single combatant to include effects
 */
export function migrateCombatant(combatant: MigrationData): Combatant {
  // If already has effects, return as-is
  if (combatant.effects && Array.isArray(combatant.effects)) {
    return combatant as Combatant;
  }

  // Migrate HP field names from old to new
  const migratedCombatant: any = { ...combatant };

  if ('maxHp' in migratedCombatant) {
    migratedCombatant.maxHitPoints = migratedCombatant.maxHp;
    delete migratedCombatant.maxHp;
  }

  if ('currentHp' in migratedCombatant) {
    migratedCombatant.currentHitPoints = migratedCombatant.currentHp;
    delete migratedCombatant.currentHp;
  }

  if ('temporaryHp' in migratedCombatant) {
    migratedCombatant.temporaryHitPoints = migratedCombatant.temporaryHp;
    delete migratedCombatant.temporaryHp;
  }

  // Add effects and exhaustionLevel fields
  return {
    ...migratedCombatant,
    effects: [],
    exhaustionLevel: migratedCombatant.exhaustionLevel ?? 0,
    concentration: migratedCombatant.concentration,
  } as Combatant;
}

/**
 * Migrate array of characters
 */
export function migrateAllCharacters(characters: MigrationData[]): Character[] {
  return characters.map(char => migrateCharacter(char));
}

/**
 * Migrate array of combatants
 */
export function migrateAllCombatants(combatants: MigrationData[]): Combatant[] {
  return combatants.map(combatant => migrateCombatant(combatant));
}

/**
 * Migrate localStorage data
 * Detects and migrates all character and combatant data
 */
export function migrateLocalStorage(): {
  charactersUpdated: number;
  combatantsUpdated: number;
} {
  let charactersUpdated = 0;
  let combatantsUpdated = 0;

  // Migrate characters
  const charactersKey = 'dnd-characters';
  const charactersData = localStorage.getItem(charactersKey);
  if (charactersData) {
    try {
      const characters = JSON.parse(charactersData);
      if (Array.isArray(characters)) {
        const needsUpdate = characters.some(needsMigration);
        if (needsUpdate) {
          const migrated = migrateAllCharacters(characters);
          localStorage.setItem(charactersKey, JSON.stringify(migrated));
          charactersUpdated = migrated.length;
        }
      }
    } catch (error) {
      console.error('Failed to migrate characters:', error);
    }
  }

  // Note: Combatants are typically session-based, not stored long-term
  // But we provide the utility for completeness

  return {
    charactersUpdated,
    combatantsUpdated,
  };
}
