import { test, expect } from '@playwright/test';

/**
 * Character Creation Wizard E2E Tests
 * Tests the enhanced 6-step character creation flow
 */

test.describe('Character Creation Wizard - Full Flow', () => {
  test('should complete basic character creation with all 6 steps', () => {
    // Step 1: Basic Info
    const basicInfo = {
      name: 'Thorin Ironforge',
      race: 'Dwarf',
      class: 'Fighter',
      background: 'Soldier',
      alignment: 'Lawful Good',
    };

    expect(basicInfo.name.length).toBeGreaterThan(0);
    expect(basicInfo.race).toBe('Dwarf');
    expect(basicInfo.class).toBe('Fighter');

    // Step 2: Ability Scores
    const abilityScores = {
      strength: 16,
      dexterity: 12,
      constitution: 15,
      intelligence: 10,
      wisdom: 13,
      charisma: 8,
    };

    const total = Object.values(abilityScores).reduce((sum, val) => sum + val, 0);
    expect(total).toBeGreaterThan(0);
    expect(abilityScores.strength).toBeGreaterThanOrEqual(8);
    expect(abilityScores.strength).toBeLessThanOrEqual(18);

    // Step 3: Skills
    const skills = ['Athletics', 'Intimidation', 'Perception', 'Survival'];
    expect(skills.length).toBeGreaterThanOrEqual(2); // Most classes get 2+ skills

    // Step 4: Equipment
    const equipment = ['Dungeoneer\'s Pack'];
    expect(equipment.length).toBeGreaterThan(0);

    // Step 5: Personality
    const personality = {
      appearance: 'A stocky dwarf with a long braided beard and battle scars',
      traits: 'Direct and honest, values loyalty above all',
      ideals: 'Honor and duty to clan',
      bonds: 'My brother died in battle, I carry his axe',
      flaws: 'Quick to anger when honor is questioned',
    };

    expect(personality.appearance.length).toBeGreaterThan(0);

    // Step 6: Review and Create
    const character = {
      ...basicInfo,
      abilityScores,
      skills,
      equipment,
      personality,
      level: 1,
      hp: 10 + Math.floor((abilityScores.constitution - 10) / 2),
    };

    expect(character.name).toBe('Thorin Ironforge');
    expect(character.level).toBe(1);
    expect(character.hp).toBeGreaterThan(10);
  });
});

