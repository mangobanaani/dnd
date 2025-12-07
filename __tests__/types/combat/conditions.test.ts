import {
  addCondition,
  removeCondition,
  decrementConditionDurations,
  createDefaultCombatant,
  Combatant,
  Condition,
} from '@/app/types/combat';

describe('Condition Management', () => {
  let combatant: Combatant;
  let poisonedCondition: Condition;
  let blindedCondition: Condition;
  let stunnedCondition: Condition;

  beforeEach(() => {
    combatant = {
      ...createDefaultCombatant('Test Warrior', 'player'),
      id: 'test-1',
      currentHitPoints: 50,
      maxHitPoints: 50,
      ac: 15,
      initiative: 10,
      initiativeModifier: 2,
      conditions: [],
    };

    poisonedCondition = {
      name: 'Poisoned',
      description: 'Disadvantage on attack rolls and ability checks',
      duration: 3,
      source: 'Poison Dart',
    };

    blindedCondition = {
      name: 'Blinded',
      description: 'Cannot see, auto-fail sight checks',
      duration: 2,
      source: 'Blindness Spell',
    };

    stunnedCondition = {
      name: 'Stunned',
      description: 'Incapacitated, cannot move',
      duration: -1, // Permanent until removed
      source: 'Monk Ability',
    };
  });

  describe('addCondition', () => {
    it('should add a condition to empty conditions array', () => {
      const result = addCondition(combatant, poisonedCondition);

      expect(result.conditions).toHaveLength(1);
      expect(result.conditions[0]).toEqual(poisonedCondition);
    });

    it('should add multiple different conditions', () => {
      let result = addCondition(combatant, poisonedCondition);
      result = addCondition(result, blindedCondition);

      expect(result.conditions).toHaveLength(2);
      expect(result.conditions).toContainEqual(poisonedCondition);
      expect(result.conditions).toContainEqual(blindedCondition);
    });

    it('should not add duplicate conditions', () => {
      let result = addCondition(combatant, poisonedCondition);
      result = addCondition(result, poisonedCondition);

      expect(result.conditions).toHaveLength(1);
    });

    it('should not add condition with same name but different properties', () => {
      const firstPoison: Condition = {
        name: 'Poisoned',
        description: 'Poisoned effect',
        duration: 3,
        source: 'Source A',
      };
      const secondPoison: Condition = {
        name: 'Poisoned',
        description: 'Poisoned effect',
        duration: 5,
        source: 'Source B',
      };

      let result = addCondition(combatant, firstPoison);
      result = addCondition(result, secondPoison);

      expect(result.conditions).toHaveLength(1);
      expect(result.conditions[0]).toEqual(firstPoison);
    });

    it('should add permanent condition (duration -1)', () => {
      const result = addCondition(combatant, stunnedCondition);

      expect(result.conditions).toHaveLength(1);
      expect(result.conditions[0].duration).toBe(-1);
    });

    it('should not mutate original combatant', () => {
      const originalLength = combatant.conditions.length;
      addCondition(combatant, poisonedCondition);

      expect(combatant.conditions).toHaveLength(originalLength);
    });

    it('should preserve other combatant properties', () => {
      const result = addCondition(combatant, poisonedCondition);

      expect(result.id).toBe(combatant.id);
      expect(result.name).toBe(combatant.name);
      expect(result.currentHitPoints).toBe(combatant.currentHitPoints);
    });
  });

  describe('removeCondition', () => {
    beforeEach(() => {
      combatant.conditions = [poisonedCondition, blindedCondition, stunnedCondition];
    });

    it('should remove condition by name', () => {
      const result = removeCondition(combatant, 'Poisoned');

      expect(result.conditions).toHaveLength(2);
      expect(result.conditions.find(c => c.name === 'Poisoned')).toBeUndefined();
    });

    it('should keep other conditions when removing one', () => {
      const result = removeCondition(combatant, 'Poisoned');

      expect(result.conditions).toContainEqual(blindedCondition);
      expect(result.conditions).toContainEqual(stunnedCondition);
    });

    it('should handle removing non-existent condition', () => {
      const result = removeCondition(combatant, 'Confused');

      expect(result.conditions).toHaveLength(3);
    });

    it('should remove all conditions with same name', () => {
      combatant.conditions = [poisonedCondition, poisonedCondition, blindedCondition];
      const result = removeCondition(combatant, 'Poisoned');

      expect(result.conditions).toHaveLength(1);
      expect(result.conditions[0].name).toBe('Blinded');
    });

    it('should handle removing from empty conditions array', () => {
      combatant.conditions = [];
      const result = removeCondition(combatant, 'Poisoned');

      expect(result.conditions).toHaveLength(0);
    });

    it('should remove last remaining condition', () => {
      combatant.conditions = [poisonedCondition];
      const result = removeCondition(combatant, 'Poisoned');

      expect(result.conditions).toHaveLength(0);
    });

    it('should not mutate original combatant', () => {
      const originalLength = combatant.conditions.length;
      removeCondition(combatant, 'Poisoned');

      expect(combatant.conditions).toHaveLength(originalLength);
    });

    it('should preserve other combatant properties', () => {
      const result = removeCondition(combatant, 'Poisoned');

      expect(result.id).toBe(combatant.id);
      expect(result.name).toBe(combatant.name);
      expect(result.currentHitPoints).toBe(combatant.currentHitPoints);
    });
  });

  describe('decrementConditionDurations', () => {
    it('should decrement positive durations by 1', () => {
      combatant.conditions = [
        { name: 'Poisoned', description: 'Poisoned', duration: 3, source: 'Dart' },
        { name: 'Blinded', description: 'Blinded', duration: 2, source: 'Spell' },
      ];

      const result = decrementConditionDurations(combatant);

      expect(result.conditions[0].duration).toBe(2);
      expect(result.conditions[1].duration).toBe(1);
    });

    it('should remove conditions that reach 0 duration', () => {
      combatant.conditions = [
        { name: 'Poisoned', description: 'Poisoned', duration: 1, source: 'Dart' },
        { name: 'Blinded', description: 'Blinded', duration: 2, source: 'Spell' },
      ];

      const result = decrementConditionDurations(combatant);

      expect(result.conditions).toHaveLength(1);
      expect(result.conditions[0].name).toBe('Blinded');
      expect(result.conditions[0].duration).toBe(1);
    });

    it('should not decrement permanent conditions (duration -1)', () => {
      combatant.conditions = [stunnedCondition];

      const result = decrementConditionDurations(combatant);

      expect(result.conditions).toHaveLength(1);
      expect(result.conditions[0].duration).toBe(-1);
    });

    it('should handle mixed duration types', () => {
      combatant.conditions = [
        { name: 'Poisoned', duration: 2, source: 'Dart' },
        { name: 'Stunned', duration: -1, source: 'Ability' },
        { name: 'Blinded', duration: 1, source: 'Spell' },
      ];

      const result = decrementConditionDurations(combatant);

      expect(result.conditions).toHaveLength(2);
      expect(result.conditions[0].name).toBe('Poisoned');
      expect(result.conditions[0].duration).toBe(1);
      expect(result.conditions[1].name).toBe('Stunned');
      expect(result.conditions[1].duration).toBe(-1);
    });

    it('should remove multiple conditions that reach 0', () => {
      combatant.conditions = [
        { name: 'Poisoned', duration: 1, source: 'A' },
        { name: 'Blinded', duration: 1, source: 'B' },
        { name: 'Stunned', duration: 2, source: 'C' },
      ];

      const result = decrementConditionDurations(combatant);

      expect(result.conditions).toHaveLength(1);
      expect(result.conditions[0].name).toBe('Stunned');
      expect(result.conditions[0].duration).toBe(1);
    });

    it('should handle empty conditions array', () => {
      combatant.conditions = [];
      const result = decrementConditionDurations(combatant);

      expect(result.conditions).toHaveLength(0);
    });

    it('should clear all conditions if all reach 0', () => {
      combatant.conditions = [
        { name: 'Poisoned', duration: 1, source: 'A' },
        { name: 'Blinded', duration: 1, source: 'B' },
      ];

      const result = decrementConditionDurations(combatant);

      expect(result.conditions).toHaveLength(0);
    });

    it('should not mutate original combatant', () => {
      combatant.conditions = [{ name: 'Poisoned', duration: 3, source: 'Dart' }];
      const originalDuration = combatant.conditions[0].duration;

      decrementConditionDurations(combatant);

      expect(combatant.conditions[0].duration).toBe(originalDuration);
    });

    it('should not mutate original conditions array', () => {
      const originalConditions = [{ name: 'Poisoned', duration: 3, source: 'Dart' }];
      combatant.conditions = originalConditions;

      decrementConditionDurations(combatant);

      expect(originalConditions[0].duration).toBe(3);
    });

    it('should preserve other combatant properties', () => {
      combatant.conditions = [poisonedCondition];
      const result = decrementConditionDurations(combatant);

      expect(result.id).toBe(combatant.id);
      expect(result.name).toBe(combatant.name);
      expect(result.currentHitPoints).toBe(combatant.currentHitPoints);
    });
  });

  describe('Combined Condition Scenarios', () => {
    it('should add, decrement, and remove conditions in sequence', () => {
      let result = addCondition(combatant, { name: 'Poisoned', description: 'Poisoned', duration: 2, source: 'A' });
      expect(result.conditions).toHaveLength(1);

      result = decrementConditionDurations(result);
      expect(result.conditions[0].duration).toBe(1);

      result = decrementConditionDurations(result);
      expect(result.conditions).toHaveLength(0);
    });

    it('should handle adding condition after decrementing', () => {
      combatant.conditions = [{ name: 'Poisoned', duration: 1, source: 'A' }];
      let result = decrementConditionDurations(combatant);

      result = addCondition(result, blindedCondition);

      expect(result.conditions).toHaveLength(1);
      expect(result.conditions[0].name).toBe('Blinded');
    });

    it('should handle removing then adding same condition', () => {
      combatant.conditions = [poisonedCondition];
      let result = removeCondition(combatant, 'Poisoned');

      const newPoison: Condition = {
        name: 'Poisoned',
        duration: 5,
        source: 'New Source',
      };
      result = addCondition(result, newPoison);

      expect(result.conditions).toHaveLength(1);
      expect(result.conditions[0].duration).toBe(5);
      expect(result.conditions[0].source).toBe('New Source');
    });
  });
});
