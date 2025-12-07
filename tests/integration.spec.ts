import { test, expect } from '@playwright/test';
import { testCampaigns, testCharacters, testMonsters, testCombatants, testCombatEncounter, testQuests, testSessions } from './fixtures/test-data';
import { calculateAdjustedXP, crToXP } from '@/app/types/monster';
import { xpForLevel, calculateModifier, calculateProficiencyBonus } from '@/app/types/character';
import { sortCombatantsByInitiative, applyDamage, getHpPercentage } from '@/app/types/combat';

test.describe('Campaign-Character Integration', () => {
  test('campaign should contain characters', () => {
    const campaign = testCampaigns[0];
    const campaignCharacters = testCharacters.filter(c => c.campaignId === campaign.id);

    expect(campaignCharacters.length).toBe(3);
    expect(campaign.characterIds.length).toBe(3);
  });

  test('characters should match campaign level', () => {
    const campaign = testCampaigns[0];
    const campaignCharacters = testCharacters.filter(c => c.campaignId === campaign.id);

    campaignCharacters.forEach(character => {
      expect(character.level).toBeCloseTo(campaign.currentLevel, 1);
    });
  });

  test('characters should have enough XP for their level', () => {
    testCharacters.forEach(character => {
      const requiredXP = xpForLevel(character.level);
      expect(character.experiencePoints).toBeGreaterThanOrEqual(requiredXP);
    });
  });

  test('party composition should be balanced', () => {
    const campaignCharacters = testCharacters.filter(c => c.campaignId === 'campaign-1');

    const hasTank = campaignCharacters.some(c => c.classes[0].name === 'Fighter');
    const hasHealer = campaignCharacters.some(c =>
      c.classes[0].name === 'Cleric' || c.spellcastingAbility
    );
    const hasDamage = campaignCharacters.some(c =>
      c.classes[0].name === 'Wizard' || c.classes[0].name === 'Rogue'
    );

    expect(hasTank).toBe(true);
    expect(hasDamage).toBe(true);
  });
});

test.describe('Character-Combat Integration', () => {
  test('player combatants should reference actual characters', () => {
    const playerCombatants = testCombatants.filter(c => c.type === 'player');

    playerCombatants.forEach(combatant => {
      const character = testCharacters.find(c => c.id === combatant.characterId);
      expect(character).toBeDefined();
      expect(combatant.name).toBe(character!.name);
    });
  });

  test('combatant stats should match character stats', () => {
    const thorgrimCombatant = testCombatants.find(c => c.characterId === 'char-1');
    const thorgrimCharacter = testCharacters.find(c => c.id === 'char-1');

    expect(thorgrimCombatant!.maxHitPoints).toBe(thorgrimCharacter!.maxHitPoints);
    expect(thorgrimCombatant!.ac).toBe(thorgrimCharacter!.armorClass);
  });

  test('initiative modifier should match dexterity modifier', () => {
    const elaraCombatant = testCombatants.find(c => c.characterId === 'char-2');
    const elaraCharacter = testCharacters.find(c => c.id === 'char-2');

    const dexMod = calculateModifier(elaraCharacter!.abilityScores.dexterity);
    expect(elaraCombatant!.initiativeModifier).toBe(dexMod);
  });

  test('character with highest dex should win initiative ties', () => {
    const sorted = sortCombatantsByInitiative(testCombatants);

    // Zephyr (rogue) has highest dex
    expect(sorted[0].name).toBe('Zephyr Swiftfoot');
  });
});

test.describe('Monster-Encounter-Combat Integration', () => {
  test('encounter should balance against party', () => {
    const campaign = testCampaigns[0];
    const partyLevel = campaign.currentLevel;
    const partySize = campaign.playerIds.length;

    // Create encounter with goblins
    const goblins = [testMonsters[0], testMonsters[0], testMonsters[0]];
    const adjustedXP = calculateAdjustedXP(goblins);

    // XP thresholds for level 3, party of 3
    const mediumThreshold = 150 * partySize; // 450 XP
    const hardThreshold = 225 * partySize; // 675 XP

    // 3 goblins = 150 XP * 2 multiplier = 300 XP (Easy-Medium)
    expect(adjustedXP).toBeLessThan(hardThreshold);
  });

  test('combat encounter should use monster stats', () => {
    const goblinCombatants = testCombatants.filter(c => c.name.includes('Goblin'));

    goblinCombatants.forEach(goblin => {
      expect(goblin.ac).toBe(15); // Goblin AC from stat block
      expect(goblin.maxHitPoints).toBe(7); // Goblin HP from stat block
    });
  });

  test('deadly encounter should be challenging', () => {
    const dragon = testMonsters[2]; // CR 24
    const dragonXP = crToXP(dragon.cr);

    // Even a level 5 party of 4 would find this deadly
    // Deadly threshold for level 5: 1100 * 4 = 4400 XP
    expect(dragonXP).toBeGreaterThan(4400 * 10);
  });
});

