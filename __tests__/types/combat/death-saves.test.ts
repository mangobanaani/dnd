import {
  initializeDeathSaves,
  addDeathSaveSuccess,
  addDeathSaveFailure,
  resetDeathSaves,
  isStable,
  isPermanentlyDead,
  createDefaultCombatant,
  Combatant,
} from '@/app/types/combat';

describe('Death Save Mechanics', () => {
  let combatant: Combatant;

  beforeEach(() => {
    combatant = {
      ...createDefaultCombatant('Test Character', 'player'),
      id: 'test-1',
      currentHp: 0,
      maxHp: 50,
      ac: 15,
      initiative: 10,
      initiativeModifier: 2,
    };
  });

  describe('initializeDeathSaves', () => {
    it('should return death saves at 0/0', () => {
      const saves = initializeDeathSaves();
      expect(saves).toEqual({ successes: 0, failures: 0 });
    });
  });

  describe('addDeathSaveSuccess', () => {
    it('should add a success to death saves', () => {
      combatant.deathSaves = initializeDeathSaves();

      const result = addDeathSaveSuccess(combatant);

      expect(result.deathSaves?.successes).toBe(1);
      expect(result.deathSaves?.failures).toBe(0);
    });

    it('should increment successes from 1 to 2', () => {
      combatant.deathSaves = { successes: 1, failures: 0 };

      const result = addDeathSaveSuccess(combatant);

      expect(result.deathSaves?.successes).toBe(2);
    });

    it('should increment successes from 2 to 3', () => {
      combatant.deathSaves = { successes: 2, failures: 0 };

      const result = addDeathSaveSuccess(combatant);

      expect(result.deathSaves?.successes).toBe(3);
    });

    it('should not exceed 3 successes', () => {
      combatant.deathSaves = { successes: 3, failures: 0 };

      const result = addDeathSaveSuccess(combatant);

      expect(result.deathSaves?.successes).toBe(3);
    });

    it('should initialize death saves if undefined', () => {
      combatant.deathSaves = undefined;

      const result = addDeathSaveSuccess(combatant);

      expect(result.deathSaves).toBeDefined();
      expect(result.deathSaves?.successes).toBe(1);
      expect(result.deathSaves?.failures).toBe(0);
    });

    it('should not modify failures', () => {
      combatant.deathSaves = { successes: 1, failures: 2 };

      const result = addDeathSaveSuccess(combatant);

      expect(result.deathSaves?.failures).toBe(2);
    });

    it('should not mutate original combatant', () => {
      combatant.deathSaves = { successes: 1, failures: 0 };
      const original = combatant.deathSaves.successes;

      addDeathSaveSuccess(combatant);

      expect(combatant.deathSaves.successes).toBe(original);
    });
  });

  describe('addDeathSaveFailure', () => {
    it('should add a failure to death saves', () => {
      combatant.deathSaves = initializeDeathSaves();

      const result = addDeathSaveFailure(combatant);

      expect(result.deathSaves?.successes).toBe(0);
      expect(result.deathSaves?.failures).toBe(1);
    });

    it('should increment failures from 1 to 2', () => {
      combatant.deathSaves = { successes: 0, failures: 1 };

      const result = addDeathSaveFailure(combatant);

      expect(result.deathSaves?.failures).toBe(2);
    });

    it('should increment failures from 2 to 3', () => {
      combatant.deathSaves = { successes: 0, failures: 2 };

      const result = addDeathSaveFailure(combatant);

      expect(result.deathSaves?.failures).toBe(3);
    });

    it('should not exceed 3 failures', () => {
      combatant.deathSaves = { successes: 0, failures: 3 };

      const result = addDeathSaveFailure(combatant);

      expect(result.deathSaves?.failures).toBe(3);
    });

    it('should initialize death saves if undefined', () => {
      combatant.deathSaves = undefined;

      const result = addDeathSaveFailure(combatant);

      expect(result.deathSaves).toBeDefined();
      expect(result.deathSaves?.successes).toBe(0);
      expect(result.deathSaves?.failures).toBe(1);
    });

    it('should not modify successes', () => {
      combatant.deathSaves = { successes: 2, failures: 1 };

      const result = addDeathSaveFailure(combatant);

      expect(result.deathSaves?.successes).toBe(2);
    });

    it('should not mutate original combatant', () => {
      combatant.deathSaves = { successes: 0, failures: 1 };
      const original = combatant.deathSaves.failures;

      addDeathSaveFailure(combatant);

      expect(combatant.deathSaves.failures).toBe(original);
    });
  });

  describe('resetDeathSaves', () => {
    it('should clear death saves', () => {
      combatant.deathSaves = { successes: 2, failures: 1 };

      const result = resetDeathSaves(combatant);

      expect(result.deathSaves).toBeUndefined();
    });

    it('should not affect other combatant properties', () => {
      combatant.deathSaves = { successes: 2, failures: 1 };

      const result = resetDeathSaves(combatant);

      expect(result.id).toBe(combatant.id);
      expect(result.name).toBe(combatant.name);
      expect(result.currentHitPoints).toBe(combatant.currentHitPoints);
    });

    it('should not mutate original combatant', () => {
      combatant.deathSaves = { successes: 2, failures: 1 };
      const original = combatant.deathSaves;

      resetDeathSaves(combatant);

      expect(combatant.deathSaves).toBe(original);
      expect(combatant.deathSaves).toBeDefined();
    });
  });

  describe('isStable', () => {
    it('should return true when HP > 0', () => {
      combatant.currentHitPoints = 1;
      combatant.deathSaves = undefined;

      expect(isStable(combatant)).toBe(true);
    });

    it('should return true when HP > 0 even with failed death saves', () => {
      combatant.currentHitPoints = 10;
      combatant.deathSaves = { successes: 0, failures: 2 };

      expect(isStable(combatant)).toBe(true);
    });

    it('should return true when HP is 0 with 3 successes', () => {
      combatant.currentHitPoints = 0;
      combatant.deathSaves = { successes: 3, failures: 0 };

      expect(isStable(combatant)).toBe(true);
    });

    it('should return false when HP is 0 with fewer than 3 successes', () => {
      combatant.currentHitPoints = 0;
      combatant.deathSaves = { successes: 2, failures: 1 };

      expect(isStable(combatant)).toBe(false);
    });

    it('should return false when HP is 0 with no death saves', () => {
      combatant.currentHitPoints = 0;
      combatant.deathSaves = undefined;

      expect(isStable(combatant)).toBe(false);
    });

    it('should return false when HP is 0 with 0 successes', () => {
      combatant.currentHitPoints = 0;
      combatant.deathSaves = { successes: 0, failures: 2 };

      expect(isStable(combatant)).toBe(false);
    });
  });

  describe('isPermanentlyDead', () => {
    it('should return false when HP > 0', () => {
      combatant.currentHitPoints = 1;
      combatant.deathSaves = { successes: 0, failures: 3 };

      expect(isPermanentlyDead(combatant)).toBe(false);
    });

    it('should return true when HP is 0 with 3 failures', () => {
      combatant.currentHitPoints = 0;
      combatant.deathSaves = { successes: 0, failures: 3 };

      expect(isPermanentlyDead(combatant)).toBe(true);
    });

    it('should return false when HP is 0 with fewer than 3 failures', () => {
      combatant.currentHitPoints = 0;
      combatant.deathSaves = { successes: 1, failures: 2 };

      expect(isPermanentlyDead(combatant)).toBe(false);
    });

    it('should return false when HP is 0 with no death saves', () => {
      combatant.currentHitPoints = 0;
      combatant.deathSaves = undefined;

      expect(isPermanentlyDead(combatant)).toBe(false);
    });

    it('should return false when HP is 0 with 0 failures', () => {
      combatant.currentHitPoints = 0;
      combatant.deathSaves = { successes: 2, failures: 0 };

      expect(isPermanentlyDead(combatant)).toBe(false);
    });

    it('should return false even with 3 failures if HP > 0', () => {
      combatant.currentHitPoints = 50;
      combatant.deathSaves = { successes: 0, failures: 3 };

      expect(isPermanentlyDead(combatant)).toBe(false);
    });
  });

  describe('Death Save Edge Cases', () => {
    it('should handle character going from stable to unstable', () => {
      combatant.currentHitPoints = 0;
      combatant.deathSaves = { successes: 3, failures: 0 };

      expect(isStable(combatant)).toBe(true);

      const afterDamage = addDeathSaveFailure(combatant);
      expect(isStable(afterDamage)).toBe(true); // Still stable with 3 successes
    });

    it('should handle character at exactly 0 HP', () => {
      combatant.currentHitPoints = 0;
      combatant.deathSaves = initializeDeathSaves();

      expect(isStable(combatant)).toBe(false);
      expect(isPermanentlyDead(combatant)).toBe(false);
    });

    it('should handle character with mixed saves', () => {
      combatant.currentHitPoints = 0;
      combatant.deathSaves = { successes: 2, failures: 2 };

      expect(isStable(combatant)).toBe(false);
      expect(isPermanentlyDead(combatant)).toBe(false);
    });
  });
});
