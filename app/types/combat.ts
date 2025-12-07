// D&D Combat Tracker Types and Utilities

import { Effect, Concentration } from './effects';
import { MAX_DEATH_SAVES, MINIMUM_HIT_POINTS } from '@/app/lib/constants/dnd-rules';

export interface Combatant {
  id: string;
  name: string;
  type: 'player' | 'monster' | 'npc';

  // Initiative
  initiative: number;
  initiativeModifier: number;

  // Hit Points
  maxHitPoints: number;
  currentHitPoints: number;
  temporaryHitPoints: number;

  // Combat Stats
  ac: number;

  // Status
  isActive: boolean;
  conditions: Condition[]; // Legacy - will be deprecated in favor of effects
  effects: Effect[]; // New effects system
  concentration?: Concentration;
  exhaustionLevel: number; // 0-6, D&D 5e exhaustion

  // Death Saves (for players at 0 HP)
  deathSaves?: {
    successes: number; // 0-3
    failures: number; // 0-3
  };

  // Additional Info
  characterId?: string;
  monsterId?: string;
  notes?: string;

  // Metadata
  addedAt: string;
}

export interface Condition {
  name: string;
  description: string;
  duration: number; // in rounds, -1 for permanent
  source?: string;
}

export interface CombatEncounter {
  id: string;
  name: string;
  campaignId?: string;

  // Combatants
  combatants: Combatant[];

  // State
  currentRound: number;
  currentTurn: number; // index in sorted combatants
  isActive: boolean;

  // History
  log: CombatLogEntry[];

  // Metadata
  startedAt: string;
  endedAt?: string;
  createdAt: string;
}

export interface CombatLogEntry {
  id: string;
  timestamp: string;
  round: number;
  type: 'damage' | 'heal' | 'condition' | 'death' | 'initiative' | 'other';
  combatantId: string;
  combatantName: string;
  message: string;
  amount?: number;
}

// D&D 5e Conditions
export const DND_CONDITIONS = [
  'Blinded',
  'Charmed',
  'Deafened',
  'Exhausted',
  'Frightened',
  'Grappled',
  'Incapacitated',
  'Invisible',
  'Paralyzed',
  'Petrified',
  'Poisoned',
  'Prone',
  'Restrained',
  'Stunned',
  'Unconscious',
] as const;

export type DndCondition = typeof DND_CONDITIONS[number];

// Condition Descriptions
export const CONDITION_DESCRIPTIONS: Record<DndCondition, string> = {
  'Blinded': 'Cannot see, auto-fail sight checks, attacks have disadvantage, attacks against have advantage',
  'Charmed': 'Cannot attack charmer, charmer has advantage on social checks',
  'Deafened': 'Cannot hear, auto-fail hearing checks',
  'Exhausted': 'Levels 1-6 with increasing penalties, death at level 6',
  'Frightened': 'Disadvantage on checks and attacks while source is in sight, cannot move closer to source',
  'Grappled': 'Speed becomes 0, cannot benefit from speed bonuses',
  'Incapacitated': 'Cannot take actions or reactions',
  'Invisible': 'Impossible to see without special sense, attacks have advantage, attacks against have disadvantage',
  'Paralyzed': 'Incapacitated, cannot move or speak, auto-fail STR/DEX saves, attacks have advantage, crits within 5ft',
  'Petrified': 'Transformed to stone, incapacitated, cannot move, unaware, resistance to all damage, immune to poison',
  'Poisoned': 'Disadvantage on attack rolls and ability checks',
  'Prone': 'Disadvantage on attacks, attacks from within 5ft have advantage, ranged attacks have disadvantage, costs half movement to stand',
  'Restrained': 'Speed becomes 0, attacks have disadvantage, attacks against have advantage, disadvantage on DEX saves',
  'Stunned': 'Incapacitated, cannot move, auto-fail STR/DEX saves, attacks have advantage',
  'Unconscious': 'Incapacitated, cannot move or speak, drops items, auto-fail STR/DEX saves, attacks have advantage, crits within 5ft, unaware',
};

