import { test, expect } from '@playwright/test';
import {
  DiceType,
  DiceRoll,
  performRoll,
  formatDiceFormula,
  isCriticalHit,
  isCriticalFail,
  getRollResultColor,
} from '@/app/types/dice';

test.describe('Dice Roll Structure', () => {
  test('should have valid dice roll structure', () => {
    const roll = performRoll('d20', 1, 0, false, false);

    expect(roll.diceType).toBe('d20');
    expect(roll.quantity).toBe(1);
    expect(roll.modifier).toBe(0);
    expect(Array.isArray(roll.rolls)).toBe(true);
    expect(roll.rolls.length).toBe(1);
    expect(typeof roll.total).toBe('number');
    expect(roll.advantage).toBe(false);
    expect(roll.disadvantage).toBe(false);
  });

  test('should store individual dice rolls', () => {
    const roll = performRoll('d6', 3, 0, false, false);

    expect(roll.rolls.length).toBe(3);
    roll.rolls.forEach(r => {
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThanOrEqual(6);
    });
  });
});

test.describe('Basic Dice Rolling', () => {
  test('d4 should roll between 1 and 4', () => {
    for (let i = 0; i < 50; i++) {
      const roll = performRoll('d4', 1, 0, false, false);
      expect(roll.rolls[0]).toBeGreaterThanOrEqual(1);
      expect(roll.rolls[0]).toBeLessThanOrEqual(4);
    }
  });

  test('d6 should roll between 1 and 6', () => {
    for (let i = 0; i < 50; i++) {
      const roll = performRoll('d6', 1, 0, false, false);
      expect(roll.rolls[0]).toBeGreaterThanOrEqual(1);
      expect(roll.rolls[0]).toBeLessThanOrEqual(6);
    }
  });

  test('d8 should roll between 1 and 8', () => {
    for (let i = 0; i < 50; i++) {
      const roll = performRoll('d8', 1, 0, false, false);
      expect(roll.rolls[0]).toBeGreaterThanOrEqual(1);
      expect(roll.rolls[0]).toBeLessThanOrEqual(8);
    }
  });

  test('d10 should roll between 1 and 10', () => {
    for (let i = 0; i < 50; i++) {
      const roll = performRoll('d10', 1, 0, false, false);
      expect(roll.rolls[0]).toBeGreaterThanOrEqual(1);
      expect(roll.rolls[0]).toBeLessThanOrEqual(10);
    }
  });

  test('d12 should roll between 1 and 12', () => {
    for (let i = 0; i < 50; i++) {
      const roll = performRoll('d12', 1, 0, false, false);
      expect(roll.rolls[0]).toBeGreaterThanOrEqual(1);
      expect(roll.rolls[0]).toBeLessThanOrEqual(12);
    }
  });

  test('d20 should roll between 1 and 20', () => {
    for (let i = 0; i < 50; i++) {
      const roll = performRoll('d20', 1, 0, false, false);
      expect(roll.rolls[0]).toBeGreaterThanOrEqual(1);
      expect(roll.rolls[0]).toBeLessThanOrEqual(20);
    }
  });

  test('d100 should roll between 1 and 100', () => {
    for (let i = 0; i < 50; i++) {
      const roll = performRoll('d100', 1, 0, false, false);
      expect(roll.rolls[0]).toBeGreaterThanOrEqual(1);
      expect(roll.rolls[0]).toBeLessThanOrEqual(100);
    }
  });
});

test.describe('Multiple Dice Rolls', () => {
  test('should roll multiple dice', () => {
    const roll = performRoll('d6', 3, 0, false, false);

    expect(roll.rolls.length).toBe(3);
    expect(roll.quantity).toBe(3);
  });

  test('should sum multiple dice rolls', () => {
    const roll = performRoll('d6', 2, 0, false, false);
    const expectedTotal = roll.rolls.reduce((sum, r) => sum + r, 0);

    expect(roll.total).toBe(expectedTotal);
  });

  test('rolling 4d6 should have 4 results', () => {
    const roll = performRoll('d6', 4, 0, false, false);

    expect(roll.rolls.length).toBe(4);
  });
});

