// D&D 5e Spell Types and Utilities

export interface Spell {
  slug: string;
  name: string;
  level: number; // 0 for cantrips
  school: SpellSchool;
  castingTime: string;
  range: string;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
    materialsNeeded?: string;
  };
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: string;
  higherLevels?: string;
  classes: string[]; // Classes that can learn this spell
  sourceBook: string;
  page?: number;
}

export type SpellSchool =
  | 'Abjuration'
  | 'Conjuration'
  | 'Divination'
  | 'Enchantment'
  | 'Evocation'
  | 'Illusion'
  | 'Necromancy'
  | 'Transmutation';

export const SPELL_SCHOOLS: SpellSchool[] = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
];

export const SPELL_LEVELS = [
  { level: 0, name: 'Cantrip' },
  { level: 1, name: '1st Level' },
  { level: 2, name: '2nd Level' },
  { level: 3, name: '3rd Level' },
  { level: 4, name: '4th Level' },
  { level: 5, name: '5th Level' },
  { level: 6, name: '6th Level' },
  { level: 7, name: '7th Level' },
  { level: 8, name: '8th Level' },
  { level: 9, name: '9th Level' },
];

export const SPELL_CLASSES = [
  'Bard',
  'Cleric',
  'Druid',
  'Paladin',
  'Ranger',
  'Sorcerer',
  'Warlock',
  'Wizard',
  'Artificer',
];

// Spell School Colors for UI
export function getSchoolColor(school: SpellSchool): string {
  switch (school) {
    case 'Abjuration':
      return 'text-blue-400';
    case 'Conjuration':
      return 'text-purple-400';
    case 'Divination':
      return 'text-cyan-400';
    case 'Enchantment':
      return 'text-pink-400';
    case 'Evocation':
      return 'text-red-400';
    case 'Illusion':
      return 'text-indigo-400';
    case 'Necromancy':
      return 'text-green-400';
    case 'Transmutation':
      return 'text-yellow-400';
    default:
      return 'text-gray-400';
  }
}

export function getSchoolBgColor(school: SpellSchool): string {
  switch (school) {
    case 'Abjuration':
      return 'bg-blue-500/20';
    case 'Conjuration':
      return 'bg-purple-500/20';
    case 'Divination':
      return 'bg-cyan-500/20';
    case 'Enchantment':
      return 'bg-pink-500/20';
    case 'Evocation':
      return 'bg-red-500/20';
    case 'Illusion':
      return 'bg-indigo-500/20';
    case 'Necromancy':
      return 'bg-green-500/20';
    case 'Transmutation':
      return 'bg-yellow-500/20';
    default:
      return 'bg-gray-500/20';
  }
}

// Get school icon
export function getSchoolIcon(school: SpellSchool): string {
  switch (school) {
    case 'Abjuration':
      return '🛡️';
    case 'Conjuration':
      return '🌀';
    case 'Divination':
      return '🔮';
    case 'Enchantment':
      return '💫';
    case 'Evocation':
      return '🔥';
    case 'Illusion':
      return '✨';
    case 'Necromancy':
      return '💀';
    case 'Transmutation':
      return '⚗️';
    default:
      return '📜';
  }
}

// Format spell level
export function formatSpellLevel(level: number): string {
  if (level === 0) return 'Cantrip';
  if (level === 1) return '1st-level';
  if (level === 2) return '2nd-level';
  if (level === 3) return '3rd-level';
  return `${level}th-level`;
}

// Format components
export function formatComponents(components: Spell['components']): string {
  const parts: string[] = [];
  if (components.verbal) parts.push('V');
  if (components.somatic) parts.push('S');
  if (components.material) parts.push('M');
  return parts.join(', ');
}

// Get rarity color for spell level
export function getLevelColor(level: number): string {
  if (level === 0) return 'text-gray-400';
  if (level <= 3) return 'text-green-400';
  if (level <= 6) return 'text-blue-400';
  return 'text-purple-400';
}

export function getLevelBgColor(level: number): string {
  if (level === 0) return 'bg-gray-500/20';
  if (level <= 3) return 'bg-green-500/20';
  if (level <= 6) return 'bg-blue-500/20';
  return 'bg-purple-500/20';
}

// Spell filtering
export interface SpellFilters {
  name?: string;
  level?: number[];
  school?: SpellSchool[];
  class?: string[];
  concentration?: boolean;
  ritual?: boolean;
  components?: {
    verbal?: boolean;
    somatic?: boolean;
    material?: boolean;
  };
}

export function filterSpells(spells: Spell[], filters: SpellFilters): Spell[] {
  return spells.filter((spell) => {
    // Name filter
    if (filters.name && !spell.name.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }

    // Level filter
    if (filters.level && filters.level.length > 0 && !filters.level.includes(spell.level)) {
      return false;
    }

    // School filter
    if (filters.school && filters.school.length > 0 && !filters.school.includes(spell.school)) {
      return false;
    }

    // Class filter
    if (filters.class && filters.class.length > 0) {
      const hasClass = filters.class.some((cls) =>
        spell.classes.some((spellClass) =>
          spellClass.toLowerCase().includes(cls.toLowerCase())
        )
      );
      if (!hasClass) return false;
    }

    // Concentration filter
    if (filters.concentration !== undefined && spell.concentration !== filters.concentration) {
      return false;
    }

    // Ritual filter
    if (filters.ritual !== undefined && spell.ritual !== filters.ritual) {
      return false;
    }

    // Component filters
    if (filters.components) {
      if (
        filters.components.verbal !== undefined &&
        spell.components.verbal !== filters.components.verbal
      ) {
        return false;
      }
      if (
        filters.components.somatic !== undefined &&
        spell.components.somatic !== filters.components.somatic
      ) {
        return false;
      }
      if (
        filters.components.material !== undefined &&
        spell.components.material !== filters.components.material
      ) {
        return false;
      }
    }

    return true;
  });
}

// Sort spells
export type SpellSortOption = 'name' | 'level' | 'school';

export function sortSpells(spells: Spell[], sortBy: SpellSortOption): Spell[] {
  const sorted = [...spells];

  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'level':
      return sorted.sort((a, b) => {
        if (a.level === b.level) return a.name.localeCompare(b.name);
        return a.level - b.level;
      });
    case 'school':
      return sorted.sort((a, b) => {
        if (a.school === b.school) return a.name.localeCompare(b.name);
        return a.school.localeCompare(b.school);
      });
    default:
      return sorted;
  }
}
