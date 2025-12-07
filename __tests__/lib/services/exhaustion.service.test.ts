/**
 * Exhaustion Service Tests
 * Tests for managing exhaustion on characters and combatants
 */

import { ExhaustionService } from '@/app/lib/services/exhaustion.service';
import { createDefaultCharacter } from '@/app/lib/factories/character.factory';
import { createCombatantFromCharacter } from '@/app/lib/factories/combatant.factory';
import { ExhaustionLevel } from '@/app/types/exhaustion';

describe('ExhaustionService', () => {
  let service: ExhaustionService;

  beforeEach(() => {
    service = new ExhaustionService();
  });

  describe('addExhaustion', () => {
    it('should increase exhaustion level by 1', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 0;

      const updated = service.addExhaustion(character);

      expect(updated.exhaustionLevel).toBe(1);
    });

    it('should handle multiple levels of exhaustion', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 3;

      const updated = service.addExhaustion(character, 2);

      expect(updated.exhaustionLevel).toBe(5);
    });

    it('should cap at level 6', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 5;

      const updated = service.addExhaustion(character, 3);

      expect(updated.exhaustionLevel).toBe(6);
    });

    it('should not exceed level 6 when already at 6', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 6;

      const updated = service.addExhaustion(character);

      expect(updated.exhaustionLevel).toBe(6);
    });

    it('should work with combatants', () => {
      const character = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(character, 15);
      combatant.exhaustionLevel = 2;

      const updated = service.addExhaustion(combatant);

      expect(updated.exhaustionLevel).toBe(3);
    });
  });

  describe('removeExhaustion', () => {
    it('should decrease exhaustion level by 1', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 3;

      const updated = service.removeExhaustion(character);

      expect(updated.exhaustionLevel).toBe(2);
    });

    it('should handle multiple levels', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 5;

      const updated = service.removeExhaustion(character, 3);

      expect(updated.exhaustionLevel).toBe(2);
    });

    it('should not go below 0', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 1;

      const updated = service.removeExhaustion(character, 3);

      expect(updated.exhaustionLevel).toBe(0);
    });

    it('should not change when already at 0', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 0;

      const updated = service.removeExhaustion(character);

      expect(updated.exhaustionLevel).toBe(0);
    });
  });

  describe('setExhaustion', () => {
    it('should set exhaustion to specific level', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 0;

      const updated = service.setExhaustion(character, 4);

      expect(updated.exhaustionLevel).toBe(4);
    });

    it('should allow setting to 0', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 3;

      const updated = service.setExhaustion(character, 0);

      expect(updated.exhaustionLevel).toBe(0);
    });

    it('should reject invalid levels', () => {
      const character = createDefaultCharacter('user-1');

      expect(() => service.setExhaustion(character, -1 as ExhaustionLevel)).toThrow();
      expect(() => service.setExhaustion(character, 7 as ExhaustionLevel)).toThrow();
    });
  });

  describe('getPenalties', () => {
    it('should return penalties for current exhaustion level', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 3;

      const penalties = service.getPenalties(character);

      expect(penalties.disadvantageOn).toContain('ability-checks');
      expect(penalties.disadvantageOn).toContain('attacks');
      expect(penalties.disadvantageOn).toContain('saves');
      expect(penalties.speedMultiplier).toBe(0.5);
    });

    it('should return no penalties for level 0', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 0;

      const penalties = service.getPenalties(character);

      expect(penalties.disadvantageOn).toHaveLength(0);
      expect(penalties.speedMultiplier).toBe(1);
      expect(penalties.hpMaxMultiplier).toBe(1);
    });

    it('should return death penalty for level 6', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 6;

      const penalties = service.getPenalties(character);

      expect(penalties.isDeath).toBe(true);
    });
  });

  describe('isDead', () => {
    it('should return true at exhaustion level 6', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 6;

      expect(service.isDead(character)).toBe(true);
    });

    it('should return false below level 6', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 5;

      expect(service.isDead(character)).toBe(false);
    });

    it('should return false at level 0', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 0;

      expect(service.isDead(character)).toBe(false);
    });
  });

  describe('applyLongRest', () => {
    it('should reduce exhaustion by 1 on long rest', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 3;

      const updated = service.applyLongRest(character);

      expect(updated.exhaustionLevel).toBe(2);
    });

    it('should not reduce below 0', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 0;

      const updated = service.applyLongRest(character);

      expect(updated.exhaustionLevel).toBe(0);
    });

    it('should reduce from level 6', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 6;

      const updated = service.applyLongRest(character);

      expect(updated.exhaustionLevel).toBe(5);
    });
  });

  describe('hasDisadvantageOn', () => {
    it('should check if character has disadvantage on specific action', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 1;

      expect(service.hasDisadvantageOn(character, 'ability-checks')).toBe(true);
      expect(service.hasDisadvantageOn(character, 'attacks')).toBe(false);
    });

    it('should return false at level 0', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 0;

      expect(service.hasDisadvantageOn(character, 'ability-checks')).toBe(false);
    });

    it('should check multiple disadvantages at level 3', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 3;

      expect(service.hasDisadvantageOn(character, 'ability-checks')).toBe(true);
      expect(service.hasDisadvantageOn(character, 'attacks')).toBe(true);
      expect(service.hasDisadvantageOn(character, 'saves')).toBe(true);
    });
  });

  describe('getModifiedSpeed', () => {
    it('should return full speed at level 0', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 0;

      const speed = service.getModifiedSpeed(character, 30);

      expect(speed).toBe(30);
    });

    it('should return half speed at level 2', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 2;

      const speed = service.getModifiedSpeed(character, 30);

      expect(speed).toBe(15);
    });

    it('should return 0 speed at level 5', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 5;

      const speed = service.getModifiedSpeed(character, 30);

      expect(speed).toBe(0);
    });

    it('should handle different base speeds', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 2;

      expect(service.getModifiedSpeed(character, 40)).toBe(20);
      expect(service.getModifiedSpeed(character, 25)).toBe(12.5);
    });
  });

  describe('getModifiedHPMax', () => {
    it('should return full HP max below level 4', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 3;
      character.maxHitPoints = 50;

      const hpMax = service.getModifiedHPMax(character);

      expect(hpMax).toBe(50);
    });

    it('should return half HP max at level 4', () => {
      const character = createDefaultCharacter('user-1');
      character.exhaustionLevel = 4;
      character.maxHitPoints = 50;

      const hpMax = service.getModifiedHPMax(character);

      expect(hpMax).toBe(25);
    });

    it('should maintain half HP max at levels 5-6', () => {
      const character = createDefaultCharacter('user-1');
      character.maxHitPoints = 60;

      character.exhaustionLevel = 5;
      expect(service.getModifiedHPMax(character)).toBe(30);

      character.exhaustionLevel = 6;
      expect(service.getModifiedHPMax(character)).toBe(30);
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined exhaustion level', () => {
      const character = createDefaultCharacter('user-1');
      delete (character as any).exhaustionLevel;

      const updated = service.addExhaustion(character);

      expect(updated.exhaustionLevel).toBe(1);
    });

    it('should preserve other character properties', () => {
      const character = createDefaultCharacter('user-1');
      character.name = 'Test Character';
      character.maxHitPoints = 50;
      character.exhaustionLevel = 2;

      const updated = service.addExhaustion(character);

      expect(updated.name).toBe('Test Character');
      expect(updated.maxHitPoints).toBe(50);
      expect(updated.exhaustionLevel).toBe(3);
    });
  });
});
