/**
 * Combatant Factory Tests
 * Tests for creating combatants from characters and monsters
 */

import {
  createCombatantFromCharacter,
  createCombatantFromMonster,
  initializeCombatantEffects,
  addEffectToCombatant,
} from '@/app/lib/factories/combatant.factory';
import { createDefaultCharacter } from '@/app/lib/factories/character.factory';
import { createEffect } from '@/app/types/effects';
import { Monster } from '@/app/types/monster';

describe('Combatant Factory', () => {
  describe('createCombatantFromCharacter', () => {
    it('should create combatant from character', () => {
      const character = createDefaultCharacter('user-1');
      character.name = 'Fighter';
      character.maxHitPoints = 50;
      character.currentHitPoints = 40;
      character.temporaryHitPoints = 5;
      character.armorClass = 18;
      character.initiative = 2;

      const combatant = createCombatantFromCharacter(character, 15);

      expect(combatant.id).toBeDefined();
      expect(combatant.name).toBe('Fighter');
      expect(combatant.type).toBe('player');
      expect(combatant.maxHitPoints).toBe(50);
      expect(combatant.currentHitPoints).toBe(40);
      expect(combatant.temporaryHitPoints).toBe(5);
      expect(combatant.ac).toBe(18);
      expect(combatant.initiative).toBe(15);
      expect(combatant.initiativeModifier).toBe(2);
      expect(combatant.characterId).toBe(character.id);
    });

    it('should initialize effects and concentration', () => {
      const character = createDefaultCharacter('user-1');
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });

      character.effects = [effect];
      character.concentration = {
        spell: 'Bless',
        effectIds: [effect.id],
      };

      const combatant = createCombatantFromCharacter(character, 15);

      expect(combatant.effects).toHaveLength(1);
      expect(combatant.effects[0].name).toBe('Bless');
      expect(combatant.concentration).toBeDefined();
      expect(combatant.concentration?.spell).toBe('Bless');
    });

    it('should set isActive to true', () => {
      const character = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(character, 10);

      expect(combatant.isActive).toBe(true);
    });

    it('should initialize empty conditions array', () => {
      const character = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(character, 10);

      expect(combatant.conditions).toBeDefined();
      expect(combatant.conditions).toEqual([]);
    });

    it('should set addedAt timestamp', () => {
      const character = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(character, 10);

      expect(combatant.addedAt).toBeDefined();
      const addedDate = new Date(combatant.addedAt);
      expect(addedDate.getTime()).toBeGreaterThan(Date.now() - 1000);
    });
  });

  describe('createCombatantFromMonster', () => {
    const mockMonster: Monster = {
      name: 'Goblin',
      size: 'Small',
      type: 'Humanoid',
      tag: '',
      alignment: 'Neutral Evil',
      movement: 'Walk 30',
      cr: '1/4',
      sourceBook: 'MM',
      sourcePage: '166',
      spellUser: false,
      legendaryActions: false,
      lairActions: false,
      abilities: '',
      actions: '',
      reaction: '',
      environments: {
        arctic: false,
        coastal: false,
        desert: false,
        forest: true,
        grassland: true,
        hill: true,
        mountain: false,
        swamp: false,
        underdark: true,
        underwater: false,
        urban: false,
        other: false,
      },
      credits: '',
      hit_points: 7,
      armor_class: 15,
      dexterity: 14,
    };

    it('should create combatant from monster', () => {
      const combatant = createCombatantFromMonster(mockMonster, 12);

      expect(combatant.id).toBeDefined();
      expect(combatant.name).toBe('Goblin');
      expect(combatant.type).toBe('monster');
      expect(combatant.maxHitPoints).toBe(7);
      expect(combatant.currentHitPoints).toBe(7);
      expect(combatant.temporaryHitPoints).toBe(0);
      expect(combatant.ac).toBe(15);
      expect(combatant.initiative).toBe(12);
      expect(combatant.initiativeModifier).toBe(2); // DEX modifier from 14
    });

    it('should handle monster without optional fields', () => {
      const minimalMonster: Monster = {
        ...mockMonster,
        hit_points: undefined,
        armor_class: undefined,
        dexterity: undefined,
      };

      const combatant = createCombatantFromMonster(minimalMonster, 10);

      expect(combatant.maxHitPoints).toBe(10); // Default
      expect(combatant.currentHitPoints).toBe(10);
      expect(combatant.ac).toBe(10); // Default
      expect(combatant.initiativeModifier).toBe(0); // No DEX
    });

    it('should initialize effects array', () => {
      const combatant = createCombatantFromMonster(mockMonster, 12);

      expect(combatant.effects).toBeDefined();
      expect(combatant.effects).toEqual([]);
      expect(combatant.concentration).toBeUndefined();
    });

    it('should set isActive to true', () => {
      const combatant = createCombatantFromMonster(mockMonster, 12);

      expect(combatant.isActive).toBe(true);
    });

    it('should calculate initiative modifier from dexterity', () => {
      const monster = { ...mockMonster, dexterity: 18 };
      const combatant = createCombatantFromMonster(monster, 15);

      expect(combatant.initiativeModifier).toBe(4); // (18 - 10) / 2 = 4
    });

    it('should create unique combatant for multiple monsters', () => {
      const combatant1 = createCombatantFromMonster(mockMonster, 12);
      const combatant2 = createCombatantFromMonster(mockMonster, 14);

      expect(combatant1.id).not.toBe(combatant2.id);
      expect(combatant1.name).toBe('Goblin');
      expect(combatant2.name).toBe('Goblin');
    });
  });

  describe('initializeCombatantEffects', () => {
    it('should add effects array if missing', () => {
      const oldCombatant: any = {
        id: 'combat-1',
        name: 'Fighter',
        // No effects field
      };

      const updated = initializeCombatantEffects(oldCombatant);

      expect(updated.effects).toBeDefined();
      expect(updated.effects).toEqual([]);
      expect(updated.concentration).toBeUndefined();
    });

    it('should not overwrite existing effects', () => {
      const effect = createEffect({
        name: 'Haste',
        appliedBy: 'dm-1',
        appliedTo: 'combat-1',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      const combatant: any = {
        id: 'combat-1',
        name: 'Fighter',
        effects: [effect],
      };

      const updated = initializeCombatantEffects(combatant);

      expect(updated.effects).toHaveLength(1);
      expect(updated.effects[0]).toEqual(effect);
    });

    it('should preserve concentration if present', () => {
      const combatant: any = {
        id: 'combat-1',
        name: 'Wizard',
        effects: [],
        concentration: {
          spell: 'Haste',
          effectIds: ['effect-1'],
        },
      };

      const updated = initializeCombatantEffects(combatant);

      expect(updated.concentration).toBeDefined();
      expect(updated.concentration?.spell).toBe('Haste');
    });
  });

  describe('addEffectToCombatant', () => {
    it('should add effect to combatant', () => {
      const character = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(character, 15);

      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: combatant.id,
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      const updated = addEffectToCombatant(combatant, effect);

      expect(updated.effects).toHaveLength(1);
      expect(updated.effects[0]).toEqual(effect);
    });

    it('should handle concentration', () => {
      const character = createDefaultCharacter('user-1');
      const combatant = createCombatantFromCharacter(character, 15);

      const effect = createEffect({
        name: 'Haste',
        appliedBy: 'user-1',
        appliedTo: combatant.id,
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });

      const updated = addEffectToCombatant(combatant, effect);

      expect(updated.concentration).toBeDefined();
      expect(updated.concentration?.spell).toBe('Haste');
    });

    it('should break existing concentration', () => {
      const character = createDefaultCharacter('user-1');
      let combatant = createCombatantFromCharacter(character, 15);

      const bless = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: combatant.id,
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });

      const haste = createEffect({
        name: 'Haste',
        appliedBy: 'user-1',
        appliedTo: combatant.id,
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });

      combatant = addEffectToCombatant(combatant, bless);
      combatant = addEffectToCombatant(combatant, haste);

      expect(combatant.effects).toHaveLength(1);
      expect(combatant.effects[0].name).toBe('Haste');
      expect(combatant.concentration?.spell).toBe('Haste');
    });
  });
});