// Utility Functions

/**
 * Roll initiative (d20 + modifier)
 */
export function rollInitiative(modifier: number): number {
  const roll = Math.floor(Math.random() * 20) + 1;
  return roll + modifier;
}

/**
 * Sort combatants by initiative (highest first)
 */
export function sortCombatantsByInitiative(combatants: Combatant[]): Combatant[] {
  return [...combatants].sort((a, b) => {
    if (b.initiative !== a.initiative) {
      return b.initiative - a.initiative;
    }
    // Tie-breaker: higher initiative modifier goes first
    return b.initiativeModifier - a.initiativeModifier;
  });
}

/**
 * Get HP percentage for color coding
 */
export function getHpPercentage(combatant: Combatant): number {
  return (combatant.currentHitPoints / combatant.maxHitPoints) * 100;
}

/**
 * Get HP color based on percentage
 */
export function getHpColor(percentage: number): string {
  if (percentage > 66) return 'bg-green-500';
  if (percentage > 33) return 'bg-yellow-500';
  if (percentage > 0) return 'bg-red-500';
  return 'bg-gray-500';
}

/**
 * Get HP text color based on percentage
 */
export function getHpTextColor(percentage: number): string {
  if (percentage > 66) return 'text-green-400';
  if (percentage > 33) return 'text-yellow-400';
  if (percentage > 0) return 'text-red-400';
  return 'text-gray-400';
}

/**
 * Check if combatant is dead
 */
export function isDead(combatant: Combatant): boolean {
  return combatant.currentHitPoints <= 0;
}

/**
 * Check if combatant is bloodied (below 50% HP)
 */
export function isBloodied(combatant: Combatant): boolean {
  return getHpPercentage(combatant) <= 50;
}

/**
 * Apply damage to combatant (handles temp HP)
 */
export function applyDamage(combatant: Combatant, damage: number): Combatant {
  let remainingDamage = damage;
  let newTempHp = combatant.temporaryHitPoints;
  let newCurrentHp = combatant.currentHitPoints;

  // First apply to temp HP
  if (newTempHp > 0) {
    if (newTempHp >= remainingDamage) {
      newTempHp -= remainingDamage;
      remainingDamage = 0;
    } else {
      remainingDamage -= newTempHp;
      newTempHp = 0;
    }
  }

  // Then apply to current HP
  if (remainingDamage > 0) {
    newCurrentHp = Math.max(MINIMUM_HIT_POINTS, newCurrentHp - remainingDamage);
  }

  return {
    ...combatant,
    currentHitPoints: newCurrentHp,
    temporaryHitPoints: newTempHp,
  };
}

/**
 * Heal combatant
 */
export function healCombatant(combatant: Combatant, amount: number): Combatant {
  return {
    ...combatant,
    currentHitPoints: Math.min(combatant.maxHitPoints, combatant.currentHitPoints + amount),
  };
}

/**
 * Add condition to combatant
 */
export function addCondition(
  combatant: Combatant,
  condition: Condition
): Combatant {
  // Don't add duplicate conditions
  if (combatant.conditions.some((c) => c.name === condition.name)) {
    return combatant;
  }

  return {
    ...combatant,
    conditions: [...combatant.conditions, condition],
  };
}

/**
 * Remove condition from combatant
 */
export function removeCondition(
  combatant: Combatant,
  conditionName: string
): Combatant {
  return {
    ...combatant,
    conditions: combatant.conditions.filter((c) => c.name !== conditionName),
  };
}

/**
 * Decrement condition durations at end of turn
 */
export function decrementConditionDurations(combatant: Combatant): Combatant {
  return {
    ...combatant,
    conditions: combatant.conditions
      .map((c) => ({
        ...c,
        duration: c.duration > 0 ? c.duration - 1 : c.duration,
      }))
      .filter((c) => c.duration !== 0), // Remove expired conditions
  };
}

