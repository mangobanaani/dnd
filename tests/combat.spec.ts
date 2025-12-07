import { test, expect } from '@playwright/test';
import {
  Combatant,
  rollInitiative,
  sortCombatantsByInitiative,
  getHpPercentage,
  getHpColor,
  getHpTextColor,
  isDead,
  isBloodied,
  applyDamage,
  healCombatant,
  addCondition,
  removeCondition,
  decrementConditionDurations,
  createDefaultCombatant,
  CONDITION_DESCRIPTIONS,
  initializeDeathSaves,
  addDeathSaveSuccess,
  addDeathSaveFailure,
  resetDeathSaves,
  isStable,
  isPermanentlyDead,
} from '@/app/types/combat';
import { testCombatants, testCombatEncounter, testConditions } from './fixtures/test-data';

test.describe('Combat Structure Tests', () => {
  test('should have valid combatant structure', () => {
    const combatant = testCombatants[0];

    expect(combatant.id).toBeDefined();
    expect(combatant.name).toBeTruthy();
    expect(['player', 'monster', 'npc']).toContain(combatant.type);
    expect(combatant.initiative).toBeGreaterThanOrEqual(0);
    expect(combatant.maxHitPoints).toBeGreaterThan(0);
    expect(combatant.ac).toBeGreaterThan(0);
    expect(Array.isArray(combatant.conditions)).toBe(true);
  });

  test('should have valid encounter structure', () => {
    const encounter = testCombatEncounter;

    expect(encounter.id).toBeDefined();
    expect(encounter.name).toBeTruthy();
    expect(Array.isArray(encounter.combatants)).toBe(true);
    expect(encounter.currentRound).toBeGreaterThanOrEqual(1);
    expect(encounter.currentTurn).toBeGreaterThanOrEqual(0);
    expect(typeof encounter.isActive).toBe('boolean');
    expect(Array.isArray(encounter.log)).toBe(true);
  });
});

test.describe('Initiative System', () => {
  test('should roll initiative within valid range', () => {
    for (let i = 0; i < 100; i++) {
      const roll = rollInitiative(0);
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(20);
    }
  });

  test('should add modifier to initiative roll', () => {
    const rolls = [];
    for (let i = 0; i < 20; i++) {
      rolls.push(rollInitiative(5));
    }

    // All rolls should be at least 6 (1 + 5)
    rolls.forEach(roll => {
      expect(roll).toBeGreaterThanOrEqual(6);
      expect(roll).toBeLessThanOrEqual(25);
    });
  });

  test('should sort combatants by initiative descending', () => {
    const sorted = sortCombatantsByInitiative(testCombatants);

    expect(sorted[0].initiative).toBeGreaterThanOrEqual(sorted[1].initiative);
    expect(sorted[1].initiative).toBeGreaterThanOrEqual(sorted[2].initiative);
  });

  test('should use initiative modifier as tiebreaker', () => {
    const combatants: Combatant[] = [
      { ...testCombatants[0], initiative: 15, initiativeModifier: 2 },
      { ...testCombatants[1], initiative: 15, initiativeModifier: 4 },
    ];

    const sorted = sortCombatantsByInitiative(combatants);

    expect(sorted[0].initiativeModifier).toBe(4);
    expect(sorted[1].initiativeModifier).toBe(2);
  });
});

test.describe('Hit Points', () => {
  test('should calculate HP percentage correctly', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      maxHitPoints: 100,
      currentHitPoints: 75,
    };

    expect(getHpPercentage(combatant)).toBe(75);
  });

  test('should get HP color based on percentage', () => {
    expect(getHpColor(100)).toBe('bg-green-500');
    expect(getHpColor(70)).toBe('bg-green-500');
    expect(getHpColor(50)).toBe('bg-yellow-500');
    expect(getHpColor(35)).toBe('bg-yellow-500');
    expect(getHpColor(20)).toBe('bg-red-500');
    expect(getHpColor(1)).toBe('bg-red-500');
    expect(getHpColor(0)).toBe('bg-gray-500');
  });

  test('should get HP text color based on percentage', () => {
    expect(getHpTextColor(100)).toBe('text-green-400');
    expect(getHpTextColor(50)).toBe('text-yellow-400');
    expect(getHpTextColor(20)).toBe('text-red-400');
    expect(getHpTextColor(0)).toBe('text-gray-400');
  });

  test('should detect dead combatants', () => {
    const aliveCombatant = { ...testCombatants[0], currentHitPoints: 10 };
    const deadCombatant = { ...testCombatants[0], currentHitPoints: 0 };

    expect(isDead(aliveCombatant)).toBe(false);
    expect(isDead(deadCombatant)).toBe(true);
  });

  test('should detect bloodied combatants', () => {
    const healthyCombatant = { ...testCombatants[0], maxHitPoints: 100, currentHitPoints: 60 };
    const bloodiedCombatant = { ...testCombatants[0], maxHitPoints: 100, currentHitPoints: 40 };

    expect(isBloodied(healthyCombatant)).toBe(false);
    expect(isBloodied(bloodiedCombatant)).toBe(true);
  });
});

