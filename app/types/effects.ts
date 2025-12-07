/**
 * Effect System Type Definitions
 * Tracks buffs, debuffs, conditions, and other active effects
 */

export type EffectSource = 'player' | 'dm' | 'system';
export type DurationType = 'rounds' | 'saves' | 'time' | 'permanent';
export type Ability = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';
export type SaveTiming = 'start' | 'end';
export type EffectType = 'spell' | 'item' | 'feature' | 'condition';

export interface SaveRequirement {
  ability: Ability;
  dc: number;
  timing: SaveTiming;
}

export interface EffectMechanics {
  advantageOn?: string[];
  disadvantageOn?: string[];
  bonuses?: Array<{ type: string; value: string }>;
  damagePerRound?: { amount: number; type: string; timing?: 'start' | 'end' };
  requiresConcentration?: boolean;
  temporaryHitPoints?: number;
}

export interface Effect {
  id: string;
  name: string;
  icon: string;
  description: string;
  source: EffectSource;
  appliedBy: string;
  appliedTo: string;

  effectType: EffectType;
  durationType: DurationType;
  roundsRemaining?: number;
  saveRequired?: SaveRequirement;
  timeExpiry?: string;

  mechanics: EffectMechanics;
  createdAt: string;
}

export interface Concentration {
  spell: string;
  effectIds: string[];
}

/**
 * Create a new effect with defaults
 */
export function createEffect(params: {
  name: string;
  appliedBy: string;
  appliedTo: string;
  durationType: DurationType;
  icon?: string;
  description?: string;
  source?: EffectSource;
  effectType?: EffectType;
  roundsRemaining?: number;
  saveRequired?: SaveRequirement;
  timeExpiry?: string;
  mechanics?: Partial<EffectMechanics>;
}): Effect {
  return {
    id: crypto.randomUUID(),
    name: params.name,
    icon: params.icon || '✨',
    description: params.description || '',
    source: params.source || 'player',
    appliedBy: params.appliedBy,
    appliedTo: params.appliedTo,
    effectType: params.effectType || 'spell',
    durationType: params.durationType,
    roundsRemaining: params.roundsRemaining,
    saveRequired: params.saveRequired,
    timeExpiry: params.timeExpiry,
    mechanics: {
      advantageOn: params.mechanics?.advantageOn,
      disadvantageOn: params.mechanics?.disadvantageOn,
      bonuses: params.mechanics?.bonuses,
      damagePerRound: params.mechanics?.damagePerRound,
      requiresConcentration: params.mechanics?.requiresConcentration,
      temporaryHitPoints: params.mechanics?.temporaryHitPoints,
    },
    createdAt: new Date().toISOString(),
  };
}

/**
 * Validate an effect has all required fields
 */
export function validateEffect(effect: Effect): void {
  if (!effect.name || effect.name.trim() === '') {
    throw new Error('Effect name is required');
  }

  if (!effect.appliedBy || effect.appliedBy.trim() === '') {
    throw new Error('appliedBy is required');
  }

  if (!effect.appliedTo || effect.appliedTo.trim() === '') {
    throw new Error('appliedTo is required');
  }

  // Validate duration-specific requirements
  if (effect.durationType === 'rounds') {
    if (effect.roundsRemaining === undefined || effect.roundsRemaining === null) {
      throw new Error('roundsRemaining is required for round-based effects');
    }
    if (effect.roundsRemaining < 0) {
      throw new Error('roundsRemaining must be positive');
    }
  }

  if (effect.durationType === 'saves') {
    if (!effect.saveRequired) {
      throw new Error('saveRequired is required for save-based effects');
    }
    if (effect.saveRequired.dc < 1 || effect.saveRequired.dc > 30) {
      throw new Error('Save DC must be between 1 and 30');
    }
  }

  if (effect.durationType === 'time') {
    if (!effect.timeExpiry) {
      throw new Error('timeExpiry is required for time-based effects');
    }
  }
}

/**
 * Type guards for effect duration types
 */
export function isRoundBasedEffect(effect: Effect): boolean {
  return effect.durationType === 'rounds';
}

export function isSaveBasedEffect(effect: Effect): boolean {
  return effect.durationType === 'saves';
}

export function isTimeBasedEffect(effect: Effect): boolean {
  return effect.durationType === 'time';
}

/**
 * Create concentration tracking
 */
export function createConcentration(spell: string, effectIds: string[]): Concentration {
  if (!spell || spell.trim() === '') {
    throw new Error('Spell name is required');
  }

  if (!effectIds || effectIds.length === 0) {
    throw new Error('At least one effect is required');
  }

  return {
    spell,
    effectIds,
  };
}
