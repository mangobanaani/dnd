import { test, expect } from '@playwright/test';
import {
  Monster,
  crToNumber,
  crToXP,
  getEncounterMultiplier,
  calculateAdjustedXP,
} from '@/app/types/monster';
import { testMonsters } from './fixtures/test-data';

test.describe('Monster Structure Tests', () => {
  test('should have valid monster structure', () => {
    const monster = testMonsters[0];

    expect(monster.name).toBeTruthy();
    expect(monster.size).toBeTruthy();
    expect(monster.type).toBeTruthy();
    expect(monster.cr).toMatch(/^\d+$|^1\/\d+$/);
    expect(monster.environments).toBeDefined();
  });

  test('should have all environment flags', () => {
    const monster = testMonsters[0];
    const envKeys = [
      'arctic', 'coastal', 'desert', 'forest', 'grassland', 'hill',
      'mountain', 'swamp', 'underdark', 'underwater', 'urban', 'other'
    ];

    envKeys.forEach(env => {
      expect(typeof monster.environments[env as keyof typeof monster.environments]).toBe('boolean');
    });
  });

  test('should have boolean ability flags', () => {
    testMonsters.forEach(monster => {
      expect(typeof monster.spellUser).toBe('boolean');
      expect(typeof monster.legendaryActions).toBe('boolean');
      expect(typeof monster.lairActions).toBe('boolean');
    });
  });
});

test.describe('Challenge Rating', () => {
  test('should convert CR strings to numbers', () => {
    expect(crToNumber('0')).toBe(0);
    expect(crToNumber('1/8')).toBe(0.125);
    expect(crToNumber('1/4')).toBe(0.25);
    expect(crToNumber('1/2')).toBe(0.5);
    expect(crToNumber('1')).toBe(1);
    expect(crToNumber('5')).toBe(5);
    expect(crToNumber('20')).toBe(20);
  });

  test('should calculate XP from CR', () => {
    expect(crToXP('0')).toBe(10);
    expect(crToXP('1/4')).toBe(50);
    expect(crToXP('1/2')).toBe(100);
    expect(crToXP('1')).toBe(200);
    expect(crToXP('5')).toBe(1800);
    expect(crToXP('10')).toBe(5900);
    expect(crToXP('20')).toBe(25000);
    expect(crToXP('24')).toBe(62000);
  });

  test('test monsters should have valid CR to XP conversions', () => {
    testMonsters.forEach(monster => {
      const xp = crToXP(monster.cr);
      expect(xp).toBeGreaterThan(0);
    });
  });
});

test.describe('Encounter Building', () => {
  test('should calculate encounter multiplier correctly', () => {
    expect(getEncounterMultiplier(1)).toBe(1);
    expect(getEncounterMultiplier(2)).toBe(1.5);
    expect(getEncounterMultiplier(3)).toBe(2);
    expect(getEncounterMultiplier(6)).toBe(2);
    expect(getEncounterMultiplier(7)).toBe(2.5);
    expect(getEncounterMultiplier(10)).toBe(2.5);
    expect(getEncounterMultiplier(11)).toBe(3);
    expect(getEncounterMultiplier(14)).toBe(3);
    expect(getEncounterMultiplier(15)).toBe(4);
    expect(getEncounterMultiplier(20)).toBe(4);
  });

  test('should calculate adjusted XP for single monster', () => {
    const goblin = testMonsters[0]; // CR 1/4
    const adjustedXP = calculateAdjustedXP([goblin]);

    expect(adjustedXP).toBe(50); // 50 XP * 1 multiplier
  });

  test('should calculate adjusted XP for multiple monsters', () => {
    const goblins = [testMonsters[0], testMonsters[0], testMonsters[0]]; // 3 goblins
    const adjustedXP = calculateAdjustedXP(goblins);

    expect(adjustedXP).toBe(300); // 150 XP * 2 multiplier
  });

  test('should calculate adjusted XP for mixed encounter', () => {
    const encounter = [
      testMonsters[0], // Goblin CR 1/4 = 50 XP
      testMonsters[1], // Orc CR 1/2 = 100 XP
    ];
    const adjustedXP = calculateAdjustedXP(encounter);

    expect(adjustedXP).toBe(225); // 150 total * 1.5 multiplier
  });
});

test.describe('Monster Types and Sizes', () => {
  test('should have valid monster sizes', () => {
    const validSizes = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal'];

    testMonsters.forEach(monster => {
      expect(validSizes).toContain(monster.size);
    });
  });

  test('should have goblin as Small', () => {
    const goblin = testMonsters[0];
    expect(goblin.size).toBe('Small');
  });

  test('should have Ancient Red Dragon as Gargantuan', () => {
    const dragon = testMonsters[2];
    expect(dragon.size).toBe('Gargantuan');
  });

  test('should have valid monster types', () => {
    testMonsters.forEach(monster => {
      expect(monster.type).toBeTruthy();
      expect(typeof monster.type).toBe('string');
    });
  });
});