test.describe('Damage and Healing', () => {
  test('should apply damage to current HP', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      maxHitPoints: 30,
      currentHitPoints: 30,
      temporaryHitPoints: 0,
    };

    const damaged = applyDamage(combatant, 10);

    expect(damaged.currentHitPoints).toBe(20);
    expect(damaged.temporaryHitPoints).toBe(0);
  });

  test('should apply damage to temporary HP first', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      maxHitPoints: 30,
      currentHitPoints: 30,
      temporaryHitPoints: 5,
    };

    const damaged = applyDamage(combatant, 3);

    expect(damaged.currentHitPoints).toBe(30);
    expect(damaged.temporaryHitPoints).toBe(2);
  });

  test('should overflow damage from temp HP to current HP', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      maxHitPoints: 30,
      currentHitPoints: 30,
      temporaryHitPoints: 5,
    };

    const damaged = applyDamage(combatant, 10);

    expect(damaged.currentHitPoints).toBe(25);
    expect(damaged.temporaryHitPoints).toBe(0);
  });

  test('should not reduce HP below 0', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      maxHitPoints: 30,
      currentHitPoints: 10,
      temporaryHitPoints: 0,
    };

    const damaged = applyDamage(combatant, 20);

    expect(damaged.currentHitPoints).toBe(0);
  });

  test('should heal combatant', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      maxHitPoints: 30,
      currentHitPoints: 15,
      temporaryHitPoints: 0,
    };

    const healed = healCombatant(combatant, 10);

    expect(healed.currentHitPoints).toBe(25);
  });

  test('should not heal above max HP', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      maxHitPoints: 30,
      currentHitPoints: 25,
      temporaryHitPoints: 0,
    };

    const healed = healCombatant(combatant, 10);

    expect(healed.currentHitPoints).toBe(30);
  });
});

test.describe('Conditions', () => {
  test('should have valid condition structure', () => {
    const condition = testConditions[0];

    expect(condition.name).toBeTruthy();
    expect(condition.description).toBeTruthy();
    expect(typeof condition.duration).toBe('number');
  });

  test('should add condition to combatant', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      conditions: [],
    };

    const withCondition = addCondition(combatant, testConditions[0]);

    expect(withCondition.conditions.length).toBe(1);
    expect(withCondition.conditions[0].name).toBe(testConditions[0].name);
  });

  test('should not add duplicate conditions', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      conditions: [testConditions[0]],
    };

    const withCondition = addCondition(combatant, testConditions[0]);

    expect(withCondition.conditions.length).toBe(1);
  });

  test('should remove condition from combatant', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      conditions: [testConditions[0]],
    };

    const withoutCondition = removeCondition(combatant, testConditions[0].name);

    expect(withoutCondition.conditions.length).toBe(0);
  });

  test('should decrement condition durations', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      conditions: [{ ...testConditions[0], duration: 3 }],
    };

    const decremented = decrementConditionDurations(combatant);

    expect(decremented.conditions[0].duration).toBe(2);
  });

  test('should remove expired conditions', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      conditions: [{ ...testConditions[0], duration: 1 }],
    };

    const decremented = decrementConditionDurations(combatant);

    expect(decremented.conditions.length).toBe(0);
  });

  test('should not decrement permanent conditions', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      conditions: [{ ...testConditions[1], duration: -1 }],
    };

    const decremented = decrementConditionDurations(combatant);

    expect(decremented.conditions.length).toBe(1);
    expect(decremented.conditions[0].duration).toBe(-1);
  });

  test('should have descriptions for all D&D conditions', () => {
    const conditions = [
      'Blinded', 'Charmed', 'Deafened', 'Exhausted', 'Frightened',
      'Grappled', 'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified',
      'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious'
    ];

    conditions.forEach(condition => {
      expect(CONDITION_DESCRIPTIONS[condition as keyof typeof CONDITION_DESCRIPTIONS]).toBeTruthy();
    });
  });
});

