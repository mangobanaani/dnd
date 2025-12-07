/**
 * D&D 5e XP Thresholds per Character Level
 * Source: Dungeon Master's Guide p. 82
 */

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'deadly';

export interface XPThreshold {
  easy: number;
  medium: number;
  hard: number;
  deadly: number;
}

/**
 * XP thresholds for encounter difficulty per character level (1-20)
 */
export const XP_THRESHOLDS: Record<number, XPThreshold> = {
  1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
  2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
  3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
  4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
  5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
  6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
  7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
  8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
  9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
  10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
  11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
  12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
  13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
  14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
  15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
  16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
  17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
  18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
  19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
  20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
};

/**
 * Get XP threshold for a specific character level
 * @param level Character level (1-20)
 * @param fallbackLevel Fallback level if the provided level is out of range (default: 5)
 * @returns XP threshold object for the specified level
 */
export function getXPThreshold(level: number, fallbackLevel: number = 5): XPThreshold {
  return XP_THRESHOLDS[level] || XP_THRESHOLDS[fallbackLevel];
}

/**
 * Get XP threshold for a specific difficulty and level
 * @param level Character level (1-20)
 * @param difficulty Difficulty level
 * @param fallbackLevel Fallback level if the provided level is out of range (default: 5)
 * @returns XP value for the specified difficulty and level
 */
export function getXPForDifficulty(
  level: number,
  difficulty: DifficultyLevel,
  fallbackLevel: number = 5
): number {
  const threshold = getXPThreshold(level, fallbackLevel);
  return threshold[difficulty];
}

/**
 * Calculate total XP threshold for a party
 * @param partyLevel Average party level
 * @param partySize Number of party members
 * @param difficulty Difficulty level
 * @returns Total XP threshold for the party
 */
export function getPartyXPThreshold(
  partyLevel: number,
  partySize: number,
  difficulty: DifficultyLevel
): number {
  return getXPForDifficulty(partyLevel, difficulty) * partySize;
}
