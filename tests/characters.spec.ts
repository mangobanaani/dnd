import { test, expect } from '@playwright/test';
import {
  Character,
  AbilityScores,
  calculateModifier,
  calculateProficiencyBonus,
  calculateSkillModifier,
  calculateSavingThrow,
  formatModifier,
  xpForLevel,
  getLevelFromXP,
  getTotalLevel,
  createDefaultCharacter,
  calculateMaxCarryWeight,
  calculateTotalWeight,
  calculateTotalValue,
} from '@/app/types/character';
import { testCharacters } from './fixtures/test-data';

test.describe('Character Structure Tests', () => {
  test('should have valid character structure', () => {
    const character = testCharacters[0];

    expect(character.id).toBeDefined();
    expect(character.name).toBeTruthy();
    expect(character.race).toBeTruthy();
    expect(Array.isArray(character.classes)).toBe(true);
    expect(character.level).toBeGreaterThanOrEqual(1);
    expect(character.abilityScores).toBeDefined();
    expect(character.maxHitPoints).toBeGreaterThan(0);
    expect(character.armorClass).toBeGreaterThan(0);
  });

  test('should have all six ability scores', () => {
    const character = testCharacters[0];
    const abilities: (keyof AbilityScores)[] = [
      'strength', 'dexterity', 'constitution',
      'intelligence', 'wisdom', 'charisma'
    ];

    abilities.forEach(ability => {
      expect(character.abilityScores[ability]).toBeGreaterThanOrEqual(1);
      expect(character.abilityScores[ability]).toBeLessThanOrEqual(30);
    });
  });

  test('should have valid class information', () => {
    testCharacters.forEach(character => {
      character.classes.forEach(cls => {
        expect(cls.name).toBeTruthy();
        expect(cls.level).toBeGreaterThan(0);
        expect(cls.hitDie).toMatch(/d\d+/);
      });
    });
  });
});

test.describe('Ability Score Calculations', () => {
  test('should calculate ability modifiers correctly', () => {
    expect(calculateModifier(10)).toBe(0);
    expect(calculateModifier(12)).toBe(1);
    expect(calculateModifier(14)).toBe(2);
    expect(calculateModifier(16)).toBe(3);
    expect(calculateModifier(18)).toBe(4);
    expect(calculateModifier(8)).toBe(-1);
    expect(calculateModifier(6)).toBe(-2);
  });

  test('should format modifiers with sign', () => {
    expect(formatModifier(3)).toBe('+3');
    expect(formatModifier(0)).toBe('+0');
    expect(formatModifier(-2)).toBe('-2');
  });

  test('should calculate proficiency bonus by level', () => {
    expect(calculateProficiencyBonus(1)).toBe(2);
    expect(calculateProficiencyBonus(4)).toBe(2);
    expect(calculateProficiencyBonus(5)).toBe(3);
    expect(calculateProficiencyBonus(8)).toBe(3);
    expect(calculateProficiencyBonus(9)).toBe(4);
    expect(calculateProficiencyBonus(12)).toBe(4);
    expect(calculateProficiencyBonus(13)).toBe(5);
    expect(calculateProficiencyBonus(16)).toBe(5);
    expect(calculateProficiencyBonus(17)).toBe(6);
    expect(calculateProficiencyBonus(20)).toBe(6);
  });
});

test.describe('Skill Calculations', () => {
  test('should calculate skill modifiers with proficiency', () => {
    const abilityScores: AbilityScores = {
      strength: 16, dexterity: 12, constitution: 14,
      intelligence: 10, wisdom: 13, charisma: 8
    };

    const athleticsSkill = {
      name: 'Athletics',
      ability: 'strength' as keyof AbilityScores,
      proficient: true,
      expertise: false
    };

    const modifier = calculateSkillModifier(athleticsSkill, abilityScores, 2);
    expect(modifier).toBe(5); // +3 (STR) + 2 (prof) = +5
  });

  test('should calculate skill modifiers with expertise', () => {
    const abilityScores: AbilityScores = {
      strength: 10, dexterity: 18, constitution: 12,
      intelligence: 12, wisdom: 14, charisma: 11
    };

    const stealthSkill = {
      name: 'Stealth',
      ability: 'dexterity' as keyof AbilityScores,
      proficient: true,
      expertise: true
    };

    const modifier = calculateSkillModifier(stealthSkill, abilityScores, 2);
    expect(modifier).toBe(8); // +4 (DEX) + 4 (expertise) = +8
  });

  test('should calculate skill modifiers without proficiency', () => {
    const abilityScores: AbilityScores = {
      strength: 10, dexterity: 14, constitution: 12,
      intelligence: 12, wisdom: 13, charisma: 8
    };

    const skill = {
      name: 'Acrobatics',
      ability: 'dexterity' as keyof AbilityScores,
      proficient: false,
      expertise: false
    };

    const modifier = calculateSkillModifier(skill, abilityScores, 2);
    expect(modifier).toBe(2); // +2 (DEX only)
  });
});

