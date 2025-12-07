// D&D 5e Character Types and Utilities

import { Effect, Concentration } from './effects';

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion' | 'scroll' | 'wondrous' | 'tool' | 'gear' | 'treasure' | 'other';
  quantity: number;
  weight: number; // in pounds
  value: number; // in gold pieces
  description?: string;
  equipped: boolean;
  attuned: boolean;
  magical: boolean;
  rarity?: 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary' | 'artifact';
  properties?: string[]; // e.g., "Versatile", "Finesse", "Heavy"
}

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Skill {
  name: string;
  ability: keyof AbilityScores;
  proficient: boolean;
  expertise: boolean;
}

export interface CharacterClass {
  name: string;
  level: number;
  hitDie: string;
  subclass?: string;
}

export interface Character {
  id: string;
  name: string;
  race: string;
  classes: CharacterClass[];
  level: number; // Total level
  background: string;
  alignment: string;
  experiencePoints: number;

  // Ability Scores
  abilityScores: AbilityScores;

  // Hit Points
  maxHitPoints: number;
  currentHitPoints: number;
  temporaryHitPoints: number;
  hitDice: {
    total: number;
    current: number;
    die: string;
  }[];

  // Combat Stats
  armorClass: number;
  initiative: number;
  speed: number;

  // Proficiencies
  proficiencyBonus: number;
  savingThrows: (keyof AbilityScores)[];
  skills: Skill[];

  // Features & Traits
  features: string[];
  traits: string[];

  // Equipment
  equipment: string[]; // Legacy simple equipment list
  inventory: InventoryItem[];
  currency: {
    copper: number;
    silver: number;
    electrum: number;
    gold: number;
    platinum: number;
  };
  carriedWeight: number;
  maxCarryWeight: number;

  // Spellcasting
  spellcastingAbility?: keyof AbilityScores;
  spellSlots?: {
    level: number;
    total: number;
    used: number;
  }[];
  knownSpells?: string[];
  preparedSpells?: string[];

  // Active Effects
  effects: Effect[];
  concentration?: Concentration;
  exhaustionLevel: number; // 0-6, D&D 5e exhaustion

  // Metadata
  campaignId?: string;
  playerId: string;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
  notes?: string;
}

// D&D 5e Classes
export const DND_CLASSES = [
  'Barbarian',
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Monk',
  'Paladin',
  'Ranger',
  'Rogue',
  'Sorcerer',
  'Warlock',
  'Wizard',
  'Artificer',
] as const;

export type DndClass = typeof DND_CLASSES[number];

// D&D 5e Races
export const DND_RACES = [
  'Dragonborn',
  'Dwarf',
  'Elf',
  'Gnome',
  'Half-Elf',
  'Half-Orc',
  'Halfling',
  'Human',
  'Tiefling',
] as const;

export type DndRace = typeof DND_RACES[number];

// D&D 5e Alignments
export const DND_ALIGNMENTS = [
  'Lawful Good',
  'Neutral Good',
  'Chaotic Good',
  'Lawful Neutral',
  'True Neutral',
  'Chaotic Neutral',
  'Lawful Evil',
  'Neutral Evil',
  'Chaotic Evil',
] as const;

export type DndAlignment = typeof DND_ALIGNMENTS[number];

// D&D 5e Skills
export const DND_SKILLS: Skill[] = [
  { name: 'Acrobatics', ability: 'dexterity', proficient: false, expertise: false },
  { name: 'Animal Handling', ability: 'wisdom', proficient: false, expertise: false },
  { name: 'Arcana', ability: 'intelligence', proficient: false, expertise: false },
  { name: 'Athletics', ability: 'strength', proficient: false, expertise: false },
  { name: 'Deception', ability: 'charisma', proficient: false, expertise: false },
  { name: 'History', ability: 'intelligence', proficient: false, expertise: false },
  { name: 'Insight', ability: 'wisdom', proficient: false, expertise: false },
  { name: 'Intimidation', ability: 'charisma', proficient: false, expertise: false },
  { name: 'Investigation', ability: 'intelligence', proficient: false, expertise: false },
  { name: 'Medicine', ability: 'wisdom', proficient: false, expertise: false },
  { name: 'Nature', ability: 'intelligence', proficient: false, expertise: false },
  { name: 'Perception', ability: 'wisdom', proficient: false, expertise: false },
  { name: 'Performance', ability: 'charisma', proficient: false, expertise: false },
  { name: 'Persuasion', ability: 'charisma', proficient: false, expertise: false },
  { name: 'Religion', ability: 'intelligence', proficient: false, expertise: false },
  { name: 'Sleight of Hand', ability: 'dexterity', proficient: false, expertise: false },
  { name: 'Stealth', ability: 'dexterity', proficient: false, expertise: false },
  { name: 'Survival', ability: 'wisdom', proficient: false, expertise: false },
];

