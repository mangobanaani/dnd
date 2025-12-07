import {
  applyDamage,
  healCombatant,
  createDefaultCombatant,
  Combatant,
} from '@/app/types/combat';

describe('Combat Damage and Healing', () => {
  let combatant: Combatant;

  beforeEach(() => {
    combatant = {
      ...createDefaultCombatant('Test Fighter', 'player'),
      id: 'test-1',
      currentHitPoints: 50,
      maxHitPoints: 50,
      temporaryHitPoints: 0,
      ac: 15,
      initiative: 10,
      initiativeModifier: 2,
    };
  });

  describe('applyDamage', () => {
    describe('basic damage', () => {
      it('should reduce current HP by damage amount', () => {
        const result = applyDamage(combatant, 10);

        expect(result.currentHitPoints).toBe(40);
        expect(result.maxHitPoints).toBe(50);
      });

      it('should handle damage exceeding current HP', () => {
        const result = applyDamage(combatant, 100);

        expect(result.currentHitPoints).toBe(0);
      });

      it('should not go below 0 HP', () => {
        combatant.currentHitPoints = 5;
        const result = applyDamage(combatant, 10);

        expect(result.currentHitPoints).toBe(0);
      });

      it('should handle 0 damage', () => {
        const result = applyDamage(combatant, 0);

        expect(result.currentHitPoints).toBe(50);
      });

      it('should not mutate original combatant', () => {
        const originalHp = combatant.currentHitPoints;
        applyDamage(combatant, 10);

        expect(combatant.currentHitPoints).toBe(originalHp);
      });
    });

    describe('temporary HP', () => {
      it('should apply damage to temporary HP first', () => {
        combatant.temporaryHitPoints = 10;
        const result = applyDamage(combatant, 5);

        expect(result.temporaryHitPoints).toBe(5);
        expect(result.currentHitPoints).toBe(50);
      });

      it('should remove all temp HP if damage equals temp HP', () => {
        combatant.temporaryHitPoints = 10;
        const result = applyDamage(combatant, 10);

        expect(result.temporaryHitPoints).toBe(0);
        expect(result.currentHitPoints).toBe(50);
      });

      it('should overflow to current HP when temp HP is depleted', () => {
        combatant.temporaryHitPoints = 5;
        const result = applyDamage(combatant, 15);

        expect(result.temporaryHitPoints).toBe(0);
        expect(result.currentHitPoints).toBe(40);
      });

      it('should handle large damage with temp HP', () => {
        combatant.temporaryHitPoints = 10;
        combatant.currentHitPoints = 20;
        const result = applyDamage(combatant, 50);

        expect(result.temporaryHitPoints).toBe(0);
        expect(result.currentHitPoints).toBe(0);
      });

      it('should not affect temp HP if damage is 0', () => {
        combatant.temporaryHitPoints = 10;
        const result = applyDamage(combatant, 0);

        expect(result.temporaryHitPoints).toBe(10);
        expect(result.currentHitPoints).toBe(50);
      });
    });

    describe('edge cases', () => {
      it('should handle combatant already at 0 HP', () => {
        combatant.currentHitPoints = 0;
        const result = applyDamage(combatant, 10);

        expect(result.currentHitPoints).toBe(0);
      });

      it('should handle 1 HP remaining', () => {
        combatant.currentHitPoints = 1;
        const result = applyDamage(combatant, 1);

        expect(result.currentHitPoints).toBe(0);
      });

      it('should preserve other combatant properties', () => {
        const result = applyDamage(combatant, 10);

        expect(result.id).toBe(combatant.id);
        expect(result.name).toBe(combatant.name);
        expect(result.maxHitPoints).toBe(combatant.maxHitPoints);
        expect(result.ac).toBe(combatant.ac);
      });
    });
  });

  describe('healCombatant', () => {
    describe('basic healing', () => {
      it('should increase current HP by healing amount', () => {
        combatant.currentHitPoints = 30;
        const result = healCombatant(combatant, 10);

        expect(result.currentHitPoints).toBe(40);
      });

      it('should not exceed max HP', () => {
        combatant.currentHitPoints = 45;
        const result = healCombatant(combatant, 10);

        expect(result.currentHitPoints).toBe(50);
      });

      it('should handle healing from 0 HP', () => {
        combatant.currentHitPoints = 0;
        const result = healCombatant(combatant, 10);

        expect(result.currentHitPoints).toBe(10);
      });

      it('should handle 0 healing', () => {
        combatant.currentHitPoints = 30;
        const result = healCombatant(combatant, 0);

        expect(result.currentHitPoints).toBe(30);
      });

      it('should handle healing to exactly max HP', () => {
        combatant.currentHitPoints = 40;
        const result = healCombatant(combatant, 10);

        expect(result.currentHitPoints).toBe(50);
      });

      it('should not mutate original combatant', () => {
        combatant.currentHitPoints = 30;
        const originalHp = combatant.currentHitPoints;
        healCombatant(combatant, 10);

        expect(combatant.currentHitPoints).toBe(originalHp);
      });
    });

    describe('overheal prevention', () => {
      it('should cap at max HP with large healing', () => {
        combatant.currentHitPoints = 10;
        const result = healCombatant(combatant, 1000);

        expect(result.currentHitPoints).toBe(50);
      });

      it('should cap at max HP from any starting point', () => {
        combatant.currentHitPoints = 1;
        const result = healCombatant(combatant, 100);

        expect(result.currentHitPoints).toBe(50);
      });
    });

    describe('edge cases', () => {
      it('should handle combatant at full HP', () => {
        combatant.currentHitPoints = 50;
        const result = healCombatant(combatant, 10);

        expect(result.currentHitPoints).toBe(50);
      });

      it('should handle 1 HP healing', () => {
        combatant.currentHitPoints = 30;
        const result = healCombatant(combatant, 1);

        expect(result.currentHitPoints).toBe(31);
      });

      it('should preserve other combatant properties', () => {
        combatant.currentHitPoints = 30;
        const result = healCombatant(combatant, 10);

        expect(result.id).toBe(combatant.id);
        expect(result.name).toBe(combatant.name);
        expect(result.maxHitPoints).toBe(combatant.maxHitPoints);
        expect(result.ac).toBe(combatant.ac);
        expect(result.temporaryHitPoints).toBe(combatant.temporaryHitPoints);
      });
    });
  });

  describe('Combined Damage and Healing Scenarios', () => {
    it('should handle damage then heal', () => {
      let result = applyDamage(combatant, 20);
      expect(result.currentHitPoints).toBe(30);

      result = healCombatant(result, 10);
      expect(result.currentHitPoints).toBe(40);
    });

    it('should handle heal then damage', () => {
      combatant.currentHitPoints = 30;
      let result = healCombatant(combatant, 15);
      expect(result.currentHitPoints).toBe(45);

      result = applyDamage(result, 10);
      expect(result.currentHitPoints).toBe(35);
    });

    it('should handle multiple damage applications', () => {
      let result = applyDamage(combatant, 10);
      result = applyDamage(result, 10);
      result = applyDamage(result, 10);

      expect(result.currentHitPoints).toBe(20);
    });

    it('should handle multiple healing applications', () => {
      combatant.currentHitPoints = 10;
      let result = healCombatant(combatant, 10);
      result = healCombatant(result, 10);
      result = healCombatant(result, 10);

      expect(result.currentHitPoints).toBe(40);
    });

    it('should handle damage with temp HP then healing', () => {
      combatant.temporaryHitPoints = 10;
      let result = applyDamage(combatant, 15);
      expect(result.currentHitPoints).toBe(45);
      expect(result.temporaryHitPoints).toBe(0);

      result = healCombatant(result, 5);
      expect(result.currentHitPoints).toBe(50);
      expect(result.temporaryHitPoints).toBe(0);
    });

    it('should handle being knocked to 0 HP and healed back up', () => {
      let result = applyDamage(combatant, 100);
      expect(result.currentHitPoints).toBe(0);

      result = healCombatant(result, 20);
      expect(result.currentHitPoints).toBe(20);
    });
  });
});