test.describe('Combat Encounter Management', () => {
  test('should track combat rounds', () => {
    const encounter = testCombatEncounter;

    expect(encounter.currentRound).toBeGreaterThanOrEqual(1);
  });

  test('should track current turn', () => {
    const encounter = testCombatEncounter;

    expect(encounter.currentTurn).toBeGreaterThanOrEqual(0);
    expect(encounter.currentTurn).toBeLessThan(encounter.combatants.length);
  });

  test('should maintain combat log', () => {
    const encounter = testCombatEncounter;

    expect(encounter.log.length).toBeGreaterThan(0);

    encounter.log.forEach(entry => {
      expect(entry.id).toBeDefined();
      expect(entry.round).toBeGreaterThanOrEqual(1);
      expect(['damage', 'heal', 'condition', 'death', 'initiative', 'other']).toContain(entry.type);
      expect(entry.combatantName).toBeTruthy();
      expect(entry.message).toBeTruthy();
    });
  });

  test('should link encounter to campaign', () => {
    const encounter = testCombatEncounter;

    expect(encounter.campaignId).toBe('campaign-1');
  });
});

test.describe('Combatant Types', () => {
  test('should have players, monsters, and NPCs', () => {
    const playerCount = testCombatants.filter(c => c.type === 'player').length;
    const monsterCount = testCombatants.filter(c => c.type === 'monster').length;

    expect(playerCount).toBe(3);
    expect(monsterCount).toBe(2);
  });

  test('players should link to character IDs', () => {
    const players = testCombatants.filter(c => c.type === 'player');

    players.forEach(player => {
      expect(player.characterId).toBeDefined();
    });
  });

  test('should create default combatant', () => {
    const combatant = createDefaultCombatant('Test Monster', 'monster');

    expect(combatant.name).toBe('Test Monster');
    expect(combatant.type).toBe('monster');
    expect(combatant.maxHitPoints).toBe(10);
    expect(combatant.currentHitPoints).toBe(10);
    expect(combatant.ac).toBe(10);
    expect(combatant.initiative).toBe(0);
    expect(combatant.conditions).toEqual([]);
  });
});

test.describe('Combat Integration', () => {
  test('should integrate characters into combat', () => {
    const playerCombatants = testCombatants.filter(c => c.type === 'player');

    playerCombatants.forEach(combatant => {
      expect(combatant.characterId).toBeTruthy();
    });
  });

  test('player HP should match character HP at start', () => {
    const thorgrim = testCombatants[0];
    expect(thorgrim.maxHitPoints).toBe(28);
  });

  test('should track conditions affecting combat', () => {
    const poisonedGoblin = testCombatants[4];

    expect(poisonedGoblin.conditions.length).toBeGreaterThan(0);
    expect(poisonedGoblin.conditions[0].name).toBe('Poisoned');
  });

  test('sorted combatants should have rogue first (highest initiative)', () => {
    const sorted = sortCombatantsByInitiative(testCombatants);

    expect(sorted[0].name).toBe('Zephyr Swiftfoot');
    expect(sorted[0].initiative).toBe(22);
  });
});