// Utility Functions

/**
 * Calculate ability modifier from ability score
 */
export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Calculate proficiency bonus based on character level
 */
export function calculateProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

/**
 * Calculate skill modifier
 */
export function calculateSkillModifier(
  skill: Skill,
  abilityScores: AbilityScores,
  proficiencyBonus: number
): number {
  const abilityModifier = calculateModifier(abilityScores[skill.ability]);
  let modifier = abilityModifier;

  if (skill.expertise) {
    modifier += proficiencyBonus * 2;
  } else if (skill.proficient) {
    modifier += proficiencyBonus;
  }

  return modifier;
}

/**
 * Calculate saving throw modifier
 */
export function calculateSavingThrow(
  ability: keyof AbilityScores,
  abilityScores: AbilityScores,
  proficientSaves: (keyof AbilityScores)[],
  proficiencyBonus: number
): number {
  const abilityModifier = calculateModifier(abilityScores[ability]);
  const isProficient = proficientSaves.includes(ability);

  return isProficient ? abilityModifier + proficiencyBonus : abilityModifier;
}

/**
 * Format modifier with + or - sign
 */
export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/**
 * Calculate XP needed for next level
 */
export function xpForLevel(level: number): number {
  const xpTable: Record<number, number> = {
    1: 0,
    2: 300,
    3: 900,
    4: 2700,
    5: 6500,
    6: 14000,
    7: 23000,
    8: 34000,
    9: 48000,
    10: 64000,
    11: 85000,
    12: 100000,
    13: 120000,
    14: 140000,
    15: 165000,
    16: 195000,
    17: 225000,
    18: 265000,
    19: 305000,
    20: 355000,
  };

  return xpTable[level] || 0;
}

/**
 * Get character level from XP
 */
export function getLevelFromXP(xp: number): number {
  for (let level = 20; level >= 1; level--) {
    if (xp >= xpForLevel(level)) {
      return level;
    }
  }
  return 1;
}

/**
 * Get total character level from classes
 */
export function getTotalLevel(classes: CharacterClass[]): number {
  return classes.reduce((sum, cls) => sum + cls.level, 0);
}

/**
 * Create default character
 */
export function createDefaultCharacter(playerId: string): Omit<Character, 'id'> {
  const now = new Date().toISOString();

  return {
    name: '',
    race: 'Human',
    classes: [{ name: 'Fighter', level: 1, hitDie: 'd10' }],
    level: 1,
    background: '',
    alignment: 'True Neutral',
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
    hitDice: [{ total: 1, current: 1, die: 'd10' }],

    armorClass: 10,
    initiative: 0,
    speed: 30,

    proficiencyBonus: 2,
    savingThrows: ['strength', 'constitution'],
    skills: JSON.parse(JSON.stringify(DND_SKILLS)),

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
    maxCarryWeight: 150, // Base 15 * Strength score

    effects: [],
    exhaustionLevel: 0,

    playerId,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Calculate max carry weight (Strength score × 15)
 */
export function calculateMaxCarryWeight(strength: number): number {
  return strength * 15;
}

/**
 * Calculate total weight of inventory
 */
export function calculateTotalWeight(inventory: InventoryItem[] = []): number {
  if (!Array.isArray(inventory) || inventory.length === 0) {
    return 0;
  }
  return inventory.reduce((total, item) => total + (item.weight * item.quantity), 0);
}

/**
 * Format weight display
 */
export function formatWeight(weight: number): string {
  return `${weight.toFixed(1)} lbs`;
}

/**
 * Calculate total value of inventory in gold
 */
export function calculateTotalValue(inventory: InventoryItem[] = []): number {
  if (!Array.isArray(inventory) || inventory.length === 0) {
    return 0;
  }
  return inventory.reduce((total, item) => total + (item.value * item.quantity), 0);
}

/**
 * Format currency display
 */
export function formatCurrency(value: number): string {
  return `${value.toLocaleString()} gp`;
}