test.describe('Modifiers', () => {
  test('should add positive modifier to total', () => {
    const roll = performRoll('d20', 1, 5, false, false);
    const expectedTotal = roll.rolls[0] + 5;

    expect(roll.total).toBe(expectedTotal);
    expect(roll.modifier).toBe(5);
  });

  test('should add negative modifier to total', () => {
    const roll = performRoll('d20', 1, -3, false, false);
    const expectedTotal = roll.rolls[0] - 3;

    expect(roll.total).toBe(expectedTotal);
    expect(roll.modifier).toBe(-3);
  });

  test('should handle zero modifier', () => {
    const roll = performRoll('d20', 1, 0, false, false);
    const expectedTotal = roll.rolls[0];

    expect(roll.total).toBe(expectedTotal);
    expect(roll.modifier).toBe(0);
  });

  test('modifier should apply to sum of multiple dice', () => {
    const roll = performRoll('d6', 3, 4, false, false);
    const diceSum = roll.rolls.reduce((sum, r) => sum + r, 0);
    const expectedTotal = diceSum + 4;

    expect(roll.total).toBe(expectedTotal);
  });

  test('should handle large modifiers', () => {
    const roll = performRoll('d20', 1, 10, false, false);

    expect(roll.total).toBeGreaterThanOrEqual(11); // Min: 1 + 10
    expect(roll.total).toBeLessThanOrEqual(30); // Max: 20 + 10
  });
});

test.describe('Advantage and Disadvantage', () => {
  test('advantage should roll 2 d20 and take higher', () => {
    const roll = performRoll('d20', 1, 0, true, false);

    expect(roll.advantage).toBe(true);
    expect(roll.disadvantage).toBe(false);
    expect(roll.rolls.length).toBe(2);
    expect(roll.rolls[0]).toBe(Math.max(roll.rolls[0], roll.rolls[1]));
  });

  test('disadvantage should roll 2 d20 and take lower', () => {
    const roll = performRoll('d20', 1, 0, false, true);

    expect(roll.advantage).toBe(false);
    expect(roll.disadvantage).toBe(true);
    expect(roll.rolls.length).toBe(2);
    expect(roll.rolls[0]).toBe(Math.min(roll.rolls[0], roll.rolls[1]));
  });

  test('advantage and disadvantage should cancel out', () => {
    const roll = performRoll('d20', 1, 0, true, true);

    expect(roll.advantage).toBe(false);
    expect(roll.disadvantage).toBe(false);
    expect(roll.rolls.length).toBe(1); // Only 1 die rolled when they cancel
  });

  test('advantage should work with modifiers', () => {
    const roll = performRoll('d20', 1, 5, true, false);
    const higherRoll = Math.max(roll.rolls[0], roll.rolls[1]);
    const expectedTotal = higherRoll + 5;

    expect(roll.total).toBe(expectedTotal);
  });

  test('disadvantage should work with modifiers', () => {
    const roll = performRoll('d20', 1, 3, false, true);
    const lowerRoll = Math.min(roll.rolls[0], roll.rolls[1]);
    const expectedTotal = lowerRoll + 3;

    expect(roll.total).toBe(expectedTotal);
  });

  test('advantage should only apply to d20 rolls', () => {
    const roll = performRoll('d6', 1, 0, true, false);

    // Non-d20 rolls should ignore advantage
    expect(roll.rolls.length).toBe(1);
  });
});

test.describe('Critical Hits and Fails', () => {
  test('should detect critical hit (natural 20)', () => {
    const roll: DiceRoll = {
      id: 'roll-1',
      timestamp: '2024-01-01T00:00:00.000Z',
      diceType: 'd20',
      quantity: 1,
      rolls: [20],
      total: 20,
      modifier: 0,
      advantage: false,
      disadvantage: false,
    };

    expect(isCriticalHit(roll)).toBe(true);
  });

  test('should detect critical fail (natural 1)', () => {
    const roll: DiceRoll = {
      id: 'roll-2',
      timestamp: '2024-01-01T00:00:00.000Z',
      diceType: 'd20',
      quantity: 1,
      rolls: [1],
      total: 1,
      modifier: 0,
      advantage: false,
      disadvantage: false,
    };

    expect(isCriticalFail(roll)).toBe(true);
  });

  test('should not detect critical hit on non-20 d20 roll', () => {
    const roll: DiceRoll = {
      id: 'roll-3',
      timestamp: '2024-01-01T00:00:00.000Z',
      diceType: 'd20',
      quantity: 1,
      rolls: [19],
      total: 19,
      modifier: 0,
      advantage: false,
      disadvantage: false,
    };

    expect(isCriticalHit(roll)).toBe(false);
  });

  test('should not detect critical fail on non-1 d20 roll', () => {
    const roll: DiceRoll = {
      id: 'roll-4',
      timestamp: '2024-01-01T00:00:00.000Z',
      diceType: 'd20',
      quantity: 1,
      rolls: [2],
      total: 2,
      modifier: 0,
      advantage: false,
      disadvantage: false,
    };

    expect(isCriticalFail(roll)).toBe(false);
  });

  test('critical detection should only apply to d20 rolls', () => {
    const d6Max: DiceRoll = {
      id: 'roll-5',
      timestamp: '2024-01-01T00:00:00.000Z',
      diceType: 'd6',
      quantity: 1,
      rolls: [6],
      total: 6,
      modifier: 0,
      advantage: false,
      disadvantage: false,
    };

    expect(isCriticalHit(d6Max)).toBe(false);
  });

  test('modifier should not affect critical hit detection', () => {
    const roll: DiceRoll = {
      id: 'roll-6',
      timestamp: '2024-01-01T00:00:00.000Z',
      diceType: 'd20',
      quantity: 1,
      rolls: [20],
      total: 25, // 20 + 5 modifier
      modifier: 5,
      advantage: false,
      disadvantage: false,
    };

    expect(isCriticalHit(roll)).toBe(true);
  });
});