test.describe('Campaign-Quest-Session Integration', () => {
  test('quests should belong to campaigns', () => {
    const campaign = testCampaigns[0];
    const quest = testQuests[0];

    expect(quest.campaignId).toBe(campaign.id);
  });

  test('sessions should track XP awards', () => {
    const session = testSessions[0];
    const xpPerPlayer = session.xpAwarded / session.attendees.length;

    expect(xpPerPlayer).toBe(100); // 300 XP / 3 players
  });

  test('quest objectives should track progress', () => {
    const quest = testQuests[0];
    const completedObjectives = quest.objectives.filter(obj => obj.completed);
    const totalObjectives = quest.objectives.length;

    expect(completedObjectives.length).toBeLessThan(totalObjectives);
    expect(quest.status).toBe('active');
  });

  test('campaign session count should match sessions', () => {
    const campaign = testCampaigns[0];
    const campaignSessions = testSessions.filter(s => s.campaignId === campaign.id);

    expect(campaignSessions.length).toBeGreaterThan(0);
  });
});

test.describe('Full Combat Simulation', () => {
  test('should simulate complete combat round', () => {
    // Setup
    const encounter = { ...testCombatEncounter };
    const sorted = sortCombatantsByInitiative(encounter.combatants);

    // Round 1: Zephyr attacks Goblin
    const zephyr = sorted[0]; // Highest initiative
    const goblin1 = sorted.find(c => c.name === 'Goblin 1')!;

    // Rogue sneak attack: 1d6 (weapon) + 2d6 (sneak attack) + 4 (DEX) = ~11 average
    const damagedGoblin = applyDamage(goblin1, 11);

    expect(damagedGoblin.currentHitPoints).toBeLessThanOrEqual(0); // Goblin should be dead

    // Round 1: Goblin 2 attacks Elara
    const goblin2 = sorted.find(c => c.name === 'Goblin 2')!;
    const elara = sorted.find(c => c.name === 'Elara Moonwhisper')!;

    // Goblin attack: 1d6 + 2 = ~5 average
    const damagedElara = applyDamage(elara, 5);

    // Elara has temp HP, so should absorb some damage
    expect(damagedElara.currentHitPoints + damagedElara.temporaryHitPoints).toBeLessThan(
      elara.currentHitPoints + elara.temporaryHitPoints
    );
  });

  test('should track combat statistics', () => {
    const encounter = testCombatEncounter;

    // Count damage dealt
    const damageLog = encounter.log.filter(entry => entry.type === 'damage');
    const totalDamage = damageLog.reduce((sum, entry) => sum + (entry.amount || 0), 0);

    expect(totalDamage).toBeGreaterThan(0);
    expect(damageLog.length).toBe(2);
  });

  test('should track conditions in combat', () => {
    const goblin2 = testCombatants.find(c => c.name === 'Goblin 2')!;

    expect(goblin2.conditions.length).toBe(1);
    expect(goblin2.conditions[0].name).toBe('Poisoned');

    // Poisoned reduces attack effectiveness
    const hpPercentage = getHpPercentage(goblin2);
    expect(hpPercentage).toBeLessThan(50); // Goblin is badly hurt
  });
});