/**
 * Create default combatant
 */
export function createDefaultCombatant(
  name: string,
  type: 'player' | 'monster' | 'npc'
): Omit<Combatant, 'id'> {
  return {
    name,
    type,
    initiative: 0,
    initiativeModifier: 0,
    maxHitPoints: 10,
    currentHitPoints: 10,
    temporaryHitPoints: 0,
    ac: 10,
    isActive: true,
    conditions: [],
    effects: [],
    exhaustionLevel: 0,
    addedAt: new Date().toISOString(),
  };
}

/**
 * Create combat log entry
 */
export function createLogEntry(
  type: CombatLogEntry['type'],
  combatantId: string,
  combatantName: string,
  message: string,
  round: number,
  amount?: number
): CombatLogEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    round,
    type,
    combatantId,
    combatantName,
    message,
    amount,
  };
}

/**
 * Format log entry for display
 */
export function formatLogEntry(entry: CombatLogEntry): string {
  const time = new Date(entry.timestamp).toLocaleTimeString();
  return `[Round ${entry.round}] ${time}: ${entry.message}`;
}

/**
 * Get combatant icon emoji
 */
export function getCombatantIcon(type: Combatant['type']): string {
  switch (type) {
    case 'player':
      return '⚔️';
    case 'monster':
      return '🐉';
    case 'npc':
      return '🧙';
    default:
      return '❓';
  }
}

/**
 * Get type color
 */
export function getTypeColor(type: Combatant['type']): string {
  switch (type) {
    case 'player':
      return 'text-green-400';
    case 'monster':
      return 'text-red-400';
    case 'npc':
      return 'text-blue-400';
    default:
      return 'text-gray-400';
  }
}

/**
 * Get type background color
 */
export function getTypeBgColor(type: Combatant['type']): string {
  switch (type) {
    case 'player':
      return 'bg-green-500/20';
    case 'monster':
      return 'bg-red-500/20';
    case 'npc':
      return 'bg-blue-500/20';
    default:
      return 'bg-gray-500/20';
  }
}

/**
 * Initialize death saves for a player
 */
export function initializeDeathSaves(): { successes: number; failures: number } {
  return {
    successes: 0,
    failures: 0,
  };
}

/**
 * Add death save success
 */
export function addDeathSaveSuccess(combatant: Combatant): Combatant {
  const deathSaves = combatant.deathSaves || initializeDeathSaves();
  const successes = Math.min(MAX_DEATH_SAVES, deathSaves.successes + 1);

  return {
    ...combatant,
    deathSaves: {
      ...deathSaves,
      successes,
    },
  };
}

/**
 * Add death save failure
 */
export function addDeathSaveFailure(combatant: Combatant): Combatant {
  const deathSaves = combatant.deathSaves || initializeDeathSaves();
  const failures = Math.min(MAX_DEATH_SAVES, deathSaves.failures + 1);

  return {
    ...combatant,
    deathSaves: {
      ...deathSaves,
      failures,
    },
  };
}

/**
 * Reset death saves (when healed above 0 HP)
 */
export function resetDeathSaves(combatant: Combatant): Combatant {
  return {
    ...combatant,
    deathSaves: undefined,
  };
}

/**
 * Check if combatant is stable (3 death save successes or above 0 HP)
 */
export function isStable(combatant: Combatant): boolean {
  // If above 0 HP, they're stable
  if (combatant.currentHitPoints > 0) {
    return true;
  }
  // If at 0 HP, check for max death save successes
  return combatant.deathSaves?.successes === MAX_DEATH_SAVES;
}

/**
 * Check if combatant is permanently dead (3 death save failures)
 */
export function isPermanentlyDead(combatant: Combatant): boolean {
  // If above 0 HP, they're not permanently dead
  if (combatant.currentHitPoints > 0) {
    return false;
  }
  // If at 0 HP, check for max death save failures
  return combatant.deathSaves?.failures === MAX_DEATH_SAVES;
}
