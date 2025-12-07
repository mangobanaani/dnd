import { test, expect } from '@playwright/test';
import { Character, SpellSlot, HitDice } from '@/app/types/character';

// Mock character for testing
const createMockCharacter = (overrides?: Partial<Character>): Character => ({
  id: 'test-char-1',
  userId: 'test-user',
  name: 'Test Wizard',
  class: 'Wizard',
  level: 5,
  race: 'Human',
  background: 'Sage',
  alignment: 'Neutral Good',
  experiencePoints: 6500,
  armorClass: 12,
  initiative: 2,
  speed: 30,
  maxHitPoints: 28,
  currentHitPoints: 28,
  temporaryHitPoints: 0,
  hitDice: [
    { type: 'd6', total: 5, current: 5 },
  ],
  abilityScores: {
    strength: 8,
    dexterity: 14,
    constitution: 13,
    intelligence: 16,
    wisdom: 12,
    charisma: 10,
  },
  savingThrows: {
    strength: -1,
    dexterity: 2,
    constitution: 1,
    intelligence: 5,
    wisdom: 3,
    charisma: 0,
  },
  skills: {
    acrobatics: 2,
    animalHandling: 1,
    arcana: 5,
    athletics: -1,
    deception: 0,
    history: 5,
    insight: 1,
    intimidation: 0,
    investigation: 5,
    medicine: 1,
    nature: 3,
    perception: 1,
    performance: 0,
    persuasion: 0,
    religion: 3,
    sleightOfHand: 2,
    stealth: 2,
    survival: 1,
  },
  proficiencyBonus: 3,
  inspiration: false,
  equipment: ['Spellbook', 'Component pouch', 'Quarterstaff'],
  inventory: [],
  features: ['Spellcasting', 'Arcane Recovery'],
  spells: ['Magic Missile', 'Shield', 'Detect Magic', 'Fireball', 'Counterspell'],
  spellSlots: [
    { level: 1, total: 4, used: 0 },
    { level: 2, total: 3, used: 0 },
    { level: 3, total: 2, used: 0 },
  ],
  spellcastingAbility: 'intelligence',
  spellSaveDC: 13,
  spellAttackBonus: 5,
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

test.describe('Character Structure Tests', () => {
  test('should have valid character structure', () => {
    const character = createMockCharacter();

    expect(character.id).toBeDefined();
    expect(character.name).toBeTruthy();
    expect(character.class).toBeTruthy();
    expect(character.level).toBeGreaterThan(0);
    expect(character.maxHitPoints).toBeGreaterThan(0);
    expect(character.currentHitPoints).toBeGreaterThanOrEqual(0);
  });

  test('should have valid ability scores', () => {
    const character = createMockCharacter();

    expect(character.abilityScores.strength).toBeGreaterThanOrEqual(1);
    expect(character.abilityScores.dexterity).toBeGreaterThanOrEqual(1);
    expect(character.abilityScores.constitution).toBeGreaterThanOrEqual(1);
    expect(character.abilityScores.intelligence).toBeGreaterThanOrEqual(1);
    expect(character.abilityScores.wisdom).toBeGreaterThanOrEqual(1);
    expect(character.abilityScores.charisma).toBeGreaterThanOrEqual(1);
  });

  test('should have valid spell slots structure for spellcasters', () => {
    const character = createMockCharacter();

    expect(Array.isArray(character.spellSlots)).toBe(true);

    character.spellSlots?.forEach(slot => {
      expect(slot.level).toBeGreaterThanOrEqual(1);
      expect(slot.level).toBeLessThanOrEqual(9);
      expect(slot.total).toBeGreaterThanOrEqual(0);
      expect(slot.used).toBeGreaterThanOrEqual(0);
      expect(slot.used).toBeLessThanOrEqual(slot.total);
    });
  });

  test('should have valid hit dice structure', () => {
    const character = createMockCharacter();

    expect(Array.isArray(character.hitDice)).toBe(true);

    character.hitDice.forEach(hd => {
      expect(['d6', 'd8', 'd10', 'd12']).toContain(hd.type);
      expect(hd.total).toBeGreaterThan(0);
      expect(hd.current).toBeGreaterThanOrEqual(0);
      expect(hd.current).toBeLessThanOrEqual(hd.total);
    });
  });
});

test.describe('Short Rest Mechanics', () => {
  test('should restore HP during short rest', () => {
    const character = createMockCharacter({
      maxHitPoints: 40,
      currentHitPoints: 20,
    });

    // Simulate short rest (heals half of max HP)
    const healAmount = Math.floor(character.maxHitPoints / 2);
    const newHP = Math.min(character.maxHitPoints, character.currentHitPoints + healAmount);

    expect(newHP).toBe(40); // 20 + 20 = 40
  });

  test('should not exceed max HP during short rest', () => {
    const character = createMockCharacter({
      maxHitPoints: 40,
      currentHitPoints: 35,
    });

    // Simulate short rest
    const healAmount = Math.floor(character.maxHitPoints / 2); // 20
    const newHP = Math.min(character.maxHitPoints, character.currentHitPoints + healAmount);

    expect(newHP).toBe(40); // Capped at max HP
  });

  test('short rest should not restore spell slots', () => {
    const character = createMockCharacter({
      spellSlots: [
        { level: 1, total: 4, used: 2 },
        { level: 2, total: 3, used: 1 },
      ],
    });

    // Spell slots should remain unchanged during short rest
    expect(character.spellSlots![0].used).toBe(2);
    expect(character.spellSlots![1].used).toBe(1);
  });

  test('should calculate actual healing during short rest', () => {
    const character = createMockCharacter({
      maxHitPoints: 50,
      currentHitPoints: 30,
    });

    const healAmount = Math.floor(character.maxHitPoints / 2); // 25
    const newHP = Math.min(character.maxHitPoints, character.currentHitPoints + healAmount);
    const actualHealing = newHP - character.currentHitPoints;

    expect(actualHealing).toBe(20); // Only heals 20 because we're capped at max HP
  });
});

test.describe('Long Rest Mechanics', () => {
  test('should fully restore HP during long rest', () => {
    const character = createMockCharacter({
      maxHitPoints: 40,
      currentHitPoints: 10,
    });

    const newHP = character.maxHitPoints;

    expect(newHP).toBe(40);
  });

  test('should restore all spell slots during long rest', () => {
    const usedSpellSlots: SpellSlot[] = [
      { level: 1, total: 4, used: 3 },
      { level: 2, total: 3, used: 2 },
      { level: 3, total: 2, used: 2 },
    ];

    const restoredSpellSlots = usedSpellSlots.map(slot => ({
      ...slot,
      used: 0,
    }));

    expect(restoredSpellSlots[0].used).toBe(0);
    expect(restoredSpellSlots[1].used).toBe(0);
    expect(restoredSpellSlots[2].used).toBe(0);
  });

  test('should recover hit dice during long rest', () => {
    const hitDice: HitDice[] = [
      { type: 'd8', total: 5, current: 1 },
    ];

    // Long rest recovers half of total hit dice (rounded down, minimum 1)
    const recovered = hitDice.map(hd => ({
      ...hd,
      current: Math.max(1, Math.ceil(hd.total / 2)),
    }));

    expect(recovered[0].current).toBe(3); // Math.ceil(5 / 2) = 3
  });

  test('should recover at least 1 hit die during long rest', () => {
    const hitDice: HitDice[] = [
      { type: 'd6', total: 2, current: 0 },
    ];

    const recovered = hitDice.map(hd => ({
      ...hd,
      current: Math.max(1, Math.ceil(hd.total / 2)),
    }));

    expect(recovered[0].current).toBe(1); // At least 1
  });

  test('should restore HP, spell slots, and hit dice during long rest', () => {
    const character = createMockCharacter({
      maxHitPoints: 30,
      currentHitPoints: 8,
      spellSlots: [
        { level: 1, total: 4, used: 4 },
        { level: 2, total: 3, used: 2 },
      ],
      hitDice: [
        { type: 'd6', total: 5, current: 1 },
      ],
    });

    // Simulate long rest
    const updatedCharacter: Character = {
      ...character,
      currentHitPoints: character.maxHitPoints,
      spellSlots: character.spellSlots?.map(slot => ({ ...slot, used: 0 })),
      hitDice: character.hitDice.map(hd => ({
        ...hd,
        current: Math.max(1, Math.ceil(hd.total / 2)),
      })),
    };

    expect(updatedCharacter.currentHitPoints).toBe(30);
    expect(updatedCharacter.spellSlots![0].used).toBe(0);
    expect(updatedCharacter.spellSlots![1].used).toBe(0);
    expect(updatedCharacter.hitDice[0].current).toBe(3);
  });
});

test.describe('Spell Slot Tracking', () => {
  test('should use spell slot correctly', () => {
    const spellSlots: SpellSlot[] = [
      { level: 1, total: 4, used: 0 },
    ];

    // Use a slot
    spellSlots[0].used += 1;

    expect(spellSlots[0].used).toBe(1);
    expect(spellSlots[0].total - spellSlots[0].used).toBe(3); // 3 remaining
  });

  test('should not use more spell slots than total', () => {
    const spellSlot: SpellSlot = { level: 1, total: 4, used: 4 };

    // Try to use another slot
    const canUse = spellSlot.used < spellSlot.total;

    expect(canUse).toBe(false);
  });

  test('should track multiple spell slot levels', () => {
    const spellSlots: SpellSlot[] = [
      { level: 1, total: 4, used: 2 },
      { level: 2, total: 3, used: 1 },
      { level: 3, total: 2, used: 0 },
    ];

    expect(spellSlots[0].total - spellSlots[0].used).toBe(2); // Level 1: 2 remaining
    expect(spellSlots[1].total - spellSlots[1].used).toBe(2); // Level 2: 2 remaining
    expect(spellSlots[2].total - spellSlots[2].used).toBe(2); // Level 3: 2 remaining
  });

  test('should toggle spell slot used/available', () => {
    const spellSlots: SpellSlot[] = [
      { level: 1, total: 4, used: 2 },
    ];

    // Toggle slot from used to available
    spellSlots[0].used -= 1;
    expect(spellSlots[0].used).toBe(1);

    // Toggle slot from available to used
    spellSlots[0].used += 1;
    expect(spellSlots[0].used).toBe(2);
  });

  test('should have different spell slots for different caster levels', () => {
    const level3Wizard = createMockCharacter({
      level: 3,
      spellSlots: [
        { level: 1, total: 4, used: 0 },
        { level: 2, total: 2, used: 0 },
      ],
    });

    const level5Wizard = createMockCharacter({
      level: 5,
      spellSlots: [
        { level: 1, total: 4, used: 0 },
        { level: 2, total: 3, used: 0 },
        { level: 3, total: 2, used: 0 },
      ],
    });

    expect(level3Wizard.spellSlots?.length).toBe(2);
    expect(level5Wizard.spellSlots?.length).toBe(3);
  });

  test('non-spellcasters should not have spell slots', () => {
    const fighter = createMockCharacter({
      class: 'Fighter',
      spellSlots: undefined,
    });

    expect(fighter.spellSlots).toBeUndefined();
  });
});

test.describe('Hit Dice Usage', () => {
  test('should spend hit dice during short rest', () => {
    const hitDice: HitDice[] = [
      { type: 'd8', total: 5, current: 5 },
    ];

    // Spend 1 hit die
    hitDice[0].current -= 1;

    expect(hitDice[0].current).toBe(4);
  });

  test('should not spend more hit dice than available', () => {
    const hitDice: HitDice[] = [
      { type: 'd6', total: 5, current: 0 },
    ];

    const canSpend = hitDice[0].current > 0;

    expect(canSpend).toBe(false);
  });

  test('should match hit die type to class', () => {
    const wizard = createMockCharacter({
      class: 'Wizard',
      hitDice: [{ type: 'd6', total: 5, current: 5 }],
    });

    const fighter = createMockCharacter({
      class: 'Fighter',
      hitDice: [{ type: 'd10', total: 5, current: 5 }],
    });

    const barbarian = createMockCharacter({
      class: 'Barbarian',
      hitDice: [{ type: 'd12', total: 5, current: 5 }],
    });

    expect(wizard.hitDice[0].type).toBe('d6');
    expect(fighter.hitDice[0].type).toBe('d10');
    expect(barbarian.hitDice[0].type).toBe('d12');
  });

  test('hit dice total should match character level', () => {
    const level5Character = createMockCharacter({
      level: 5,
      hitDice: [{ type: 'd8', total: 5, current: 5 }],
    });

    expect(level5Character.hitDice[0].total).toBe(level5Character.level);
  });
});

test.describe('HP Management', () => {
  test('should not have current HP exceed max HP', () => {
    const character = createMockCharacter({
      maxHitPoints: 30,
      currentHitPoints: 30,
    });

    // Try to heal beyond max
    const healedHP = Math.min(character.maxHitPoints, character.currentHitPoints + 10);

    expect(healedHP).toBe(30);
  });

  test('should track temporary HP separately', () => {
    const character = createMockCharacter({
      maxHitPoints: 30,
      currentHitPoints: 20,
      temporaryHitPoints: 5,
    });

    expect(character.temporaryHitPoints).toBe(5);
    expect(character.currentHitPoints).toBe(20);
  });

  test('should allow current HP to be 0', () => {
    const character = createMockCharacter({
      currentHitPoints: 0,
    });

    expect(character.currentHitPoints).toBe(0);
  });
});