test.describe('Monster Abilities', () => {
  test('legendary monsters should have legendary actions', () => {
    const dragon = testMonsters[2];

    expect(dragon.legendaryActions).toBe(true);
    expect(dragon.reaction).toBeTruthy();
  });

  test('dragon should have lair actions', () => {
    const dragon = testMonsters[2];

    expect(dragon.lairActions).toBe(true);
  });

  test('dragon should be a spellcaster', () => {
    const dragon = testMonsters[2];

    expect(dragon.spellUser).toBe(true);
  });

  test('goblin should not have legendary abilities', () => {
    const goblin = testMonsters[0];

    expect(goblin.legendaryActions).toBe(false);
    expect(goblin.lairActions).toBe(false);
    expect(goblin.spellUser).toBe(false);
  });
});

test.describe('Monster Environments', () => {
  test('goblin should be in forest and hills', () => {
    const goblin = testMonsters[0];

    expect(goblin.environments.forest).toBe(true);
    expect(goblin.environments.hill).toBe(true);
  });

  test('dragon should be in mountains', () => {
    const dragon = testMonsters[2];

    expect(dragon.environments.mountain).toBe(true);
  });

  test('owlbear should be in forests', () => {
    const owlbear = testMonsters[3];

    expect(owlbear.environments.forest).toBe(true);
  });

  test('should filter monsters by environment', () => {
    const forestMonsters = testMonsters.filter(m => m.environments.forest);

    expect(forestMonsters.length).toBeGreaterThan(0);
    expect(forestMonsters.some(m => m.name === 'Goblin')).toBe(true);
  });
});

test.describe('Monster Actions and Abilities', () => {
  test('monsters should have actions defined', () => {
    testMonsters.forEach(monster => {
      expect(typeof monster.actions).toBe('string');
    });
  });

  test('monsters should have abilities defined', () => {
    testMonsters.forEach(monster => {
      expect(typeof monster.abilities).toBe('string');
    });
  });

  test('goblin should have Nimble Escape', () => {
    const goblin = testMonsters[0];

    expect(goblin.abilities).toContain('Nimble Escape');
  });

  test('orc should have Aggressive ability', () => {
    const orc = testMonsters[1];

    expect(orc.abilities).toContain('Aggressive');
  });

  test('dragon should have Breath Weapon', () => {
    const dragon = testMonsters[2];

    expect(dragon.actions).toContain('Breath');
  });
});

test.describe('Monster Movement', () => {
  test('dragon should fly', () => {
    const dragon = testMonsters[2];

    expect(dragon.movement).toContain('Fly');
  });

  test('non-flying monsters should have empty movement', () => {
    const goblin = testMonsters[0];
    const orc = testMonsters[1];

    expect(goblin.movement).toBe('');
    expect(orc.movement).toBe('');
  });
});

test.describe('Monster Source Information', () => {
  test('monsters should have source book', () => {
    testMonsters.forEach(monster => {
      expect(monster.sourceBook).toBeTruthy();
    });
  });

  test('monsters should have page numbers', () => {
    testMonsters.forEach(monster => {
      expect(monster.sourcePage).toBeTruthy();
    });
  });

  test('test monsters are from MM (Monster Manual)', () => {
    testMonsters.forEach(monster => {
      expect(monster.sourceBook).toBe('MM');
    });
  });
});

test.describe('Encounter Difficulty by Party Level', () => {
  test('should calculate difficulty for level 1 party', () => {
    const goblins = [testMonsters[0], testMonsters[0]]; // 2 goblins
    const adjustedXP = calculateAdjustedXP(goblins);

    // For 4 level 1 characters:
    // Easy: 100, Medium: 200, Hard: 300, Deadly: 400
    expect(adjustedXP).toBe(150); // Easy encounter
  });

  test('should create deadly encounter with dragon', () => {
    const dragon = testMonsters[2]; // CR 24
    const adjustedXP = calculateAdjustedXP([dragon]);

    // 62,000 XP is deadly for any party below level 20
    expect(adjustedXP).toBe(62000);
  });

  test('should scale difficulty with monster count', () => {
    const singleGoblin = calculateAdjustedXP([testMonsters[0]]);
    const twoGoblins = calculateAdjustedXP([testMonsters[0], testMonsters[0]]);
    const fourGoblins = calculateAdjustedXP([
      testMonsters[0],
      testMonsters[0],
      testMonsters[0],
      testMonsters[0],
    ]);

    expect(twoGoblins).toBeGreaterThan(singleGoblin * 2);
    expect(fourGoblins).toBeGreaterThan(twoGoblins * 2);
  });
});
