/**
 * Effects Migration Tests
 * Tests for migrating existing data to include effects system
 */

import {
  migrateCharacter,
  migrateCombatant,
  migrateAllCharacters,
  migrateAllCombatants,
  needsMigration,
  getDataVersion,
  CURRENT_VERSION,
} from '@/app/lib/migrations/effects-migration';
import { Character } from '@/app/types/character';
import { Combatant } from '@/app/types/combat';

describe('Effects Migration', () => {
  describe('needsMigration', () => {
    it('should detect data without effects field', () => {
      const oldCharacter: any = {
        id: 'char-1',
        name: 'Fighter',
        maxHitPoints: 50,
        // No effects field
      };

      expect(needsMigration(oldCharacter)).toBe(true);
    });

    it('should not migrate data with effects field', () => {
      const newCharacter: any = {
        id: 'char-1',
        name: 'Fighter',
        effects: [],
      };

      expect(needsMigration(newCharacter)).toBe(false);
    });

    it('should handle null effects as needing migration', () => {
      const character: any = {
        id: 'char-1',
        name: 'Fighter',
        effects: null,
      };

      expect(needsMigration(character)).toBe(true);
    });

    it('should handle undefined effects as needing migration', () => {
      const character: any = {
        id: 'char-1',
        name: 'Fighter',
        effects: undefined,
      };

      expect(needsMigration(character)).toBe(true);
    });
  });

  describe('migrateCharacter', () => {
    it('should add effects array to character', () => {
      const oldCharacter: any = {
        id: 'char-1',
        name: 'Fighter',
        race: 'Human',
        level: 5,
        maxHitPoints: 50,
        currentHitPoints: 40,
        temporaryHitPoints: 0,
      };

      const migrated = migrateCharacter(oldCharacter);

      expect(migrated.effects).toBeDefined();
      expect(migrated.effects).toEqual([]);
      expect(migrated.concentration).toBeUndefined();
    });

    it('should preserve all existing fields', () => {
      const oldCharacter: any = {
        id: 'char-1',
        name: 'Fighter',
        race: 'Human',
        level: 5,
        maxHitPoints: 50,
        currentHitPoints: 40,
        temporaryHitPoints: 0,
        armorClass: 18,
        inventory: [{ id: 'item-1', name: 'Sword' }],
      };

      const migrated = migrateCharacter(oldCharacter);

      expect(migrated.id).toBe('char-1');
      expect(migrated.name).toBe('Fighter');
      expect(migrated.race).toBe('Human');
      expect(migrated.level).toBe(5);
      expect(migrated.maxHitPoints).toBe(50);
      expect(migrated.currentHitPoints).toBe(40);
      expect(migrated.armorClass).toBe(18);
      expect(migrated.inventory).toEqual([{ id: 'item-1', name: 'Sword' }]);
    });

    it('should not overwrite existing effects', () => {
      const characterWithEffects: any = {
        id: 'char-1',
        name: 'Fighter',
        effects: [{ id: 'effect-1', name: 'Bless' }],
        concentration: { spell: 'Bless', effectIds: ['effect-1'] },
      };

      const migrated = migrateCharacter(characterWithEffects);

      expect(migrated.effects).toHaveLength(1);
      expect(migrated.concentration).toBeDefined();
    });

    it('should handle character with null effects', () => {
      const character: any = {
        id: 'char-1',
        name: 'Fighter',
        effects: null,
      };

      const migrated = migrateCharacter(character);

      expect(migrated.effects).toEqual([]);
    });

    it('should add exhaustionLevel field to legacy character', () => {
      const oldCharacter: any = {
        id: 'char-1',
        name: 'Fighter',
      };

      const migrated = migrateCharacter(oldCharacter);

      expect(migrated.exhaustionLevel).toBe(0);
    });

    it('should not overwrite existing exhaustionLevel', () => {
      const character: any = {
        id: 'char-1',
        name: 'Fighter',
        effects: [],
        exhaustionLevel: 3,
      };

      const migrated = migrateCharacter(character);

      expect(migrated.exhaustionLevel).toBe(3);
    });
  });

  describe('migrateCombatant', () => {
    it('should add effects array to combatant', () => {
      const oldCombatant: any = {
        id: 'combat-1',
        name: 'Fighter',
        type: 'player',
        initiative: 15,
        maxHp: 50,
        currentHp: 40,
        ac: 18,
        isActive: true,
        conditions: [],
      };

      const migrated = migrateCombatant(oldCombatant);

      expect(migrated.effects).toBeDefined();
      expect(migrated.effects).toEqual([]);
      expect(migrated.concentration).toBeUndefined();
    });

    it('should preserve all existing fields', () => {
      const oldCombatant: any = {
        id: 'combat-1',
        name: 'Fighter',
        type: 'player',
        initiative: 15,
        initiativeModifier: 2,
        maxHp: 50,
        currentHp: 40,
        temporaryHp: 5,
        ac: 18,
        isActive: true,
        conditions: [{ name: 'Prone', duration: -1 }],
        characterId: 'char-1',
      };

      const migrated = migrateCombatant(oldCombatant);

      expect(migrated.id).toBe('combat-1');
      expect(migrated.name).toBe('Fighter');
      expect(migrated.type).toBe('player');
      expect(migrated.initiative).toBe(15);
      expect(migrated.maxHitPoints).toBe(50);
      expect(migrated.currentHitPoints).toBe(40);
      expect(migrated.temporaryHitPoints).toBe(5);
      expect(migrated.conditions).toHaveLength(1);
      expect(migrated.characterId).toBe('char-1');
    });

    it('should not overwrite existing effects', () => {
      const combatantWithEffects: any = {
        id: 'combat-1',
        name: 'Fighter',
        effects: [{ id: 'effect-1', name: 'Haste' }],
        concentration: { spell: 'Haste', effectIds: ['effect-1'] },
      };

      const migrated = migrateCombatant(combatantWithEffects);

      expect(migrated.effects).toHaveLength(1);
      expect(migrated.concentration).toBeDefined();
    });

    it('should add exhaustionLevel field to legacy combatant', () => {
      const oldCombatant: any = {
        id: 'combat-1',
        name: 'Fighter',
        type: 'player',
      };

      const migrated = migrateCombatant(oldCombatant);

      expect(migrated.exhaustionLevel).toBe(0);
    });

    it('should not overwrite existing exhaustionLevel', () => {
      const combatant: any = {
        id: 'combat-1',
        name: 'Fighter',
        effects: [],
        exhaustionLevel: 2,
      };

      const migrated = migrateCombatant(combatant);

      expect(migrated.exhaustionLevel).toBe(2);
    });
  });

  describe('migrateAllCharacters', () => {
    it('should migrate array of characters', () => {
      const characters: any[] = [
        { id: 'char-1', name: 'Fighter' },
        { id: 'char-2', name: 'Wizard' },
        { id: 'char-3', name: 'Rogue' },
      ];

      const migrated = migrateAllCharacters(characters);

      expect(migrated).toHaveLength(3);
      migrated.forEach(char => {
        expect(char.effects).toBeDefined();
        expect(char.effects).toEqual([]);
      });
    });

    it('should handle empty array', () => {
      const migrated = migrateAllCharacters([]);
      expect(migrated).toEqual([]);
    });

    it('should preserve character order', () => {
      const characters: any[] = [
        { id: 'char-1', name: 'Fighter' },
        { id: 'char-2', name: 'Wizard' },
        { id: 'char-3', name: 'Rogue' },
      ];

      const migrated = migrateAllCharacters(characters);

      expect(migrated[0].id).toBe('char-1');
      expect(migrated[1].id).toBe('char-2');
      expect(migrated[2].id).toBe('char-3');
    });

    it('should handle mix of old and new characters', () => {
      const characters: any[] = [
        { id: 'char-1', name: 'Fighter' }, // Old, no effects
        { id: 'char-2', name: 'Wizard', effects: [] }, // New, has effects
        { id: 'char-3', name: 'Rogue' }, // Old, no effects
      ];

      const migrated = migrateAllCharacters(characters);

      expect(migrated).toHaveLength(3);
      migrated.forEach(char => {
        expect(char.effects).toBeDefined();
      });
    });
  });

  describe('migrateAllCombatants', () => {
    it('should migrate array of combatants', () => {
      const combatants: any[] = [
        { id: 'combat-1', name: 'Fighter', type: 'player' },
        { id: 'combat-2', name: 'Goblin', type: 'monster' },
        { id: 'combat-3', name: 'Wizard', type: 'player' },
      ];

      const migrated = migrateAllCombatants(combatants);

      expect(migrated).toHaveLength(3);
      migrated.forEach(combatant => {
        expect(combatant.effects).toBeDefined();
        expect(combatant.effects).toEqual([]);
      });
    });

    it('should handle empty array', () => {
      const migrated = migrateAllCombatants([]);
      expect(migrated).toEqual([]);
    });

    it('should preserve combatant order', () => {
      const combatants: any[] = [
        { id: 'combat-1', name: 'Fighter', type: 'player' },
        { id: 'combat-2', name: 'Goblin', type: 'monster' },
      ];

      const migrated = migrateAllCombatants(combatants);

      expect(migrated[0].id).toBe('combat-1');
      expect(migrated[1].id).toBe('combat-2');
    });
  });

  describe('getDataVersion', () => {
    it('should return 1 for data without effects', () => {
      const oldData: any = {
        id: 'char-1',
        name: 'Fighter',
      };

      expect(getDataVersion(oldData)).toBe(1);
    });

    it('should return 2 for data with effects', () => {
      const newData: any = {
        id: 'char-1',
        name: 'Fighter',
        effects: [],
      };

      expect(getDataVersion(newData)).toBe(2);
    });

    it('should return CURRENT_VERSION constant', () => {
      const newData: any = {
        id: 'char-1',
        effects: [],
      };

      expect(getDataVersion(newData)).toBe(CURRENT_VERSION);
    });
  });

  describe('CURRENT_VERSION', () => {
    it('should be defined as 2', () => {
      expect(CURRENT_VERSION).toBe(2);
    });
  });
});