test.describe('Saving Throw Calculations', () => {
  test('should calculate saving throws with proficiency', () => {
    const abilityScores: AbilityScores = {
      strength: 16, dexterity: 12, constitution: 15,
      intelligence: 10, wisdom: 13, charisma: 8
    };

    const strSave = calculateSavingThrow('strength', abilityScores, ['strength', 'constitution'], 2);
    expect(strSave).toBe(5); // +3 (STR) + 2 (prof)

    const dexSave = calculateSavingThrow('dexterity', abilityScores, ['strength', 'constitution'], 2);
    expect(dexSave).toBe(1); // +1 (DEX) only, no proficiency
  });
});

test.describe('Experience and Level', () => {
  test('should get XP requirements for levels', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(300);
    expect(xpForLevel(5)).toBe(6500);
    expect(xpForLevel(10)).toBe(64000);
    expect(xpForLevel(20)).toBe(355000);
  });

  test('should calculate level from XP', () => {
    expect(getLevelFromXP(0)).toBe(1);
    expect(getLevelFromXP(300)).toBe(2);
    expect(getLevelFromXP(900)).toBe(3);
    expect(getLevelFromXP(6500)).toBe(5);
    expect(getLevelFromXP(100000)).toBe(12);
  });

  test('should calculate total level from multiclassing', () => {
    const classes = [
      { name: 'Fighter', level: 5, hitDie: 'd10' },
      { name: 'Rogue', level: 3, hitDie: 'd8' }
    ];

    expect(getTotalLevel(classes)).toBe(8);
  });

  test('characters should have correct XP for their level', () => {
    const character = testCharacters[0];
    const requiredXP = xpForLevel(character.level);

    expect(character.experiencePoints).toBeGreaterThanOrEqual(requiredXP);
  });
});

test.describe('Hit Points', () => {
  test('current HP should not exceed max HP', () => {
    testCharacters.forEach(character => {
      expect(character.currentHitPoints).toBeLessThanOrEqual(character.maxHitPoints);
      expect(character.currentHitPoints).toBeGreaterThanOrEqual(0);
    });
  });

  test('should track temporary HP separately', () => {
    const character = testCharacters[0];
    expect(character.temporaryHitPoints).toBeGreaterThanOrEqual(0);
  });

  test('should track hit dice', () => {
    testCharacters.forEach(character => {
      expect(Array.isArray(character.hitDice)).toBe(true);
      character.hitDice.forEach(hd => {
        expect(hd.current).toBeLessThanOrEqual(hd.total);
        expect(hd.die).toMatch(/d\d+/);
      });
    });
  });
});

test.describe('Inventory and Equipment', () => {
  test('should track inventory items', () => {
    const character = testCharacters[0];

    expect(Array.isArray(character.inventory)).toBe(true);
    if (character.inventory.length > 0) {
      const item = character.inventory[0];
      expect(item.id).toBeDefined();
      expect(item.name).toBeTruthy();
      expect(item.quantity).toBeGreaterThan(0);
      expect(item.weight).toBeGreaterThanOrEqual(0);
    }
  });

  test('should calculate total weight', () => {
    const character = testCharacters[0];
    const calculatedWeight = calculateTotalWeight(character.inventory);

    expect(calculatedWeight).toBeGreaterThanOrEqual(0);
  });

  test('should calculate total value', () => {
    const character = testCharacters[0];
    const totalValue = calculateTotalValue(character.inventory);

    expect(totalValue).toBeGreaterThanOrEqual(0);
  });

  test('should calculate max carry weight', () => {
    const character = testCharacters[0];
    const maxWeight = calculateMaxCarryWeight(character.abilityScores.strength);

    expect(maxWeight).toBe(character.abilityScores.strength * 15);
  });

  test('should track currency', () => {
    testCharacters.forEach(character => {
      expect(character.currency.copper).toBeGreaterThanOrEqual(0);
      expect(character.currency.silver).toBeGreaterThanOrEqual(0);
      expect(character.currency.electrum).toBeGreaterThanOrEqual(0);
      expect(character.currency.gold).toBeGreaterThanOrEqual(0);
      expect(character.currency.platinum).toBeGreaterThanOrEqual(0);
    });
  });

  test('should track equipped and attuned items', () => {
    const character = testCharacters[0];

    character.inventory.forEach(item => {
      expect(typeof item.equipped).toBe('boolean');
      expect(typeof item.attuned).toBe('boolean');
      expect(typeof item.magical).toBe('boolean');
    });
  });
});

