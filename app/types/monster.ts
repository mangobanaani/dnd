/**
 * Monster data type definitions
 * Based on the comprehensive monster database (2,431 monsters)
 */

export interface MonsterEnvironments {
  arctic: boolean;
  coastal: boolean;
  desert: boolean;
  forest: boolean;
  grassland: boolean;
  hill: boolean;
  mountain: boolean;
  swamp: boolean;
  underdark: boolean;
  underwater: boolean;
  urban: boolean;
  other: boolean;
}

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Monster {
  name: string;
  size: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan' | 'Colossal';
  type: 'Aberration' | 'Beast' | 'Celestial' | 'Construct' | 'Dragon' | 'Elemental' |
        'Fey' | 'Fiend' | 'Giant' | 'Humanoid' | 'Monstrosity' | 'Ooze' | 'Plant' | 'Undead';
  tag: string; // Additional type tags like "Shapechanger", "Demon", etc.
  alignment: string;
  movement: string; // Fly/Hover/Swim capabilities
  cr: string; // Challenge Rating: "0", "1/8", "1/4", "1/2", "1"-"30"
  sourceBook: string; // Source book abbreviation (MM, DMG, etc.)
  sourcePage: string; // Page number in source
  spellUser: boolean; // Can cast spells
  legendaryActions: boolean; // Has legendary actions
  lairActions: boolean; // Has lair actions
  abilities: string; // Special abilities text
  actions: string; // Actions text
  reaction: string; // Reaction text
  environments: MonsterEnvironments;
  credits: string; // Attribution/source URL

  // Enhanced/calculated fields (optional - may be added by combat/encounter systems)
  slug?: string; // URL-friendly identifier
  challenge_rating?: string | number; // Alternative field name for cr
  xp?: number; // Experience points for this CR
  hit_points?: number; // Hit points (HP)
  armor_class?: number; // Armor Class (AC)
  dexterity?: number; // Dexterity ability score (deprecated - use abilityScores)
  quantity?: number; // For encounter building

  // Phase 1: Enhanced stats for custom monsters and detailed stat blocks
  ac?: number; // Armor Class (alternative field name)
  hp?: number; // Hit Points (alternative field name)
  speed?: string; // Speed values (e.g., "30 ft., fly 60 ft.")
  abilityScores?: AbilityScores; // Full ability score set
  savingThrows?: string; // Saving throw bonuses (e.g., "Dex +5, Wis +3")
  skills?: string; // Skill bonuses (e.g., "Perception +4, Stealth +6")
  damageResistances?: string; // Damage resistances
  damageImmunities?: string; // Damage immunities
  conditionImmunities?: string; // Condition immunities
  senses?: string; // Senses (e.g., "darkvision 60 ft., passive Perception 14")
  languages?: string; // Languages known
  imageUrl?: string; // Optional image URL for visual display

  // Custom monster metadata
  isCustom?: boolean; // True if user-created monster
  createdAt?: string; // ISO timestamp when created
  updatedAt?: string; // ISO timestamp when last updated
  createdBy?: string; // User ID or name who created it
}

export interface MonsterStats {
  total: number;
  legendary: number;
  withLairActions: number;
  spellcasters: number;
  bySize: Record<string, number>;
  byCR: Record<string, number>;
  byType: Record<string, number>;
  byEnvironment: Record<string, number>;
}

export interface MonsterFilters {
  name?: string;
  size?: string[];
  type?: string[];
  crMin?: number;
  crMax?: number;
  environment?: string[];
  legendary?: boolean;
  spellcaster?: boolean;
  sourceBook?: string[];

  // Phase 1: Additional filter options
  customOnly?: boolean; // Show only custom monsters
  officialOnly?: boolean; // Show only official monsters
  favoriteOnly?: boolean; // Show only favorited monsters
}

export type SortField = 'name' | 'cr' | 'type' | 'size' | 'ac' | 'hp';
export type SortDirection = 'asc' | 'desc';

export interface MonsterSort {
  field: SortField;
  direction: SortDirection;
}

/**
 * Challenge Rating to numeric value conversion
 */
export function crToNumber(cr: string): number {
  switch (cr) {
    case '0': return 0;
    case '1/8': return 0.125;
    case '1/4': return 0.25;
    case '1/2': return 0.5;
    case '?': return 0;
    default: return parseFloat(cr) || 0;
  }
}

/**
 * Calculate XP reward based on Challenge Rating
 */
export function crToXP(cr: string): number {
  const xpTable: Record<string, number> = {
    '0': 10,
    '1/8': 25,
    '1/4': 50,
    '1/2': 100,
    '1': 200,
    '2': 450,
    '3': 700,
    '4': 1100,
    '5': 1800,
    '6': 2300,
    '7': 2900,
    '8': 3900,
    '9': 5000,
    '10': 5900,
    '11': 7200,
    '12': 8400,
    '13': 10000,
    '14': 11500,
    '15': 13000,
    '16': 15000,
    '17': 18000,
    '18': 20000,
    '19': 22000,
    '20': 25000,
    '21': 33000,
    '22': 41000,
    '23': 50000,
    '24': 62000,
    '25': 75000,
    '26': 90000,
    '27': 105000,
    '28': 120000,
    '29': 135000,
    '30': 155000,
  };

  return xpTable[cr] || 0;
}

/**
 * Get difficulty multiplier for encounter building
 * Based on number of monsters in encounter (DMG p.83)
 * Optional partySize adjusts tier: <3 players shifts up one tier, >=6 shifts down one tier
 */
export function getEncounterMultiplier(monsterCount: number, partySize?: number): number {
  const tiers = [1, 1.5, 2, 2.5, 3, 4];

  let tierIndex: number;
  if (monsterCount === 1) tierIndex = 0;
  else if (monsterCount === 2) tierIndex = 1;
  else if (monsterCount >= 3 && monsterCount <= 6) tierIndex = 2;
  else if (monsterCount >= 7 && monsterCount <= 10) tierIndex = 3;
  else if (monsterCount >= 11 && monsterCount <= 14) tierIndex = 4;
  else tierIndex = 5; // 15+

  if (partySize !== undefined) {
    if (partySize < 3) {
      tierIndex = Math.min(tierIndex + 1, tiers.length - 1);
    } else if (partySize >= 6) {
      tierIndex = Math.max(tierIndex - 1, 0);
    }
  }

  return tiers[tierIndex];
}

/**
 * Calculate adjusted XP for encounter building
 */
export function calculateAdjustedXP(monsters: Monster[], partySize?: number): number {
  const totalXP = monsters.reduce((sum, monster) => sum + crToXP(monster.cr), 0);
  const multiplier = getEncounterMultiplier(monsters.length, partySize);
  return Math.round(totalXP * multiplier);
}