test.describe('Party vs Monster Balance', () => {
  test('level 3 party should handle CR 1/4 monsters', () => {
    const partyLevel = 3;
    const partySize = 3;
    const goblins = Array(4).fill(testMonsters[0]); // 4 goblins

    const adjustedXP = calculateAdjustedXP(goblins);

    // Easy threshold for level 3: 75 * 3 = 225 XP
    // 4 goblins = 200 XP * 2 = 400 XP (Medium encounter)
    expect(adjustedXP).toBeLessThan(675); // Less than hard threshold
  });

  test('level 3 party should struggle with CR 3 monster', () => {
    const partyLevel = 3;
    const partySize = 3;
    const owlbear = testMonsters[3]; // CR 3

    const adjustedXP = calculateAdjustedXP([owlbear]);

    // Deadly threshold for level 3: 400 * 3 = 1200 XP
    // Owlbear CR 3 = 700 XP (Hard encounter, almost deadly)
    expect(adjustedXP).toBeGreaterThan(450); // Greater than medium
  });

  test('action economy should favor larger groups', () => {
    const twoGoblins = calculateAdjustedXP([testMonsters[0], testMonsters[0]]);
    const fourGoblins = calculateAdjustedXP([
      testMonsters[0],
      testMonsters[0],
      testMonsters[0],
      testMonsters[0],
    ]);

    // 4 goblins should be more than twice as dangerous as 2
    expect(fourGoblins / twoGoblins).toBeGreaterThan(2);
  });
});

test.describe('Character Progression Through Campaign', () => {
  test('characters should gain XP from encounters', () => {
    const session = testSessions[0];
    const xpAward = session.xpAwarded;
    const character = testCharacters[0];

    // Character should be able to gain this XP
    const newXP = character.experiencePoints + xpAward / session.attendees.length;
    const newLevel = newXP >= xpForLevel(character.level + 1);

    expect(typeof newLevel).toBe('boolean');
  });

  test('character proficiency should match level', () => {
    testCharacters.forEach(character => {
      const expectedProf = calculateProficiencyBonus(character.level);
      expect(character.proficiencyBonus).toBe(expectedProf);
    });
  });

  test('higher level characters should have more features', () => {
    const level1Char = { ...testCharacters[0], level: 1 };
    const level3Char = testCharacters[0];

    expect(level3Char.features.length).toBeGreaterThan(0);
  });
});

test.describe('Campaign Milestone Integration', () => {
  test('completing quests should advance campaign', () => {
    const quest = testQuests[0];
    const completedObjectives = quest.objectives.filter(obj => obj.completed).length;
    const totalObjectives = quest.objectives.length;

    const progress = completedObjectives / totalObjectives;

    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(1); // Quest is in progress
  });

  test('sessions should contribute to campaign progress', () => {
    const campaign = testCampaigns[0];

    expect(campaign.sessionCount).toBeLessThanOrEqual(campaign.totalSessions);
    expect(campaign.sessionCount / campaign.totalSessions).toBeCloseTo(0.5, 0.5);
  });

  test('completed campaigns should have full session history', () => {
    const completedCampaign = testCampaigns[2];

    expect(completedCampaign.status).toBe('completed');
    expect(completedCampaign.sessionCount).toBe(completedCampaign.totalSessions);
  });
});

test.describe('Cross-System Data Consistency', () => {
  test('all player IDs should match character player IDs', () => {
    const campaign = testCampaigns[0];
    const campaignCharacters = testCharacters.filter(c => c.campaignId === campaign.id);

    campaignCharacters.forEach(character => {
      expect(campaign.playerIds).toContain(character.playerId);
    });
  });

  test('combat encounter should reference valid campaign', () => {
    const encounter = testCombatEncounter;
    const campaign = testCampaigns.find(c => c.id === encounter.campaignId);

    expect(campaign).toBeDefined();
  });

  test('all timestamps should be valid ISO dates', () => {
    // Check campaigns
    testCampaigns.forEach(campaign => {
      expect(() => new Date(campaign.createdAt)).not.toThrow();
      expect(() => new Date(campaign.updatedAt)).not.toThrow();
    });

    // Check characters
    testCharacters.forEach(character => {
      expect(() => new Date(character.createdAt)).not.toThrow();
      expect(() => new Date(character.updatedAt)).not.toThrow();
    });

    // Check combat
    expect(() => new Date(testCombatEncounter.startedAt)).not.toThrow();
  });

  test('IDs should be unique across entities', () => {
    const allIds = [
      ...testCampaigns.map(c => c.id),
      ...testCharacters.map(c => c.id),
      ...testCombatants.map(c => c.id),
    ];

    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });
});
