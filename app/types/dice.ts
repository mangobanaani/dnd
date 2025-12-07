// D&D Dice Roller Types and Utilities

export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export interface DiceRoll {
  id: string;
  timestamp: string;

  // Roll configuration
  diceType: DiceType;
  quantity: number;
  modifier: number;

  // Advantage/Disadvantage
  advantage: boolean;
  disadvantage: boolean;

  // Results
  rolls: number[];
  total: number;

  // Context
  label?: string;
  category?: 'attack' | 'damage' | 'check' | 'save' | 'custom';
}

export interface DiceFormula {
  quantity: number;
  diceType: DiceType;
  modifier: number;
}

// Dice Colors for UI
export const DICE_COLORS: Record<DiceType, string> = {
  'd4': 'from-purple-500 to-purple-700',
  'd6': 'from-blue-500 to-blue-700',
  'd8': 'from-green-500 to-green-700',
  'd10': 'from-yellow-500 to-yellow-700',
  'd12': 'from-orange-500 to-orange-700',
  'd20': 'from-red-500 to-red-700',
  'd100': 'from-pink-500 to-pink-700',
};

// Dice Icons/Display
export const DICE_ICONS: Record<DiceType, string> = {
  'd4': '△',
  'd6': '⚅',
  'd8': '◇',
  'd10': '⬟',
  'd12': '⬢',
  'd20': '🎲',
  'd100': '💯',
};

// Utility Functions

/**
 * Roll a single die
 */
export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll multiple dice
 */
export function rollDice(quantity: number, sides: number): number[] {
  return Array.from({ length: quantity }, () => rollDie(sides));
}

/**
 * Get dice sides from type
 */
export function getDiceSides(diceType: DiceType): number {
  switch (diceType) {
    case 'd4': return 4;
    case 'd6': return 6;
    case 'd8': return 8;
    case 'd10': return 10;
    case 'd12': return 12;
    case 'd20': return 20;
    case 'd100': return 100;
    default: return 20;
  }
}

/**
 * Parse dice formula string (e.g., "2d6+3")
 */
export function parseDiceFormula(formula: string): DiceFormula | null {
  const match = formula.match(/^(\d+)d(\d+)([+-]\d+)?$/i);

  if (!match) return null;

  const quantity = parseInt(match[1]);
  const sides = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;

  // Validate dice type
  const validSides = [4, 6, 8, 10, 12, 20, 100];
  if (!validSides.includes(sides)) return null;

  return {
    quantity,
    diceType: `d${sides}` as DiceType,
    modifier,
  };
}

/**
 * Format dice formula for display
 */
export function formatDiceFormula(quantity: number, diceType: DiceType, modifier: number): string {
  let formula = `${quantity}${diceType}`;
  if (modifier !== 0) {
    formula += modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
  }
  return formula;
}

/**
 * Perform a complete dice roll
 */
export function performRoll(
  diceType: DiceType,
  quantity: number = 1,
  modifier: number = 0,
  advantage: boolean = false,
  disadvantage: boolean = false,
  label?: string,
  category?: DiceRoll['category']
): DiceRoll {
  const sides = getDiceSides(diceType);

  let rolls: number[];

  let advantageDisadvantageApplied = false;

  // Handle advantage/disadvantage for d20
  if (diceType === 'd20' && quantity === 1 && (advantage || disadvantage)) {
    const roll1 = rollDie(20);
    const roll2 = rollDie(20);

    if (advantage && disadvantage) {
      // They cancel out - just use one roll
      rolls = [roll1];
      advantage = false;
      disadvantage = false;
    } else if (advantage) {
      rolls = [Math.max(roll1, roll2), Math.min(roll1, roll2)];
      advantageDisadvantageApplied = true;
    } else {
      rolls = [Math.min(roll1, roll2), Math.max(roll1, roll2)];
      advantageDisadvantageApplied = true;
    }
  } else {
    rolls = rollDice(quantity, sides);
  }

  // For advantage/disadvantage, only count the first roll (the selected one)
  const total = advantageDisadvantageApplied
    ? rolls[0] + modifier
    : rolls.reduce((sum, roll) => sum + roll, 0) + modifier;

  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    diceType,
    quantity,
    modifier,
    advantage,
    disadvantage,
    rolls,
    total,
    label,
    category,
  };
}

/**
 * Check if roll is a critical hit (nat 20)
 */
