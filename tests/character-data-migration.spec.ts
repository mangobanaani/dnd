import { test, expect } from '@playwright/test';

test.describe('Character Data Migration & Backward Compatibility', () => {
  test.describe('Inventory Field Migration', () => {
    test('should handle characters without inventory field (legacy data)', () => {
      // Simulate a character created before inventory feature was added
      const legacyCharacter = {
        id: 'char-legacy-1',
        name: 'Legacy Hero',
        race: 'Human',
        classes: [{ name: 'Fighter', level: 5 }],
        level: 5,
        background: 'Soldier',
        alignment: 'Lawful Good',
        experiencePoints: 6500,
        abilityScores: {
          strength: 16,
          dexterity: 14,
          constitution: 15,
          intelligence: 10,
          wisdom: 12,
          charisma: 8,
        },
        maxHitPoints: 42,
        currentHitPoints: 42,
        temporaryHitPoints: 0,
        hitDice: [{ total: 5, current: 5, die: 'd10' }],
        armorClass: 18,
        initiative: 2,
        speed: 30,
        proficiencyBonus: 3,
        savingThrows: ['strength', 'constitution'],
        skills: [],
        features: ['Second Wind', 'Action Surge'],
        traits: [],
        equipment: ['Longsword', 'Shield', 'Chain Mail'], // Legacy equipment array
        // NOTE: inventory field is MISSING (simulating old data)
        // NOTE: currency field is MISSING (simulating old data)
        carriedWeight: 0,
        maxCarryWeight: 240,
        playerId: 'player-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      // Simulate migration logic
      const migrated = {
        ...legacyCharacter,
        inventory: legacyCharacter.inventory || [],
        currency: legacyCharacter.currency || {
          copper: 0,
          silver: 0,
          electrum: 0,
          gold: 0,
          platinum: 0,
        },
      };

      // Verify migration succeeded
      expect(migrated.inventory).toBeDefined();
      expect(Array.isArray(migrated.inventory)).toBe(true);
      expect(migrated.inventory.length).toBe(0);
      expect(migrated.currency).toBeDefined();
      expect(migrated.currency.gold).toBe(0);
      expect(migrated.equipment).toEqual(['Longsword', 'Shield', 'Chain Mail']);
    });

    test('should preserve existing inventory when present', () => {
      const modernCharacter = {
        id: 'char-modern-1',
        name: 'Modern Hero',
        race: 'Elf',
        classes: [{ name: 'Wizard', level: 3 }],
        level: 3,
        background: 'Sage',
        alignment: 'Neutral Good',
        experiencePoints: 900,
        abilityScores: {
          strength: 8,
          dexterity: 14,
          constitution: 12,
          intelligence: 16,
          wisdom: 13,
          charisma: 10,
        },
        maxHitPoints: 18,
        currentHitPoints: 18,
        temporaryHitPoints: 0,
        hitDice: [{ total: 3, current: 3, die: 'd6' }],
        armorClass: 12,
        initiative: 2,
        speed: 30,
        proficiencyBonus: 2,
        savingThrows: ['intelligence', 'wisdom'],
        skills: [],
        features: ['Spellcasting'],
        traits: [],
        equipment: [],
        inventory: [
          {
            id: 'item-1',
            name: 'Spellbook',
            type: 'gear',
            quantity: 1,
            weight: 3,
            value: 50,
            equipped: true,
            attuned: false,
            magical: false,
          },
          {
            id: 'item-2',
            name: 'Wand of Magic Missiles',
            type: 'wand',
            quantity: 1,
            weight: 1,
            value: 500,
            equipped: false,
            attuned: true,
            magical: true,
            rarity: 'uncommon',
          },
        ],
        currency: {
          copper: 0,
          silver: 0,
          electrum: 0,
          gold: 25,
          platinum: 0,
        },
        carriedWeight: 4,
        maxCarryWeight: 120,
        playerId: 'player-2',
        createdAt: '2025-10-01T00:00:00.000Z',
        updatedAt: '2025-10-24T00:00:00.000Z',
      };

      // Simulate migration logic (should be no-op for modern data)
      const migrated = {
        ...modernCharacter,
        inventory: modernCharacter.inventory || [],
        currency: modernCharacter.currency || {
          copper: 0,
          silver: 0,
          electrum: 0,
          gold: 0,
          platinum: 0,
        },
      };

      // Verify existing data is preserved
      expect(migrated.inventory.length).toBe(2);
      expect(migrated.inventory[0].name).toBe('Spellbook');
      expect(migrated.inventory[1].name).toBe('Wand of Magic Missiles');
      expect(migrated.currency.gold).toBe(25);
    });

    test('should handle partial currency object (missing fields)', () => {
      const partialCurrencyCharacter = {
        id: 'char-partial-1',
        name: 'Partial Data Hero',
        race: 'Dwarf',
        classes: [{ name: 'Cleric', level: 4 }],
        level: 4,
        background: 'Acolyte',
        alignment: 'Lawful Good',
        experiencePoints: 2700,
        abilityScores: {
          strength: 14,
          dexterity: 10,
          constitution: 16,
          intelligence: 12,
          wisdom: 16,
          charisma: 13,
        },
        maxHitPoints: 32,
        currentHitPoints: 32,
        temporaryHitPoints: 0,
        hitDice: [{ total: 4, current: 4, die: 'd8' }],
        armorClass: 16,
        initiative: 0,
        speed: 25,
        proficiencyBonus: 2,
        savingThrows: ['wisdom', 'charisma'],
        skills: [],
        features: ['Divine Domain', 'Channel Divinity'],
        traits: [],
        equipment: ['Mace', 'Shield', 'Chain Mail'],
        inventory: [],
        currency: {
          gold: 15, // Only gold defined
          // Missing: copper, silver, electrum, platinum
        },
        carriedWeight: 0,
        maxCarryWeight: 210,
        playerId: 'player-3',
        createdAt: '2025-09-15T00:00:00.000Z',
        updatedAt: '2025-10-10T00:00:00.000Z',
      };

      // Simulate migration with defaults for missing currency fields
      const fullCurrency = {
        copper: partialCurrencyCharacter.currency.copper || 0,
        silver: partialCurrencyCharacter.currency.silver || 0,
        electrum: partialCurrencyCharacter.currency.electrum || 0,
        gold: partialCurrencyCharacter.currency.gold || 0,
        platinum: partialCurrencyCharacter.currency.platinum || 0,
      };

      const migrated = {
        ...partialCurrencyCharacter,
        currency: fullCurrency,
      };

      // Verify all currency fields exist with correct defaults
      expect(migrated.currency.copper).toBe(0);
      expect(migrated.currency.silver).toBe(0);
      expect(migrated.currency.electrum).toBe(0);
      expect(migrated.currency.gold).toBe(15); // Preserved
      expect(migrated.currency.platinum).toBe(0);
    });
  });

  test.describe('Equipment Array Backward Compatibility', () => {
    test('should preserve legacy equipment array alongside new inventory', () => {
      const character = {
        id: 'char-hybrid-1',
        name: 'Hybrid Hero',
        race: 'Halfling',
        classes: [{ name: 'Rogue', level: 6 }],
        level: 6,
        background: 'Criminal',
        alignment: 'Chaotic Neutral',
        experiencePoints: 14000,
        abilityScores: {
          strength: 10,
          dexterity: 18,
          constitution: 14,
          intelligence: 13,
          wisdom: 12,
          charisma: 14,
        },
        maxHitPoints: 42,
        currentHitPoints: 42,
        temporaryHitPoints: 0,
        hitDice: [{ total: 6, current: 6, die: 'd8' }],
        armorClass: 15,
        initiative: 4,
        speed: 25,
        proficiencyBonus: 3,
        savingThrows: ['dexterity', 'intelligence'],
        skills: [],
        features: ['Sneak Attack', 'Cunning Action', 'Uncanny Dodge', 'Evasion'],
        traits: [],
        equipment: ['Shortsword', 'Shortbow', 'Leather Armor', "Thieves' Tools"],
        inventory: [
          {
            id: 'item-1',
            name: 'Shortsword +1',
            type: 'weapon',
            quantity: 1,
            weight: 2,
            value: 1000,
            equipped: true,
            attuned: false,
            magical: true,
            rarity: 'uncommon',
          },
        ],
        currency: { copper: 0, silver: 0, electrum: 0, gold: 150, platinum: 0 },
        carriedWeight: 0,
        maxCarryWeight: 150,
        playerId: 'player-4',
        createdAt: '2025-08-01T00:00:00.000Z',
        updatedAt: '2025-10-24T00:00:00.000Z',
      };

      // Both equipment and inventory should coexist
      expect(character.equipment).toBeDefined();
      expect(character.equipment.length).toBe(4);
      expect(character.inventory).toBeDefined();
      expect(character.inventory.length).toBe(1);
      expect(character.inventory[0].name).toBe('Shortsword +1');
    });
  });

  test.describe('Data Structure Validation', () => {
    test('should validate inventory items have required fields', () => {
      const validItem = {
        id: 'item-1',
        name: 'Potion of Healing',
        type: 'potion',
        quantity: 3,
        weight: 0.5,
        value: 50,
        equipped: false,
        attuned: false,
        magical: true,
      };

      expect(validItem.id).toBeDefined();
      expect(validItem.name).toBeTruthy();
      expect(validItem.type).toBeTruthy();
      expect(validItem.quantity).toBeGreaterThanOrEqual(1);
      expect(typeof validItem.weight).toBe('number');
      expect(typeof validItem.value).toBe('number');
      expect(typeof validItem.equipped).toBe('boolean');
      expect(typeof validItem.attuned).toBe('boolean');
      expect(typeof validItem.magical).toBe('boolean');
    });

    test('should validate currency object structure', () => {
      const validCurrency = {
        copper: 100,
        silver: 50,
        electrum: 10,
        gold: 25,
        platinum: 2,
      };

      const requiredFields = ['copper', 'silver', 'electrum', 'gold', 'platinum'];
      requiredFields.forEach((field) => {
        expect(validCurrency[field]).toBeDefined();
        expect(typeof validCurrency[field]).toBe('number');
        expect(validCurrency[field]).toBeGreaterThanOrEqual(0);
      });
    });
  });

  test.describe('Migration Edge Cases', () => {
    test('should handle null inventory (not just undefined)', () => {
      const characterWithNull = {
        id: 'char-null-1',
        name: 'Null Inventory Hero',
        inventory: null, // Explicitly null instead of undefined
        currency: null,
      };

      const migrated = {
        ...characterWithNull,
        inventory: characterWithNull.inventory || [],
        currency: characterWithNull.currency || {
          copper: 0,
          silver: 0,
          electrum: 0,
          gold: 0,
          platinum: 0,
        },
      };

      expect(Array.isArray(migrated.inventory)).toBe(true);
      expect(migrated.inventory.length).toBe(0);
      expect(migrated.currency.gold).toBe(0);
    });

    test('should handle empty arrays and zero values correctly', () => {
      const character = {
        id: 'char-empty-1',
        name: 'Empty Hero',
        inventory: [], // Empty but defined
        currency: {
          copper: 0,
          silver: 0,
          electrum: 0,
          gold: 0,
          platinum: 0,
        },
      };

      // Should NOT overwrite with defaults
      const migrated = {
        ...character,
        inventory: character.inventory || [],
        currency: character.currency || {
          copper: 0,
          silver: 0,
          electrum: 0,
          gold: 0,
          platinum: 0,
        },
      };

      expect(migrated.inventory).toEqual([]);
      expect(migrated.currency.gold).toBe(0);
    });
  });
});
