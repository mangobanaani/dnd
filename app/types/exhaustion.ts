/**
 * Exhaustion System Types
 * D&D 5e exhaustion mechanics (6 levels with cumulative effects)
 */

/**
 * Exhaustion level (0-6)
 * - 0: No exhaustion
 * - 1: Disadvantage on ability checks
 * - 2: Speed halved
 * - 3: Disadvantage on attack rolls and saving throws
 * - 4: Hit point maximum halved
 * - 5: Speed reduced to 0
 * - 6: Death
 */
export type ExhaustionLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Effect of a single exhaustion level
 */
export interface ExhaustionEffect {
  level: number;
  description: string;
  disadvantageOn?: string[];
  speedMultiplier?: number;
  hpMaxMultiplier?: number;
  isDeath?: boolean;
}

/**
 * Aggregated penalties from current exhaustion level
 */
export interface ExhaustionPenalties {
  disadvantageOn: string[];
  speedMultiplier: number;
  hpMaxMultiplier: number;
  isDeath: boolean;
}

/**
 * D&D 5e exhaustion effects by level
 */
const EXHAUSTION_EFFECTS: Record<ExhaustionLevel, ExhaustionEffect | null> = {
  0: null,
  1: {
    level: 1,
    description: 'Disadvantage on ability checks',
    disadvantageOn: ['ability-checks'],
  },
  2: {
    level: 2,
    description: 'Speed halved',
    speedMultiplier: 0.5,
  },
  3: {
    level: 3,
    description: 'Disadvantage on attack rolls and saving throws',
    disadvantageOn: ['attacks', 'saves'],
  },
  4: {
    level: 4,
    description: 'Hit point maximum halved',
    hpMaxMultiplier: 0.5,
  },
  5: {
    level: 5,
    description: 'Speed reduced to 0',
    speedMultiplier: 0,
  },
  6: {
    level: 6,
    description: 'Death',
    isDeath: true,
  },
};

/**
 * Validate exhaustion level is within valid range
 */
export function validateExhaustionLevel(level: number): void {
  if (!Number.isInteger(level)) {
    throw new Error('Exhaustion level must be an integer');
  }

  if (level < 0 || level > 6) {
    throw new Error('Exhaustion level must be between 0 and 6');
  }
}

/**
 * Get all active exhaustion effects for a given level (cumulative)
 */
export function getExhaustionEffects(level: ExhaustionLevel): ExhaustionEffect[] {
  const effects: ExhaustionEffect[] = [];

  for (let i = 1; i <= level; i++) {
    const effect = EXHAUSTION_EFFECTS[i as ExhaustionLevel];
    if (effect) {
      effects.push(effect);
    }
  }

  return effects;
}

/**
 * Get aggregated penalties from exhaustion level
 */
export function getExhaustionPenalties(level: ExhaustionLevel): ExhaustionPenalties {
  const effects = getExhaustionEffects(level);

  const disadvantageOn: string[] = [];
  let speedMultiplier = 1;
  let hpMaxMultiplier = 1;
  let isDeath = false;

  for (const effect of effects) {
    if (effect.disadvantageOn) {
      disadvantageOn.push(...effect.disadvantageOn);
    }

    if (effect.speedMultiplier !== undefined) {
      speedMultiplier = Math.min(speedMultiplier, effect.speedMultiplier);
    }

    if (effect.hpMaxMultiplier !== undefined) {
      hpMaxMultiplier = Math.min(hpMaxMultiplier, effect.hpMaxMultiplier);
    }

    if (effect.isDeath) {
      isDeath = true;
    }
  }

  return {
    disadvantageOn,
    speedMultiplier,
    hpMaxMultiplier,
    isDeath,
  };
}

/**
 * Check if exhaustion can be increased from current level
 */
export function canIncreaseExhaustion(currentLevel: number): boolean {
  try {
    validateExhaustionLevel(currentLevel);
    return currentLevel < 6;
  } catch {
    return false;
  }
}

/**
 * Check if exhaustion can be decreased from current level
 */
export function canDecreaseExhaustion(currentLevel: number): boolean {
  try {
    validateExhaustionLevel(currentLevel);
    return currentLevel > 0;
  } catch {
    return false;
  }
}