test.describe('Spellcasting', () => {
  test('spellcasters should have spell slots', () => {
    const wizard = testCharacters[1]; // Elara is a wizard

    expect(wizard.spellcastingAbility).toBe('intelligence');
    expect(Array.isArray(wizard.spellSlots)).toBe(true);
    expect(wizard.spellSlots!.length).toBeGreaterThan(0);
  });

  test('spell slots should track usage', () => {
    const wizard = testCharacters[1];

    wizard.spellSlots!.forEach(slot => {
      expect(slot.used).toBeLessThanOrEqual(slot.total);
      expect(slot.level).toBeGreaterThan(0);
    });
  });

  test('should track known and prepared spells', () => {
    const wizard = testCharacters[1];

    expect(Array.isArray(wizard.knownSpells)).toBe(true);
    expect(Array.isArray(wizard.preparedSpells)).toBe(true);
    expect(wizard.preparedSpells!.length).toBeLessThanOrEqual(wizard.knownSpells!.length);
  });

  test('non-spellcasters should not have spell data', () => {
    const fighter = testCharacters[0]; // Thorgrim is a fighter

    expect(fighter.spellcastingAbility).toBeUndefined();
  });
});

test.describe('Character Creation', () => {
  test('should create default character', () => {
    const playerId = 'player-test-123';
    const character = createDefaultCharacter(playerId);

    expect(character.playerId).toBe(playerId);
    expect(character.level).toBe(1);
    expect(character.race).toBe('Human');
    expect(character.classes[0].name).toBe('Fighter');
    expect(character.maxHitPoints).toBe(10);
    expect(character.proficiencyBonus).toBe(2);
  });

  test('default character should have 10 in all abilities', () => {
    const character = createDefaultCharacter('player-1');

    Object.values(character.abilityScores).forEach(score => {
      expect(score).toBe(10);
    });
  });
});

test.describe('Character Integration', () => {
  test('should link to campaign', () => {
    const character = testCharacters[0];

    expect(character.campaignId).toBe('campaign-1');
    expect(character.playerId).toBe('player-1');
  });

  test('should have fighter with high strength', () => {
    const fighter = testCharacters[0];

    expect(fighter.classes[0].name).toBe('Fighter');
    expect(fighter.abilityScores.strength).toBeGreaterThan(14);
  });

  test('should have wizard with high intelligence', () => {
    const wizard = testCharacters[1];

    expect(wizard.classes[0].name).toBe('Wizard');
    expect(wizard.abilityScores.intelligence).toBeGreaterThan(14);
  });

  test('should have rogue with high dexterity and expertise', () => {
    const rogue = testCharacters[2];

    expect(rogue.classes[0].name).toBe('Rogue');
    expect(rogue.abilityScores.dexterity).toBeGreaterThan(14);

    const expertiseSkills = rogue.skills.filter(s => s.expertise);
    expect(expertiseSkills.length).toBeGreaterThan(0);
  });
});

test.describe('Character Features and Traits', () => {
  test('should have class features', () => {
    testCharacters.forEach(character => {
      expect(Array.isArray(character.features)).toBe(true);
      expect(character.features.length).toBeGreaterThan(0);
    });
  });

  test('should have racial traits', () => {
    testCharacters.forEach(character => {
      expect(Array.isArray(character.traits)).toBe(true);
    });
  });

  test('fighter should have Second Wind and Action Surge', () => {
    const fighter = testCharacters[0];

    expect(fighter.features).toContain('Second Wind');
    expect(fighter.features).toContain('Action Surge');
  });

  test('wizard should have Spellcasting', () => {
    const wizard = testCharacters[1];

    expect(wizard.features.some(f => f.includes('Spellcasting'))).toBe(true);
  });

  test('rogue should have Sneak Attack', () => {
    const rogue = testCharacters[2];

    expect(rogue.features.some(f => f.includes('Sneak Attack'))).toBe(true);
  });
});
