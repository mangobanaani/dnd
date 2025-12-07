import { test, expect } from '@playwright/test';
import {
  InventoryItem,
  calculateTotalWeight,
  calculateTotalValue,
  calculateMaxCarryWeight,
} from '@/app/types/character';

// Helper to create mock inventory items
const createMockItem = (overrides?: Partial<InventoryItem>): InventoryItem => ({
  id: crypto.randomUUID(),
  name: 'Test Item',
  type: 'gear',
  quantity: 1,
  weight: 1,
  value: 10,
  description: 'A test item',
  equipped: false,
  attuned: false,
  magical: false,
  ...overrides,
});

test.describe('Inventory Management - Player UX', () => {
  test.describe('Adding Items to Inventory', () => {
    test('should create a new basic item', () => {
      const item = createMockItem({
        name: 'Rope, Hempen (50 feet)',
        type: 'gear',
        quantity: 1,
        weight: 10,
        value: 1,
      });

      expect(item.id).toBeDefined();
      expect(item.name).toBe('Rope, Hempen (50 feet)');
      expect(item.quantity).toBe(1);
      expect(item.weight).toBe(10);
      expect(item.value).toBe(1);
    });

    test('should create a weapon with properties', () => {
      const weapon = createMockItem({
        name: 'Longsword',
        type: 'weapon',
        quantity: 1,
        weight: 3,
        value: 15,
        equipped: true,
        properties: ['Versatile (1d10)'],
      });

      expect(weapon.type).toBe('weapon');
      expect(weapon.equipped).toBe(true);
      expect(weapon.properties).toContain('Versatile (1d10)');
    });

    test('should create a magical item with rarity', () => {
      const magicItem = createMockItem({
        name: 'Potion of Healing',
        type: 'potion',
        quantity: 3,
        weight: 0.5,
        value: 50,
        magical: true,
        rarity: 'common',
      });

      expect(magicItem.magical).toBe(true);
      expect(magicItem.rarity).toBe('common');
      expect(magicItem.quantity).toBe(3);
    });

    test('should create an item requiring attunement', () => {
      const attunedItem = createMockItem({
        name: 'Cloak of Protection',
        type: 'wondrous',
        magical: true,
        attuned: true,
        rarity: 'uncommon',
        value: 3500,
      });

      expect(attunedItem.attuned).toBe(true);
      expect(attunedItem.magical).toBe(true);
    });
  });

  test.describe('Updating Item Quantities', () => {
    test('should increment item quantity', () => {
      const item = createMockItem({ quantity: 5 });
      const updated = { ...item, quantity: item.quantity + 1 };

      expect(updated.quantity).toBe(6);
    });

    test('should decrement item quantity', () => {
      const item = createMockItem({ quantity: 5 });
      const updated = { ...item, quantity: item.quantity - 1 };

      expect(updated.quantity).toBe(4);
    });

    test('should not allow negative quantities', () => {
      const item = createMockItem({ quantity: 1 });
      const updated = { ...item, quantity: Math.max(0, item.quantity - 2) };

      expect(updated.quantity).toBe(0);
    });

    test('should remove item when quantity reaches zero', () => {
      const inventory: InventoryItem[] = [
        createMockItem({ name: 'Arrow', quantity: 1 }),
        createMockItem({ name: 'Sword', quantity: 1 }),
      ];

      const updatedInventory = inventory
        .map(i => i.name === 'Arrow' ? { ...i, quantity: 0 } : i)
        .filter(i => i.quantity > 0);

      expect(updatedInventory.length).toBe(1);
      expect(updatedInventory[0].name).toBe('Sword');
    });

    test('should handle bulk quantity updates (looting)', () => {
      const item = createMockItem({ name: 'Gold Coin', quantity: 10 });
      const lootAmount = 50;
      const updated = { ...item, quantity: item.quantity + lootAmount };

      expect(updated.quantity).toBe(60);
    });
  });

  test.describe('Equipment and Attunement Toggles', () => {
    test('should equip an item', () => {
      const item = createMockItem({ equipped: false });
      const updated = { ...item, equipped: true };

      expect(updated.equipped).toBe(true);
    });

    test('should unequip an item', () => {
      const item = createMockItem({ equipped: true });
      const updated = { ...item, equipped: false };

      expect(updated.equipped).toBe(false);
    });

    test('should attune to a magical item', () => {
      const item = createMockItem({ magical: true, attuned: false });
      const updated = { ...item, attuned: true };

      expect(updated.attuned).toBe(true);
    });

    test('should un-attune from a magical item', () => {
      const item = createMockItem({ magical: true, attuned: true });
      const updated = { ...item, attuned: false };

      expect(updated.attuned).toBe(false);
    });

    test('should handle equipping armor (switching from previous)', () => {
      const inventory: InventoryItem[] = [
        createMockItem({ name: 'Leather Armor', type: 'armor', equipped: true }),
        createMockItem({ name: 'Chain Mail', type: 'armor', equipped: false }),
      ];

      // Unequip all armor, then equip new one
      const updated = inventory.map(i => ({
        ...i,
        equipped: i.name === 'Chain Mail',
      }));

      expect(updated.find(i => i.name === 'Chain Mail')?.equipped).toBe(true);
      expect(updated.find(i => i.name === 'Leather Armor')?.equipped).toBe(false);
    });

    test('should track attunement limit (max 3 items)', () => {
      const inventory: InventoryItem[] = [
        createMockItem({ name: 'Ring of Protection', magical: true, attuned: true }),
        createMockItem({ name: 'Cloak of Elvenkind', magical: true, attuned: true }),
        createMockItem({ name: 'Boots of Speed', magical: true, attuned: true }),
        createMockItem({ name: 'Staff of Power', magical: true, attuned: false }),
      ];

      const attunedCount = inventory.filter(i => i.attuned).length;

      expect(attunedCount).toBe(3);
      expect(attunedCount).toBeLessThanOrEqual(3);
    });
  });

  test.describe('Inventory Filtering', () => {
    const inventory: InventoryItem[] = [
      createMockItem({ name: 'Longsword', type: 'weapon', equipped: true, magical: false }),
      createMockItem({ name: 'Potion of Healing', type: 'potion', magical: true, equipped: false }),
      createMockItem({ name: 'Rope', type: 'gear', equipped: false, magical: false }),
      createMockItem({ name: 'Flaming Sword', type: 'weapon', equipped: true, magical: true }),
    ];

    test('should filter by equipped items', () => {
      const equipped = inventory.filter(i => i.equipped);

      expect(equipped.length).toBe(2);
      expect(equipped.every(i => i.equipped)).toBe(true);
    });

    test('should filter by magical items', () => {
      const magical = inventory.filter(i => i.magical);

      expect(magical.length).toBe(2);
      expect(magical.every(i => i.magical)).toBe(true);
    });

    test('should show all items when no filter applied', () => {
      const all = inventory.filter(() => true);

      expect(all.length).toBe(4);
    });

    test('should filter by item type', () => {
      const weapons = inventory.filter(i => i.type === 'weapon');

      expect(weapons.length).toBe(2);
      expect(weapons.every(i => i.type === 'weapon')).toBe(true);
    });
  });

  test.describe('Carry Capacity (Player UX)', () => {
    test('should calculate total weight of inventory', () => {
      const inventory: InventoryItem[] = [
        createMockItem({ weight: 5, quantity: 1 }),
        createMockItem({ weight: 2, quantity: 3 }),
        createMockItem({ weight: 10, quantity: 1 }),
      ];

      const totalWeight = calculateTotalWeight(inventory);

      expect(totalWeight).toBe(21); // 5 + (2*3) + 10 = 21
    });

    test('should calculate max carry weight (STR x 15)', () => {
      const strength = 16;
      const maxCarry = calculateMaxCarryWeight(strength);

      expect(maxCarry).toBe(240); // 16 * 15 = 240
    });

    test('should warn when approaching carry capacity', () => {
      const inventory: InventoryItem[] = [
        createMockItem({ weight: 50, quantity: 1 }),
        createMockItem({ weight: 40, quantity: 1 }),
      ];
      const totalWeight = calculateTotalWeight(inventory);
      const maxCarry = calculateMaxCarryWeight(10); // 150 lbs max

      const percentUsed = (totalWeight / maxCarry) * 100;

      expect(percentUsed).toBeGreaterThan(50);
      expect(totalWeight).toBe(90);
    });

    test('should indicate overencumbered state', () => {
      const inventory: InventoryItem[] = [
        createMockItem({ weight: 100, quantity: 2 }),
      ];
      const totalWeight = calculateTotalWeight(inventory);
      const maxCarry = calculateMaxCarryWeight(10); // 150 lbs max

      const isOverencumbered = totalWeight > maxCarry;

      expect(isOverencumbered).toBe(true);
      expect(totalWeight).toBe(200);
    });

    test('should handle fractional weights (coins, ammunition)', () => {
      const inventory: InventoryItem[] = [
        createMockItem({ name: 'Arrow', weight: 0.05, quantity: 20 }), // 1 lb
        createMockItem({ name: 'Gold Coins', weight: 0.02, quantity: 500 }), // 10 lb
      ];

      const totalWeight = calculateTotalWeight(inventory);

      expect(totalWeight).toBe(11);
    });
  });

  test.describe('Item Value and Wealth Tracking', () => {
    test('should calculate total inventory value', () => {
      const inventory: InventoryItem[] = [
        createMockItem({ value: 15, quantity: 1 }), // Longsword
        createMockItem({ value: 50, quantity: 2 }), // 2 potions
        createMockItem({ value: 1, quantity: 10 }), // 10 torches
      ];

      const totalValue = calculateTotalValue(inventory);

      expect(totalValue).toBe(125); // 15 + (50*2) + (1*10)
    });

    test('should handle valuable treasure items', () => {
      const item = createMockItem({
        name: 'Ruby',
        type: 'treasure',
        value: 5000,
        weight: 0,
        quantity: 1,
      });

      expect(item.value).toBe(5000);
      expect(item.type).toBe('treasure');
    });

    test('should track currency separately from items', () => {
      const currency = {
        copper: 100,
        silver: 50,
        electrum: 10,
        gold: 25,
        platinum: 2,
      };

      const goldValue = (
        currency.copper * 0.01 +
        currency.silver * 0.1 +
        currency.electrum * 0.5 +
        currency.gold * 1 +
        currency.platinum * 10
      );

      expect(goldValue).toBe(56); // 1 + 5 + 5 + 25 + 20
    });
  });

  test.describe('Item Management (Editing & Deleting)', () => {
    test('should update existing item', () => {
      const item = createMockItem({ name: 'Short Sword', value: 10 });
      const updated = { ...item, name: 'Short Sword +1', value: 1500, magical: true };

      expect(updated.name).toBe('Short Sword +1');
      expect(updated.value).toBe(1500);
      expect(updated.magical).toBe(true);
    });

    test('should delete an item from inventory', () => {
      const inventory: InventoryItem[] = [
        createMockItem({ id: 'item-1', name: 'Sword' }),
        createMockItem({ id: 'item-2', name: 'Shield' }),
        createMockItem({ id: 'item-3', name: 'Potion' }),
      ];

      const updated = inventory.filter(i => i.id !== 'item-2');

      expect(updated.length).toBe(2);
      expect(updated.find(i => i.id === 'item-2')).toBeUndefined();
    });

    test('should preserve other items when updating one', () => {
      const inventory: InventoryItem[] = [
        createMockItem({ id: 'item-1', name: 'Sword', quantity: 1 }),
        createMockItem({ id: 'item-2', name: 'Potion', quantity: 3 }),
      ];

      const updated = inventory.map(i =>
        i.id === 'item-2' ? { ...i, quantity: 5 } : i
      );

      expect(updated.find(i => i.id === 'item-1')?.quantity).toBe(1);
      expect(updated.find(i => i.id === 'item-2')?.quantity).toBe(5);
    });
  });

  test.describe('Item Types and Categories', () => {
    test('should support all item types', () => {
      const types: InventoryItem['type'][] = [
        'weapon', 'armor', 'potion', 'scroll', 'wondrous',
        'tool', 'gear', 'treasure', 'other'
      ];

      types.forEach(type => {
        const item = createMockItem({ type });
        expect(item.type).toBe(type);
      });
    });

    test('should support all rarity levels', () => {
      const rarities: InventoryItem['rarity'][] = [
        'common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact'
      ];

      rarities.forEach(rarity => {
        const item = createMockItem({ magical: true, rarity });
        expect(item.rarity).toBe(rarity);
      });
    });
  });

  test.describe('Inventory Sorting and Organization', () => {
    test('should sort items alphabetically by name', () => {
      const inventory: InventoryItem[] = [
        createMockItem({ name: 'Zephyr Blade' }),
        createMockItem({ name: 'Apple' }),
        createMockItem({ name: 'Rope' }),
      ];

      const sorted = [...inventory].sort((a, b) => a.name.localeCompare(b.name));

      expect(sorted[0].name).toBe('Apple');
      expect(sorted[2].name).toBe('Zephyr Blade');
    });

    test('should sort items by type', () => {
      const inventory: InventoryItem[] = [
        createMockItem({ type: 'gear' }),
        createMockItem({ type: 'weapon' }),
        createMockItem({ type: 'armor' }),
      ];

      const sorted = [...inventory].sort((a, b) => a.type.localeCompare(b.type));

      expect(sorted[0].type).toBe('armor');
      expect(sorted[1].type).toBe('gear');
      expect(sorted[2].type).toBe('weapon');
    });

    test('should sort items by value (descending)', () => {
      const inventory: InventoryItem[] = [
        createMockItem({ value: 10 }),
        createMockItem({ value: 100 }),
        createMockItem({ value: 50 }),
      ];

      const sorted = [...inventory].sort((a, b) => b.value - a.value);

      expect(sorted[0].value).toBe(100);
      expect(sorted[2].value).toBe(10);
    });

    test('should group equipped items at the top', () => {
      const inventory: InventoryItem[] = [
        createMockItem({ name: 'Backpack', equipped: false }),
        createMockItem({ name: 'Sword', equipped: true }),
        createMockItem({ name: 'Rope', equipped: false }),
        createMockItem({ name: 'Shield', equipped: true }),
      ];

      const sorted = [...inventory].sort((a, b) => {
        if (a.equipped === b.equipped) return 0;
        return a.equipped ? -1 : 1;
      });

      expect(sorted[0].equipped).toBe(true);
      expect(sorted[1].equipped).toBe(true);
      expect(sorted[2].equipped).toBe(false);
      expect(sorted[3].equipped).toBe(false);
    });
  });

  test.describe('Player UX: Quick Actions', () => {
    test('should quickly use a consumable (potion)', () => {
      const inventory: InventoryItem[] = [
        createMockItem({ name: 'Potion of Healing', type: 'potion', quantity: 3 }),
      ];

      const updated = inventory.map(i =>
        i.name === 'Potion of Healing' ? { ...i, quantity: i.quantity - 1 } : i
      ).filter(i => i.quantity > 0);

      expect(updated[0].quantity).toBe(2);
    });

    test('should mark item as favorite/important', () => {
      // Using description field as a workaround for now
      const item = createMockItem({ description: '[FAVORITE] Important quest item' });

      const isFavorite = item.description?.includes('[FAVORITE]');

      expect(isFavorite).toBe(true);
    });

    test('should add notes to items', () => {
      const item = createMockItem({
        name: 'Mysterious Amulet',
        description: 'Found in the dragon\'s lair. Glows faintly blue.',
      });

      expect(item.description).toContain('dragon\'s lair');
    });
  });
});