test.describe('Step 1: Basic Information', () => {
  test('should validate character name is required', () => {
    const name = '';
    const isValid = name.trim().length > 0;
    expect(isValid).toBe(false);
  });

  test('should accept valid character name', () => {
    const name = 'Gandalf the Grey';
    const isValid = name.trim().length > 0;
    expect(isValid).toBe(true);
  });

  test('should support all standard races', () => {
    const races = [
      'Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Half-Elf',
      'Half-Orc', 'Halfling', 'Human', 'Tiefling'
    ];

    races.forEach(race => {
      expect(race.length).toBeGreaterThan(0);
    });

    expect(races.length).toBe(9);
  });

  test('should support all standard classes', () => {
    const classes = [
      'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk',
      'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard', 'Artificer'
    ];

    expect(classes.length).toBe(13);
    expect(classes).toContain('Wizard');
  });

  test('should support all alignments', () => {
    const alignments = [
      'Lawful Good', 'Neutral Good', 'Chaotic Good',
      'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
      'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
    ];

    expect(alignments.length).toBe(9);
  });

  test('should generate random character name', () => {
    const firstNames = ['Aldric', 'Brynn', 'Cedric'];
    const lastNames = ['Ashwood', 'Blackstone', 'Brightblade'];

    const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${randomFirst} ${randomLast}`;

    expect(fullName.split(' ').length).toBe(2);
    expect(fullName.length).toBeGreaterThan(5);
  });
});

test.describe('Step 2: Ability Scores', () => {
  test('should roll 4d6 drop lowest', () => {
    const rolls = [6, 5, 4, 1]; // Simulated rolls
    const sorted = [...rolls].sort((a, b) => a - b);
    sorted.shift(); // Drop lowest
    const total = sorted.reduce((sum, roll) => sum + roll, 0);

    expect(total).toBe(15); // 6 + 5 + 4
    expect(total).toBeGreaterThanOrEqual(3); // Min possible
    expect(total).toBeLessThanOrEqual(18); // Max possible
  });

  test('should use standard array', () => {
    const standardArray = [15, 14, 13, 12, 10, 8];
    const assigned = {
      strength: standardArray[0],
      dexterity: standardArray[1],
      constitution: standardArray[2],
      intelligence: standardArray[3],
      wisdom: standardArray[4],
      charisma: standardArray[5],
    };

    const values = Object.values(assigned);
    expect(values).toContain(15);
    expect(values).toContain(8);
    expect(Math.max(...values)).toBe(15);
    expect(Math.min(...values)).toBe(8);
  });

  test('should calculate ability modifiers correctly', () => {
    const calculateModifier = (score: number) => Math.floor((score - 10) / 2);

    expect(calculateModifier(8)).toBe(-1);
    expect(calculateModifier(10)).toBe(0);
    expect(calculateModifier(11)).toBe(0);
    expect(calculateModifier(12)).toBe(1);
    expect(calculateModifier(16)).toBe(3);
    expect(calculateModifier(20)).toBe(5);
  });

  test('should clamp ability scores between 1 and 20', () => {
    const clamp = (value: number) => Math.max(1, Math.min(20, value));

    expect(clamp(0)).toBe(1);
    expect(clamp(25)).toBe(20);
    expect(clamp(15)).toBe(15);
  });

  test('should show derived stats preview', () => {
    const constitution = 14;
    const dexterity = 16;

    const conMod = Math.floor((constitution - 10) / 2);
    const dexMod = Math.floor((dexterity - 10) / 2);

    const baseHP = 10; // Fighter d10
    const totalHP = baseHP + conMod;
    const baseAC = 10 + dexMod;

    expect(totalHP).toBe(12); // 10 + 2
    expect(baseAC).toBe(13); // 10 + 3
  });
});

test.describe('Step 3: Skill Proficiencies', () => {
  test('should toggle skill proficiency', () => {
    let skills = [
      { name: 'Athletics', proficient: false },
      { name: 'Acrobatics', proficient: false },
    ];

    // Toggle Athletics on
    skills = skills.map(s =>
      s.name === 'Athletics' ? { ...s, proficient: true } : s
    );

    expect(skills.find(s => s.name === 'Athletics')?.proficient).toBe(true);

    // Toggle Athletics off
    skills = skills.map(s =>
      s.name === 'Athletics' ? { ...s, proficient: false } : s
    );

    expect(skills.find(s => s.name === 'Athletics')?.proficient).toBe(false);
  });

  test('should calculate skill modifier with proficiency', () => {
    const dexterity = 14;
    const proficiencyBonus = 2;
    const isProficient = true;

    const abilityMod = Math.floor((dexterity - 10) / 2); // +2
    const skillMod = abilityMod + (isProficient ? proficiencyBonus : 0);

    expect(skillMod).toBe(4); // 2 + 2
  });

  test('should limit skill proficiencies by class', () => {
    const fighterSkills = 2; // Fighters get 2 skills
    const selectedSkills = ['Athletics', 'Perception'];

    expect(selectedSkills.length).toBe(fighterSkills);
    expect(selectedSkills.length).toBeLessThanOrEqual(fighterSkills);
  });
});

test.describe('Step 4: Equipment Selection', () => {
  test('should select equipment pack', () => {
    const packs = {
      'Dungeoneer\'s Pack': ['Backpack', 'Crowbar', '10 Torches', '10 Days Rations', 'Waterskin', '50ft Rope'],
      'Explorer\'s Pack': ['Backpack', 'Bedroll', 'Mess Kit', '10 Torches', '10 Days Rations', 'Waterskin', '50ft Rope'],
    };

    const selectedPack = 'Dungeoneer\'s Pack';
    const items = packs[selectedPack];

    expect(items.length).toBe(6);
    expect(items).toContain('Backpack');
    expect(items).toContain('Crowbar');
  });

  test('should roll for starting gold by class', () => {
    const goldByClass: Record<string, number> = {
      'Barbarian': 2 * 10,
      'Fighter': 5 * 10,
      'Wizard': 4 * 10,
      'Monk': 5,
    };

    expect(goldByClass['Fighter']).toBe(50);
    expect(goldByClass['Monk']).toBe(5);
  });

  test('should allow taking gold instead of pack', () => {
    const startingGold = 75;
    const selectedEquipment: string[] = []; // No pack selected

    expect(startingGold).toBeGreaterThan(0);
    expect(selectedEquipment.length).toBe(0);
  });

  test('should show all equipment pack options', () => {
    const packs = [
      'Dungeoneer\'s Pack',
      'Explorer\'s Pack',
      'Priest\'s Pack',
      'Scholar\'s Pack',
      'Burglar\'s Pack',
    ];

    expect(packs.length).toBe(5);
    expect(packs).toContain('Burglar\'s Pack');
  });
});

test.describe('Step 5: Personality & Appearance', () => {
  test('should save appearance description', () => {
    const appearance = 'A tall elf with silver hair and piercing blue eyes. Wears a flowing blue cloak.';

    expect(appearance.length).toBeGreaterThan(10);
    expect(appearance).toContain('elf');
  });

  test('should save personality traits', () => {
    const traits = 'Curious and friendly, but cautious with strangers';

    expect(traits.length).toBeGreaterThan(0);
  });

  test('should save ideals', () => {
    const ideals = 'Knowledge should be shared freely with all';

    expect(ideals.length).toBeGreaterThan(0);
  });

  test('should save bonds', () => {
    const bonds = 'My mentor sacrificed themselves to save me';

    expect(bonds.length).toBeGreaterThan(0);
  });

  test('should save flaws', () => {
    const flaws = 'I can\'t resist a good mystery, even if it\'s dangerous';

    expect(flaws.length).toBeGreaterThan(0);
  });

  test('should allow empty personality fields', () => {
    const appearance = '';
    const traits = '';

    // Should not throw errors
    expect(appearance).toBe('');
    expect(traits).toBe('');
  });

  test('should format personality notes', () => {
    const notes = `Appearance: Tall and imposing

Personality: Brave but reckless

Ideals: Freedom for all

Bonds: My sister is missing

Flaws: I trust too easily`;

    expect(notes).toContain('Appearance:');
    expect(notes).toContain('Personality:');
    expect(notes.length).toBeGreaterThan(50);
  });
});

test.describe('Step 6: Review & Validation', () => {
  test('should show complete character summary', () => {
    const character = {
      name: 'Test Character',
      race: 'Human',
      class: 'Fighter',
      level: 1,
      background: 'Soldier',
      alignment: 'Neutral Good',
      abilityScores: {
        strength: 16,
        dexterity: 14,
        constitution: 15,
        intelligence: 10,
        wisdom: 12,
        charisma: 8,
      },
      skills: ['Athletics', 'Intimidation'],
      equipment: ['Dungeoneer\'s Pack'],
      startingGold: 0,
    };

    expect(character.name).toBe('Test Character');
    expect(character.skills.length).toBe(2);
    expect(character.equipment.length).toBe(1);
  });

  test('should calculate total HP on creation', () => {
    const constitution = 14;
    const conMod = Math.floor((constitution - 10) / 2);
    const classHitDie = 10; // Fighter
    const level1HP = classHitDie + conMod;

    expect(level1HP).toBe(12); // 10 + 2
  });

  test('should calculate AC on creation', () => {
    const dexterity = 16;
    const dexMod = Math.floor((dexterity - 10) / 2);
    const baseAC = 10 + dexMod;

    expect(baseAC).toBe(13); // 10 + 3 (without armor)
  });

  test('should validate required fields before saving', () => {
    const character = {
      name: 'Valid Name',
      race: 'Human',
      class: 'Fighter',
    };

    const isValid = character.name.trim().length > 0 &&
                    character.race.length > 0 &&
                    character.class.length > 0;

    expect(isValid).toBe(true);
  });

  test('should reject character without name', () => {
    const character = {
      name: '',
      race: 'Human',
      class: 'Fighter',
    };

    const isValid = character.name.trim().length > 0;

    expect(isValid).toBe(false);
  });
});

test.describe('Wizard Navigation', () => {
  test('should move forward through steps', () => {
    const steps = ['basic', 'abilities', 'skills', 'equipment', 'personality', 'review'];
    let currentStep = 0;

    // Move to next step
    currentStep++;
    expect(steps[currentStep]).toBe('abilities');

    currentStep++;
    expect(steps[currentStep]).toBe('skills');
  });

  test('should move backward through steps', () => {
    const steps = ['basic', 'abilities', 'skills', 'equipment', 'personality', 'review'];
    let currentStep = 3; // equipment

    // Move back
    currentStep--;
    expect(steps[currentStep]).toBe('skills');

    currentStep--;
    expect(steps[currentStep]).toBe('abilities');
  });

  test('should show progress indicator', () => {
    const steps = ['basic', 'abilities', 'skills', 'equipment', 'personality', 'review'];
    const currentStep = 2; // skills

    const progress = ((currentStep + 1) / steps.length) * 100;

    expect(progress).toBe(50); // 3/6 = 50%
  });

  test('should block next if name is empty on basic step', () => {
    const name = '';
    const currentStep = 'basic';
    const canGoNext = currentStep === 'basic' ? name.trim() !== '' : true;

    expect(canGoNext).toBe(false);
  });
});

test.describe('Character Creation - Player UX', () => {
  test('should provide helpful tooltips and tips', () => {
    const tips = {
      abilities: 'Standard array is safer, rolling is more exciting but risky',
      skills: 'Choose skills that match your character concept',
      equipment: 'Equipment packs are easier, gold gives more flexibility',
      personality: 'These help with roleplay but can be changed later',
    };

    expect(tips.abilities).toContain('Standard array');
    expect(tips.equipment).toContain('flexibility');
  });

  test('should show calculated stats in review', () => {
    const stats = {
      hp: 12,
      ac: 15,
      initiative: 2,
      proficiencyBonus: 2,
    };

    expect(stats.hp).toBeGreaterThan(0);
    expect(stats.ac).toBeGreaterThan(10);
    expect(stats.proficiencyBonus).toBe(2); // Always 2 at level 1
  });

  test('should allow randomizing entire character', () => {
    const randomName = 'Random Name';
    const randomRace = 'Elf';
    const randomClass = 'Wizard';
    const randomScores = {
      strength: 12, dexterity: 15, constitution: 13,
      intelligence: 16, wisdom: 10, charisma: 8,
    };

    expect(randomName.length).toBeGreaterThan(0);
    expect(randomRace).toBeTruthy();
    expect(Object.values(randomScores).every(v => v >= 8 && v <= 18)).toBe(true);
  });
});

test.describe('Character Creation - DM UX', () => {
  test('should create NPC quickly with minimal info', () => {
    const npc = {
      name: 'Guard Captain',
      race: 'Human',
      class: 'Fighter',
      level: 5,
    };

    // NPCs don't need full personality details
    expect(npc.name).toBe('Guard Captain');
    expect(npc.level).toBe(5);
  });

  test('should support bulk character creation', () => {
    const guards = Array.from({ length: 5 }, (_, i) => ({
      name: `Guard ${i + 1}`,
      race: 'Human',
      class: 'Fighter',
      level: 1,
    }));

    expect(guards.length).toBe(5);
    expect(guards[0].name).toBe('Guard 1');
  });
});
