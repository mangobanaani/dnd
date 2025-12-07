/**
 * Character Factory Tests
 * Tests for creating characters with proper effect initialization
 */

import {
  createDefaultCharacter,
  createCharacterFromTemplate,
  initializeCharacterEffects,
  addEffectToCharacter,
} from '@/app/lib/factories/character.factory';
import { createEffect } from '@/app/types/effects';

describe('Character Factory', () => {
  describe('createDefaultCharacter', () => {
    it('should create character with empty effects array', () => {
      const character = createDefaultCharacter('user-1');

      expect(character.effects).toBeDefined();
      expect(character.effects).toEqual([]);
      expect(character.concentration).toBeUndefined();
    });

    it('should initialize all required fields', () => {
      const character = createDefaultCharacter('user-1');

      expect(character.id).toBeDefined();
      expect(character.playerId).toBe('user-1');
      expect(character.name).toBe('');
      expect(character.level).toBe(1);
      expect(character.maxHitPoints).toBe(10);
      expect(character.currentHitPoints).toBe(10);
      expect(character.temporaryHitPoints).toBe(0);
      expect(character.createdAt).toBeDefined();
      expect(character.updatedAt).toBeDefined();
    });

    it('should initialize ability scores to 10', () => {
      const character = createDefaultCharacter('user-1');

      expect(character.abilityScores.strength).toBe(10);
      expect(character.abilityScores.dexterity).toBe(10);
      expect(character.abilityScores.constitution).toBe(10);
      expect(character.abilityScores.intelligence).toBe(10);
      expect(character.abilityScores.wisdom).toBe(10);
      expect(character.abilityScores.charisma).toBe(10);
    });

    it('should initialize empty inventory', () => {
      const character = createDefaultCharacter('user-1');

      expect(character.inventory).toBeDefined();
      expect(character.inventory).toEqual([]);
    });
  });

  describe('createCharacterFromTemplate', () => {
    it('should create character with custom name and race', () => {
      const character = createCharacterFromTemplate('user-1', {
        name: 'Gandalf',
        race: 'Human',
        classes: [{ name: 'Wizard', level: 5, hitDie: 'd6' }],
      });

      expect(character.name).toBe('Gandalf');
      expect(character.race).toBe('Human');
      expect(character.classes).toHaveLength(1);
      expect(character.level).toBe(5);
      expect(character.effects).toEqual([]);
    });

    it('should merge template with defaults', () => {
      const character = createCharacterFromTemplate('user-1', {
        name: 'Fighter',
        maxHitPoints: 50,
      });

      expect(character.name).toBe('Fighter');
      expect(character.maxHitPoints).toBe(50);
      expect(character.currentHitPoints).toBe(50); // Should match max
      expect(character.effects).toEqual([]);
      expect(character.playerId).toBe('user-1');
    });

    it('should initialize multi-class correctly', () => {
      const character = createCharacterFromTemplate('user-1', {
        name: 'Multi',
        classes: [
          { name: 'Fighter', level: 3, hitDie: 'd10' },
          { name: 'Wizard', level: 2, hitDie: 'd6' },
        ],
      });

      expect(character.classes).toHaveLength(2);
      expect(character.level).toBe(5); // Total level
    });
  });

  describe('initializeCharacterEffects', () => {
    it('should add effects array if missing', () => {
      const oldCharacter: any = {
        id: 'char-1',
        name: 'Test',
        // No effects field
      };

      const updated = initializeCharacterEffects(oldCharacter);

      expect(updated.effects).toBeDefined();
      expect(updated.effects).toEqual([]);
      expect(updated.concentration).toBeUndefined();
    });

    it('should not overwrite existing effects', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      const character: any = {
        id: 'char-1',
        name: 'Test',
        effects: [effect],
      };

      const updated = initializeCharacterEffects(character);

      expect(updated.effects).toHaveLength(1);
      expect(updated.effects[0]).toEqual(effect);
    });

    it('should preserve concentration if present', () => {
      const character: any = {
        id: 'char-1',
        name: 'Test',
        effects: [],
        concentration: {
          spell: 'Bless',
          effectIds: ['effect-1'],
        },
      };

      const updated = initializeCharacterEffects(character);

      expect(updated.concentration).toBeDefined();
      expect(updated.concentration?.spell).toBe('Bless');
    });
  });

  describe('addEffectToCharacter', () => {
    it('should add effect to character', () => {
      const character = createDefaultCharacter('user-1');
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      const updated = addEffectToCharacter(character, effect);

      expect(updated.effects).toHaveLength(1);
      expect(updated.effects[0]).toEqual(effect);
    });

    it('should set concentration for concentration spells', () => {
      const character = createDefaultCharacter('user-1');
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: {
          requiresConcentration: true,
        },
      });

      const updated = addEffectToCharacter(character, effect);

      expect(updated.concentration).toBeDefined();
      expect(updated.concentration?.spell).toBe('Bless');
      expect(updated.concentration?.effectIds).toContain(effect.id);
    });

    it('should break existing concentration', () => {
      const character = createDefaultCharacter('user-1');

      const bless = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });

      const haste = createEffect({
        name: 'Haste',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });

      let updated = addEffectToCharacter(character, bless);
      updated = addEffectToCharacter(updated, haste);

      expect(updated.effects).toHaveLength(1); // Only Haste remains
      expect(updated.effects[0].name).toBe('Haste');
      expect(updated.concentration?.spell).toBe('Haste');
    });

    it('should allow multiple non-concentration effects', () => {
      const character = createDefaultCharacter('user-1');

      const inspiration = createEffect({
        name: 'Inspiration',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'permanent',
      });

      const guidance = createEffect({
        name: 'Guidance',
        appliedBy: 'user-1',
        appliedTo: character.id,
        durationType: 'rounds',
        roundsRemaining: 1,
      });

      let updated = addEffectToCharacter(character, inspiration);
      updated = addEffectToCharacter(updated, guidance);

      expect(updated.effects).toHaveLength(2);
      expect(updated.concentration).toBeUndefined();
    });
  });
});