test.describe('Death Saves System', () => {
  test('should initialize death saves with 0 successes and 0 failures', () => {
    const deathSaves = initializeDeathSaves();

    expect(deathSaves.successes).toBe(0);
    expect(deathSaves.failures).toBe(0);
  });

  test('should add death save success', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      currentHitPoints: 0,
      deathSaves: { successes: 0, failures: 0 },
    };

    const updated = addDeathSaveSuccess(combatant);

    expect(updated.deathSaves?.successes).toBe(1);
    expect(updated.deathSaves?.failures).toBe(0);
  });

  test('should add multiple death save successes', () => {
    let combatant: Combatant = {
      ...testCombatants[0],
      currentHitPoints: 0,
      deathSaves: { successes: 0, failures: 0 },
    };

    combatant = addDeathSaveSuccess(combatant);
    combatant = addDeathSaveSuccess(combatant);

    expect(combatant.deathSaves?.successes).toBe(2);
  });

  test('should cap death save successes at 3', () => {
    let combatant: Combatant = {
      ...testCombatants[0],
      currentHitPoints: 0,
      deathSaves: { successes: 0, failures: 0 },
    };

    combatant = addDeathSaveSuccess(combatant);
    combatant = addDeathSaveSuccess(combatant);
    combatant = addDeathSaveSuccess(combatant);
    combatant = addDeathSaveSuccess(combatant); // Should not go above 3

    expect(combatant.deathSaves?.successes).toBe(3);
  });

  test('should add death save failure', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      currentHitPoints: 0,
      deathSaves: { successes: 0, failures: 0 },
    };

    const updated = addDeathSaveFailure(combatant);

    expect(updated.deathSaves?.failures).toBe(1);
    expect(updated.deathSaves?.successes).toBe(0);
  });

  test('should add multiple death save failures', () => {
    let combatant: Combatant = {
      ...testCombatants[0],
      currentHitPoints: 0,
      deathSaves: { successes: 0, failures: 0 },
    };

    combatant = addDeathSaveFailure(combatant);
    combatant = addDeathSaveFailure(combatant);

    expect(combatant.deathSaves?.failures).toBe(2);
  });

  test('should cap death save failures at 3', () => {
    let combatant: Combatant = {
      ...testCombatants[0],
      currentHitPoints: 0,
      deathSaves: { successes: 0, failures: 0 },
    };

    combatant = addDeathSaveFailure(combatant);
    combatant = addDeathSaveFailure(combatant);
    combatant = addDeathSaveFailure(combatant);
    combatant = addDeathSaveFailure(combatant); // Should not go above 3

    expect(combatant.deathSaves?.failures).toBe(3);
  });

  test('should reset death saves', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      currentHitPoints: 10,
      deathSaves: { successes: 2, failures: 1 },
    };

    const updated = resetDeathSaves(combatant);

    expect(updated.deathSaves).toBeUndefined();
  });

  test('should detect stable combatant (3 successes)', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      currentHitPoints: 0,
      deathSaves: { successes: 3, failures: 0 },
    };

    expect(isStable(combatant)).toBe(true);
  });

  test('should detect not stable combatant (less than 3 successes)', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      currentHitPoints: 0,
      deathSaves: { successes: 2, failures: 1 },
    };

    expect(isStable(combatant)).toBe(false);
  });

  test('should detect stable if no death saves (above 0 HP)', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      currentHitPoints: 10,
    };

    expect(isStable(combatant)).toBe(true);
  });

  test('should detect permanently dead combatant (3 failures)', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      currentHitPoints: 0,
      deathSaves: { successes: 0, failures: 3 },
    };

    expect(isPermanentlyDead(combatant)).toBe(true);
  });

  test('should detect not permanently dead combatant (less than 3 failures)', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      currentHitPoints: 0,
      deathSaves: { successes: 1, failures: 2 },
    };

    expect(isPermanentlyDead(combatant)).toBe(false);
  });

  test('should not be permanently dead if no death saves (above 0 HP)', () => {
    const combatant: Combatant = {
      ...testCombatants[0],
      currentHitPoints: 10,
    };

    expect(isPermanentlyDead(combatant)).toBe(false);
  });

  test('death saves should not affect monsters', () => {
    const monster: Combatant = {
      ...testCombatants[3],
      type: 'monster',
      currentHitPoints: 0,
    };

    // Monsters don't typically use death saves, but if they do, functions should work
    const withSaves = { ...monster, deathSaves: initializeDeathSaves() };
    const updated = addDeathSaveSuccess(withSaves);

    expect(updated.deathSaves?.successes).toBe(1);
  });

  test('should track mixed successes and failures', () => {
    let combatant: Combatant = {
      ...testCombatants[0],
      currentHitPoints: 0,
      deathSaves: { successes: 0, failures: 0 },
    };

    combatant = addDeathSaveSuccess(combatant);
    combatant = addDeathSaveFailure(combatant);
    combatant = addDeathSaveSuccess(combatant);
    combatant = addDeathSaveFailure(combatant);

    expect(combatant.deathSaves?.successes).toBe(2);
    expect(combatant.deathSaves?.failures).toBe(2);
  });
});