export function isCriticalHit(roll: DiceRoll): boolean {
  return roll.diceType === 'd20' && roll.quantity === 1 && roll.rolls[0] === 20;
}

/**
 * Check if roll is a critical fail (nat 1)
 */
export function isCriticalFail(roll: DiceRoll): boolean {
  return roll.diceType === 'd20' && roll.quantity === 1 && roll.rolls[0] === 1;
}

/**
 * Get roll result color based on d20 outcome
 */
export function getRollResultColor(roll: DiceRoll): string {
  if (isCriticalHit(roll)) return 'text-green-400';
  if (isCriticalFail(roll)) return 'text-red-400';
  if (roll.advantage) return 'text-blue-400';
  if (roll.disadvantage) return 'text-orange-400';
  return 'text-[#fafafa]';
}

/**
 * Get roll background color
 */
export function getRollResultBg(roll: DiceRoll): string {
  if (isCriticalHit(roll)) return 'bg-green-500/20 border-green-500/50';
  if (isCriticalFail(roll)) return 'bg-red-500/20 border-red-500/50';
  if (roll.advantage) return 'bg-blue-500/20 border-blue-500/50';
  if (roll.disadvantage) return 'bg-orange-500/20 border-orange-500/50';
  return 'bg-[#27272a] border-[#27272a]';
}

/**
 * Format roll for display
 */
export function formatRollDisplay(roll: DiceRoll): string {
  const formula = formatDiceFormula(roll.quantity, roll.diceType, roll.modifier);
  const rollsDisplay = roll.rolls.join(', ');

  let result = `${formula}: [${rollsDisplay}]`;

  if (roll.modifier !== 0) {
    const modifierSign = roll.modifier > 0 ? '+' : '';
    result += ` ${modifierSign}${roll.modifier}`;
  }

  result += ` = ${roll.total}`;

  if (roll.advantage) result += ' (Advantage)';
  if (roll.disadvantage) result += ' (Disadvantage)';

  return result;
}

/**
 * Format roll for short display
 */
export function formatRollShort(roll: DiceRoll): string {
  const formula = formatDiceFormula(roll.quantity, roll.diceType, roll.modifier);
  return `${formula} = ${roll.total}`;
}

/**
 * Get category color
 */
export function getCategoryColor(category?: DiceRoll['category']): string {
  switch (category) {
    case 'attack': return 'text-red-400';
    case 'damage': return 'text-orange-400';
    case 'check': return 'text-blue-400';
    case 'save': return 'text-purple-400';
    case 'custom': return 'text-green-400';
    default: return 'text-gray-400';
  }
}

/**
 * Get category badge color
 */
export function getCategoryBadgeColor(category?: DiceRoll['category']): string {
  switch (category) {
    case 'attack': return 'bg-red-500/20 text-red-400';
    case 'damage': return 'bg-orange-500/20 text-orange-400';
    case 'check': return 'bg-blue-500/20 text-blue-400';
    case 'save': return 'bg-purple-500/20 text-purple-400';
    case 'custom': return 'bg-green-500/20 text-green-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
}

/**
 * Quick roll presets
 */
export const QUICK_ROLLS = {
  'Attack': { quantity: 1, diceType: 'd20' as DiceType, modifier: 0, category: 'attack' as const },
  'Damage (Longsword)': { quantity: 1, diceType: 'd8' as DiceType, modifier: 0, category: 'damage' as const },
  'Damage (Greatsword)': { quantity: 2, diceType: 'd6' as DiceType, modifier: 0, category: 'damage' as const },
  'Fireball': { quantity: 8, diceType: 'd6' as DiceType, modifier: 0, category: 'damage' as const },
  'Healing Potion': { quantity: 2, diceType: 'd4' as DiceType, modifier: 2, category: 'custom' as const },
  'Ability Check': { quantity: 1, diceType: 'd20' as DiceType, modifier: 0, category: 'check' as const },
  'Saving Throw': { quantity: 1, diceType: 'd20' as DiceType, modifier: 0, category: 'save' as const },
};

/**
 * Format timestamp for display
 */
export function formatRollTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Calculate average roll value
 */
export function calculateAverageRoll(quantity: number, diceType: DiceType, modifier: number): number {
  const sides = getDiceSides(diceType);
  const avgDie = (sides + 1) / 2;
  return quantity * avgDie + modifier;
}