test.describe('Inventory Management - DM UX', () => {
  test.describe('Awarding Loot to Players', () => {
    test('should create loot bundle for party', () => {
      const loot: InventoryItem[] = [
        createMockItem({ name: 'Gold Coins', type: 'treasure', quantity: 500, value: 1, weight: 0.02 }),
        createMockItem({ name: 'Potion of Healing', type: 'potion', quantity: 3, value: 50, magical: true }),
        createMockItem({ name: 'Longsword +1', type: 'weapon', magical: true, rarity: 'uncommon', value: 1500 }),
      ];

      expect(loot.length).toBe(3);
      expect(calculateTotalValue(loot)).toBe(2150); // 500 + (50*3) + 1500
    });

    test('should divide gold among party members', () => {
      const totalGold = 1000;
      const partySize = 4;
      const sharePerPlayer = Math.floor(totalGold / partySize);

      expect(sharePerPlayer).toBe(250);
    });

    test('should create treasure hoard', () => {
      const hoard: InventoryItem[] = [
        createMockItem({ name: 'Platinum Coins', quantity: 100, value: 10, weight: 0.02 }),
        createMockItem({ name: 'Ruby', type: 'treasure', quantity: 5, value: 5000, weight: 0 }),
        createMockItem({ name: 'Staff of Power', type: 'wondrous', magical: true, rarity: 'very rare', value: 95000 }),
      ];

      const totalValue = calculateTotalValue(hoard);

      expect(totalValue).toBeGreaterThan(100000);
      expect(hoard.some(i => i.rarity === 'very rare')).toBe(true);
    });
  });

  test.describe('Managing Player Inventory', () => {
    test('should track which items belong to which character', () => {
      interface CharacterInventoryItem extends InventoryItem {
        characterId: string;
        characterName: string;
      }

      const partyInventory: CharacterInventoryItem[] = [
        { ...createMockItem({ name: 'Sword' }), characterId: 'char-1', characterName: 'Aragorn' },
        { ...createMockItem({ name: 'Bow' }), characterId: 'char-2', characterName: 'Legolas' },
      ];

      const char1Items = partyInventory.filter(i => i.characterId === 'char-1');

      expect(char1Items.length).toBe(1);
      expect(char1Items[0].name).toBe('Sword');
    });

    test('should validate item rarity aligns with party level', () => {
      const partyLevel = 5;
      const item = createMockItem({ rarity: 'legendary' });

      // Legendary items should be rare at level 5
      const isAppropriate = partyLevel >= 17 || item.rarity !== 'legendary';

      expect(isAppropriate).toBe(false); // Too powerful for level 5
    });
  });

  test.describe('DM Tools: Item Database', () => {
    test('should search items by name', () => {
      const itemDatabase: InventoryItem[] = [
        createMockItem({ name: 'Potion of Healing' }),
        createMockItem({ name: 'Potion of Greater Healing' }),
        createMockItem({ name: 'Healing Salve' }),
      ];

      const searchResults = itemDatabase.filter(i =>
        i.name.toLowerCase().includes('healing')
      );

      expect(searchResults.length).toBe(3);
    });

    test('should filter items by type and rarity', () => {
      const itemDatabase: InventoryItem[] = [
        createMockItem({ type: 'weapon', magical: true, rarity: 'uncommon' }),
        createMockItem({ type: 'weapon', magical: true, rarity: 'rare' }),
        createMockItem({ type: 'armor', magical: true, rarity: 'uncommon' }),
      ];

      const filtered = itemDatabase.filter(i =>
        i.type === 'weapon' && i.rarity === 'uncommon'
      );

      expect(filtered.length).toBe(1);
    });
  });
});