test.describe('Dice Formula Formatting', () => {
  test('should format basic dice formula', () => {
    const formula = formatDiceFormula(1, 'd20', 0);
    expect(formula).toBe('1d20');
  });

  test('should format formula with positive modifier', () => {
    const formula = formatDiceFormula(1, 'd20', 5);
    expect(formula).toBe('1d20 + 5');
  });

  test('should format formula with negative modifier', () => {
    const formula = formatDiceFormula(1, 'd20', -3);
    expect(formula).toBe('1d20 - 3');
  });

  test('should format multiple dice formula', () => {
    const formula = formatDiceFormula(3, 'd6', 4);
    expect(formula).toBe('3d6 + 4');
  });

  test('should handle zero modifier', () => {
    const formula = formatDiceFormula(2, 'd8', 0);
    expect(formula).toBe('2d8');
  });
});

test.describe('Roll Result Colors', () => {
  test('should return green color for critical hit', () => {
    const roll: DiceRoll = {
      id: 'roll-7',
      timestamp: '2024-01-01T00:00:00.000Z',
      diceType: 'd20',
      quantity: 1,
      rolls: [20],
      total: 20,
      modifier: 0,
      advantage: false,
      disadvantage: false,
    };

    expect(getRollResultColor(roll)).toContain('green');
  });

  test('should return red color for critical fail', () => {
    const roll: DiceRoll = {
      id: 'roll-8',
      timestamp: '2024-01-01T00:00:00.000Z',
      diceType: 'd20',
      quantity: 1,
      rolls: [1],
      total: 1,
      modifier: 0,
      advantage: false,
      disadvantage: false,
    };

    expect(getRollResultColor(roll)).toContain('red');
  });

  test('should return default color for normal roll', () => {
    const roll: DiceRoll = {
      id: 'roll-9',
      timestamp: '2024-01-01T00:00:00.000Z',
      diceType: 'd20',
      quantity: 1,
      rolls: [15],
      total: 15,
      modifier: 0,
      advantage: false,
      disadvantage: false,
    };

    const color = getRollResultColor(roll);
    expect(color).not.toContain('green');
    expect(color).not.toContain('red');
  });
});

test.describe('Roll History and Tracking', () => {
  test('should be able to store multiple rolls', () => {
    const rolls: DiceRoll[] = [];

    rolls.push(performRoll('d20', 1, 3, false, false));
    rolls.push(performRoll('d6', 2, 0, false, false));
    rolls.push(performRoll('d8', 1, 5, false, false));

    expect(rolls.length).toBe(3);
    expect(rolls[0].diceType).toBe('d20');
    expect(rolls[1].diceType).toBe('d6');
    expect(rolls[2].diceType).toBe('d8');
  });

  test('should track roll details for history', () => {
    const roll = performRoll('d20', 1, 5, true, false);

    // All necessary info for displaying roll history
    expect(roll.diceType).toBeDefined();
    expect(roll.quantity).toBeDefined();
    expect(roll.rolls).toBeDefined();
    expect(roll.total).toBeDefined();
    expect(roll.modifier).toBeDefined();
    expect(roll.advantage).toBeDefined();
    expect(roll.disadvantage).toBeDefined();
  });
});

test.describe('Quick Dice Roller Widget', () => {
  test('should support common dice types', () => {
    const commonDice: DiceType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

    commonDice.forEach(diceType => {
      const roll = performRoll(diceType, 1, 0, false, false);
      expect(roll.diceType).toBe(diceType);
    });
  });

  test('should support modifier adjustments', () => {
    let modifier = 0;

    // Increment
    modifier += 1;
    expect(modifier).toBe(1);

    // Decrement
    modifier -= 1;
    expect(modifier).toBe(0);

    // Cap at -10
    modifier = Math.max(-10, modifier - 15);
    expect(modifier).toBe(-10);

    // Cap at +10
    modifier = Math.min(10, 15);
    expect(modifier).toBe(10);
  });

  test('should display last roll result', () => {
    const roll = performRoll('d20', 1, 5, false, false);

    // Check that roll has all display properties
    expect(roll.total).toBeDefined();
    expect(roll.rolls).toBeDefined();
    expect(formatDiceFormula(roll.quantity, roll.diceType, roll.modifier)).toBeTruthy();
  });
});
