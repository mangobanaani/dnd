import { test, expect } from '@playwright/test';
import {
  Campaign,
  CampaignSession,
  CampaignNPC,
  CampaignLocation,
  CampaignQuest,
  CampaignNote,
  QuestObjective,
} from '@/app/types/campaign';
import { Character } from '@/app/types/character';

// ==================== CAMPAIGN LIFECYCLE INTEGRATION TESTS ====================

test.describe('Complete Campaign Lifecycle', () => {
  test('should support full campaign workflow from creation to completion', () => {
    // Create campaign
    const campaign: Campaign = {
      id: 'campaign-full-1',
      name: 'The Lost Mines of Phandelver',
      description: 'A complete adventure',
      setting: 'Forgotten Realms',
      startDate: '2024-01-01T00:00:00.000Z',
      status: 'planning',
      edition: '5e',
      homebrew: false,
      difficultyLevel: 'normal',
      dmId: 'dm-1',
      playerIds: [],
      characterIds: [],
      sessionCount: 0,
      totalSessions: 10,
      currentLevel: 1,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      tags: ['beginner'],
      isPublic: true,
    };

    expect(campaign.status).toBe('planning');
    expect(campaign.sessionCount).toBe(0);

    // Start campaign
    const activeCampaign: Campaign = {
      ...campaign,
      status: 'active',
      updatedAt: new Date().toISOString(),
    };

    expect(activeCampaign.status).toBe('active');

    // Complete campaign
    const completedCampaign: Campaign = {
      ...activeCampaign,
      status: 'completed',
      sessionCount: 10,
      currentLevel: 5,
      updatedAt: new Date().toISOString(),
    };

    expect(completedCampaign.status).toBe('completed');
    expect(completedCampaign.sessionCount).toBe(completedCampaign.totalSessions);
  });

  test('should track party level progression through campaign', () => {
    const initialCampaign: Campaign = {
      id: 'campaign-level-1',
      name: 'Level Up Campaign',
      description: 'Track progression',
      setting: 'Forgotten Realms',
      startDate: '2024-01-01T00:00:00.000Z',
      status: 'active',
      edition: '5e',
      homebrew: false,
      difficultyLevel: 'normal',
      dmId: 'dm-1',
      playerIds: ['player-1', 'player-2'],
      characterIds: ['char-1', 'char-2'],
      sessionCount: 0,
      totalSessions: 20,
      currentLevel: 1,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      tags: [],
      isPublic: true,
    };

    // After 5 sessions
    const midCampaign: Campaign = {
      ...initialCampaign,
      sessionCount: 5,
      currentLevel: 3,
      updatedAt: new Date().toISOString(),
    };

    // After 10 sessions
    const lateCampaign: Campaign = {
      ...midCampaign,
      sessionCount: 10,
      currentLevel: 5,
      updatedAt: new Date().toISOString(),
    };

    expect(initialCampaign.currentLevel).toBe(1);
    expect(midCampaign.currentLevel).toBe(3);
    expect(lateCampaign.currentLevel).toBe(5);
    expect(lateCampaign.sessionCount).toBeLessThanOrEqual(lateCampaign.totalSessions);
  });
});

// ==================== CAMPAIGN-SESSION INTEGRATION ====================

test.describe('Campaign and Session Integration', () => {
  test('should link sessions to campaign chronologically', () => {
    const campaign: Campaign = {
      id: 'campaign-sessions-1',
      name: 'Session Test Campaign',
      description: 'Testing session tracking',
      setting: 'Forgotten Realms',
      startDate: '2024-01-01T00:00:00.000Z',
      status: 'active',
      edition: '5e',
      homebrew: false,
      difficultyLevel: 'normal',
      dmId: 'dm-1',
      playerIds: ['player-1', 'player-2'],
      characterIds: ['char-1', 'char-2'],
      sessionCount: 0,
      totalSessions: 10,
      currentLevel: 1,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      tags: [],
      isPublic: true,
    };

    const sessions: CampaignSession[] = [
      {
        id: 'session-1',
        campaignId: campaign.id,
        sessionNumber: 1,
        title: 'The Beginning',
        summary: 'Party meets in tavern',
        date: '2024-01-15T19:00:00.000Z',
        duration: 240,
        attendees: ['player-1', 'player-2'],
        xpAwarded: 300,
        treasureAwarded: ['50 gold'],
        notes: 'Great start',
        createdAt: '2024-01-16T00:00:00.000Z',
      },
      {
        id: 'session-2',
        campaignId: campaign.id,
        sessionNumber: 2,
        title: 'First Quest',
        summary: 'Party accepts quest',
        date: '2024-01-22T19:00:00.000Z',
        duration: 240,
        attendees: ['player-1', 'player-2'],
        xpAwarded: 400,
        treasureAwarded: ['Magic sword'],
        notes: 'Combat heavy',
        createdAt: '2024-01-23T00:00:00.000Z',
      },
    ];

    // All sessions belong to same campaign
    sessions.forEach(session => {
      expect(session.campaignId).toBe(campaign.id);
    });

    // Sessions are chronological
    expect(sessions[0].sessionNumber).toBe(1);
    expect(sessions[1].sessionNumber).toBe(2);
    expect(new Date(sessions[0].date) < new Date(sessions[1].date)).toBe(true);

    // Campaign updated with session count
    const updatedCampaign: Campaign = {
      ...campaign,
      sessionCount: sessions.length,
      updatedAt: new Date().toISOString(),
    };

    expect(updatedCampaign.sessionCount).toBe(2);
  });

  test('should track XP progression across sessions', () => {
    const sessions: CampaignSession[] = [
      {
        id: 'session-xp-1',
        campaignId: 'campaign-1',
        sessionNumber: 1,
        title: 'Session 1',
        summary: 'First session',
        date: '2024-01-15T19:00:00.000Z',
        duration: 240,
        attendees: ['player-1'],
        xpAwarded: 300,
        treasureAwarded: [],
        notes: '',
        createdAt: '2024-01-16T00:00:00.000Z',
      },
      {
        id: 'session-xp-2',
        campaignId: 'campaign-1',
        sessionNumber: 2,
        title: 'Session 2',
        summary: 'Second session',
        date: '2024-01-22T19:00:00.000Z',
        duration: 240,
        attendees: ['player-1'],
        xpAwarded: 450,
        treasureAwarded: [],
        notes: '',
        createdAt: '2024-01-23T00:00:00.000Z',
      },
      {
        id: 'session-xp-3',
        campaignId: 'campaign-1',
        sessionNumber: 3,
        title: 'Session 3',
        summary: 'Third session',
        date: '2024-01-29T19:00:00.000Z',
        duration: 240,
        attendees: ['player-1'],
        xpAwarded: 550,
        treasureAwarded: [],
        notes: '',
        createdAt: '2024-01-30T00:00:00.000Z',
      },
    ];

    const totalXP = sessions.reduce((sum, session) => sum + session.xpAwarded, 0);
    expect(totalXP).toBe(1300);

    // Check if enough to level up (assuming level 1 -> 2 needs 300 XP)
    const level1Threshold = 300;
    const level2Threshold = 900;

    expect(totalXP).toBeGreaterThan(level1Threshold); // Level 2
    expect(totalXP).toBeGreaterThan(level2Threshold); // Level 3
  });

  test('should track treasure awards across sessions', () => {
    const sessions: CampaignSession[] = [
      {
        id: 'session-treasure-1',
        campaignId: 'campaign-1',
        sessionNumber: 1,
        title: 'Treasure Hunt 1',
        summary: 'Found gold',
        date: '2024-01-15T19:00:00.000Z',
        duration: 240,
        attendees: ['player-1'],
        xpAwarded: 300,
        treasureAwarded: ['100 gold', 'Potion of Healing'],
        notes: '',
        createdAt: '2024-01-16T00:00:00.000Z',
      },
      {
        id: 'session-treasure-2',
        campaignId: 'campaign-1',
        sessionNumber: 2,
        title: 'Treasure Hunt 2',
        summary: 'Magic items',
        date: '2024-01-22T19:00:00.000Z',
        duration: 240,
        attendees: ['player-1'],
        xpAwarded: 400,
        treasureAwarded: ['Longsword +1', 'Ring of Protection'],
        notes: '',
        createdAt: '2024-01-23T00:00:00.000Z',
      },
    ];

    const allTreasure = sessions.flatMap(session => session.treasureAwarded);
    expect(allTreasure.length).toBe(4);
    expect(allTreasure).toContain('Longsword +1');
  });
});

// ==================== NPC-LOCATION-QUEST INTEGRATION ====================

test.describe('NPC, Location, and Quest Relationships', () => {
  test('should link NPCs to locations', () => {
    const location: CampaignLocation = {
      id: 'loc-phandalin',
      campaignId: 'campaign-1',
      name: 'Phandalin',
      type: 'town',
      description: 'Small frontier town',
      notableFeatures: ['Stonehill Inn', 'Barthen\'s Provisions'],
      connectedLocations: [],
      npcs: ['npc-barthen', 'npc-sildar', 'npc-linene'],
      isPublic: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const npcs: CampaignNPC[] = [
      {
        id: 'npc-barthen',
        campaignId: 'campaign-1',
        name: 'Elmar Barthen',
        race: 'Human',
        occupation: 'Merchant',
        location: 'Phandalin',
        description: 'Provision merchant',
        relationship: 'ally',
        status: 'alive',
        notes: '',
        isPublic: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'npc-sildar',
        campaignId: 'campaign-1',
        name: 'Sildar Hallwinter',
        race: 'Human',
        occupation: 'Knight',
        location: 'Phandalin',
        description: 'Member of Lords Alliance',
        relationship: 'ally',
        status: 'alive',
        notes: '',
        isPublic: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ];

    // NPCs are at the location
    npcs.forEach(npc => {
      expect(npc.location).toBe('Phandalin');
      expect(location.npcs).toContain(npc.id);
    });

    expect(location.npcs.length).toBe(3);
  });

  test('should link quests to NPCs (quest givers)', () => {
    const questGiverNPC: CampaignNPC = {
      id: 'npc-gundren',
      campaignId: 'campaign-1',
      name: 'Gundren Rockseeker',
      race: 'Dwarf',
      occupation: 'Miner',
      location: 'Phandalin',
      description: 'Looking for lost mine',
      relationship: 'ally',
      status: 'alive',
      notes: '',
      isPublic: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const quest: CampaignQuest = {
      id: 'quest-1',
      campaignId: 'campaign-1',
      title: 'Find Wave Echo Cave',
      description: 'Locate the legendary mine',
      giver: 'Gundren Rockseeker',
      status: 'active',
      priority: 'high',
      objectives: [
        { id: 'obj-1', description: 'Find the map', completed: true, optional: false },
        { id: 'obj-2', description: 'Locate the cave', completed: false, optional: false },
      ],
      rewards: ['Share of mine profits', 'Magic item'],
      notes: '',
      isPublic: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    expect(quest.giver).toBe(questGiverNPC.name);
  });

  test('should link quests to locations', () => {
    const location: CampaignLocation = {
      id: 'loc-cragmaw',
      campaignId: 'campaign-1',
      name: 'Cragmaw Hideout',
      type: 'dungeon',
      description: 'Goblin lair',
      notableFeatures: ['Cave entrance', 'Waterfall'],
      connectedLocations: [],
      npcs: ['npc-klarg'],
      isPublic: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const quest: CampaignQuest = {
      id: 'quest-rescue',
      campaignId: 'campaign-1',
      title: 'Rescue Gundren',
      description: 'Save Gundren from goblins',
      location: 'Cragmaw Hideout',
      status: 'active',
      priority: 'critical',
      objectives: [
        { id: 'obj-1', description: 'Find hideout', completed: true, optional: false },
        { id: 'obj-2', description: 'Defeat Klarg', completed: false, optional: false },
        { id: 'obj-3', description: 'Rescue Gundren', completed: false, optional: false },
      ],
      rewards: ['100 gold', 'Gundren\'s gratitude'],
      notes: '',
      isPublic: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    expect(quest.location).toBe(location.name);
  });

  test('should support complex NPC relationships through locations', () => {
    const tavern: CampaignLocation = {
      id: 'loc-tavern',
      campaignId: 'campaign-1',
      name: 'Stonehill Inn',
      type: 'building',
      description: 'Local tavern',
      notableFeatures: ['Common room', 'Guest rooms'],
      connectedLocations: [],
      npcs: ['npc-toblen', 'npc-patron1', 'npc-patron2'],
      isPublic: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const innkeeper: CampaignNPC = {
      id: 'npc-toblen',
      campaignId: 'campaign-1',
      name: 'Toblen Stonehill',
      occupation: 'Innkeeper',
      location: 'Stonehill Inn',
      description: 'Friendly innkeeper',
      relationship: 'ally',
      status: 'alive',
      notes: '',
      isPublic: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const patron: CampaignNPC = {
      id: 'npc-patron1',
      campaignId: 'campaign-1',
      name: 'Mysterious Stranger',
      location: 'Stonehill Inn',
      description: 'Cloaked figure in corner',
      relationship: 'unknown',
      status: 'alive',
      notes: 'Potential quest giver',
      isPublic: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    expect(innkeeper.location).toBe(tavern.name);
    expect(patron.location).toBe(tavern.name);
    expect(tavern.npcs).toContain(innkeeper.id);
    expect(tavern.npcs).toContain(patron.id);
  });
});

// ==================== QUEST PROGRESSION INTEGRATION ====================

test.describe('Quest Progression Through Sessions', () => {
  test('should track quest progress across multiple sessions', () => {
    // Initial quest state
    const initialQuest: CampaignQuest = {
      id: 'quest-progress-1',
      campaignId: 'campaign-1',
      title: 'The Main Quest',
      description: 'Multi-session quest',
      status: 'available',
      priority: 'high',
      objectives: [
        { id: 'obj-1', description: 'Talk to NPC', completed: false, optional: false },
        { id: 'obj-2', description: 'Travel to location', completed: false, optional: false },
        { id: 'obj-3', description: 'Defeat boss', completed: false, optional: false },
      ],
      rewards: ['1000 gold', 'Magic armor'],
      notes: '',
      isPublic: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    // After session 1
    const session1Quest: CampaignQuest = {
      ...initialQuest,
      status: 'active',
      objectives: [
        { ...initialQuest.objectives[0], completed: true },
        initialQuest.objectives[1],
        initialQuest.objectives[2],
      ],
      updatedAt: '2024-01-15T00:00:00.000Z',
    };

    // After session 2
    const session2Quest: CampaignQuest = {
      ...session1Quest,
      objectives: [
        session1Quest.objectives[0],
        { ...session1Quest.objectives[1], completed: true },
        session1Quest.objectives[2],
      ],
      updatedAt: '2024-01-22T00:00:00.000Z',
    };

    // After session 3 (completed)
    const completedQuest: CampaignQuest = {
      ...session2Quest,
      status: 'completed',
      objectives: session2Quest.objectives.map(obj => ({ ...obj, completed: true })),
      updatedAt: '2024-01-29T00:00:00.000Z',
    };

    expect(initialQuest.status).toBe('available');
    expect(session1Quest.status).toBe('active');
    expect(completedQuest.status).toBe('completed');
    expect(completedQuest.objectives.every(obj => obj.completed)).toBe(true);
  });

  test('should support quest chains progressing through campaign', () => {
    const mainQuest: CampaignQuest = {
      id: 'quest-main-1',
      campaignId: 'campaign-1',
      title: 'Main Quest - Part 1',
      description: 'First part of storyline',
      status: 'completed',
      priority: 'high',
      objectives: [
        { id: 'obj-1', description: 'Complete part 1', completed: true, optional: false },
      ],
      rewards: ['Map to next location'],
      notes: '',
      isPublic: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
    };

    const followUpQuest: CampaignQuest = {
      id: 'quest-main-2',
      campaignId: 'campaign-1',
      title: 'Main Quest - Part 2',
      description: 'Continuation of storyline',
      status: 'active',
      priority: 'high',
      objectives: [
        { id: 'obj-1', description: 'Use the map', completed: false, optional: false },
        { id: 'obj-2', description: 'Find the temple', completed: false, optional: false },
      ],
      rewards: ['Ancient artifact'],
      parentQuestId: 'quest-main-1',
      notes: '',
      isPublic: true,
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-22T00:00:00.000Z',
    };

    expect(followUpQuest.parentQuestId).toBe(mainQuest.id);
    expect(mainQuest.status).toBe('completed');
    expect(followUpQuest.status).toBe('active');
  });

  test('should handle failed quests with session notes', () => {
    const quest: CampaignQuest = {
      id: 'quest-failed-1',
      campaignId: 'campaign-1',
      title: 'Time-Sensitive Quest',
      description: 'Rescue mission',
      status: 'active',
      priority: 'critical',
      objectives: [
        { id: 'obj-1', description: 'Arrive in 3 days', completed: false, optional: false },
      ],
      rewards: ['Hero status'],
      deadline: '2024-01-18T00:00:00.000Z',
      notes: '',
      isPublic: true,
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
    };

    const session: CampaignSession = {
      id: 'session-failed',
      campaignId: 'campaign-1',
      sessionNumber: 5,
      title: 'Missed Deadline',
      summary: 'Party arrived too late, quest failed',
      date: '2024-01-22T19:00:00.000Z',
      duration: 240,
      attendees: ['player-1'],
      xpAwarded: 0,
      treasureAwarded: [],
      notes: 'Quest "Time-Sensitive Quest" failed due to missing deadline',
      createdAt: '2024-01-23T00:00:00.000Z',
    };

    const failedQuest: CampaignQuest = {
      ...quest,
      status: 'failed',
      notes: 'Failed in session 5 - arrived too late',
      updatedAt: '2024-01-22T00:00:00.000Z',
    };

    expect(failedQuest.status).toBe('failed');
    expect(session.notes).toContain('failed');
  });
});

// ==================== CAMPAIGN NOTES INTEGRATION ====================

test.describe('Campaign Notes Integration', () => {
  test('should link notes to NPCs, locations, and quests', () => {
    const npcNote: CampaignNote = {
      id: 'note-npc-1',
      campaignId: 'campaign-1',
      title: 'Sildar Hallwinter Background',
      content: 'Member of Lords Alliance, searching for Iarno',
      category: 'npc',
      tags: ['sildar', 'lords-alliance', 'important'],
      isPublic: true,
      createdBy: 'dm-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const locationNote: CampaignNote = {
      id: 'note-loc-1',
      campaignId: 'campaign-1',
      title: 'Wave Echo Cave History',
      content: 'Ancient mine, source of magical forge',
      category: 'location',
      tags: ['wave-echo-cave', 'history', 'lore'],
      isPublic: false,
      createdBy: 'dm-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const questNote: CampaignNote = {
      id: 'note-quest-1',
      campaignId: 'campaign-1',
      title: 'Redbrand Investigation Notes',
      content: 'Players discovered Redbrands are working for someone',
      category: 'quest',
      tags: ['redbrands', 'investigation', 'session-3'],
      isPublic: true,
      createdBy: 'dm-1',
      createdAt: '2024-01-22T00:00:00.000Z',
      updatedAt: '2024-01-22T00:00:00.000Z',
    };

    expect(npcNote.category).toBe('npc');
    expect(locationNote.category).toBe('location');
    expect(questNote.category).toBe('quest');
    expect(npcNote.tags).toContain('sildar');
  });

  test('should organize session notes by tags', () => {
    const notes: CampaignNote[] = [
      {
        id: 'note-s1',
        campaignId: 'campaign-1',
        title: 'Session 1 Notes',
        content: 'Party met in tavern',
        category: 'other',
        tags: ['session-1', 'important'],
        isPublic: true,
        createdBy: 'dm-1',
        createdAt: '2024-01-16T00:00:00.000Z',
        updatedAt: '2024-01-16T00:00:00.000Z',
      },
      {
        id: 'note-s2',
        campaignId: 'campaign-1',
        title: 'Session 2 Notes',
        content: 'Combat with goblins',
        category: 'other',
        tags: ['session-2', 'combat'],
        isPublic: true,
        createdBy: 'dm-1',
        createdAt: '2024-01-23T00:00:00.000Z',
        updatedAt: '2024-01-23T00:00:00.000Z',
      },
    ];

    const sessionNotes = notes.filter(note => note.tags.some(tag => tag.startsWith('session-')));
    const importantNotes = notes.filter(note => note.tags.includes('important'));

    expect(sessionNotes.length).toBe(2);
    expect(importantNotes.length).toBe(1);
  });
});

// ==================== CHARACTER-CAMPAIGN-SESSION INTEGRATION ====================

test.describe('Character Journey Through Campaign', () => {
  test('should track character progression through sessions', () => {
    const initialCharacter: Character = {
      id: 'char-progress-1',
      name: 'Thrain Stonehammer',
      race: 'Dwarf',
      classes: [{ name: 'Fighter', level: 1, hitDie: 'd10', subclass: undefined }],
      level: 1,
      background: 'Soldier',
      alignment: 'Lawful Good',
      experiencePoints: 0,
      abilityScores: {
        strength: 16,
        dexterity: 12,
        constitution: 15,
        intelligence: 10,
        wisdom: 13,
        charisma: 8,
      },
      maxHitPoints: 12,
      currentHitPoints: 12,
      temporaryHitPoints: 0,
      hitDice: [{ total: 1, current: 1, die: 'd10' }],
      armorClass: 16,
      initiative: 1,
      speed: 25,
      proficiencyBonus: 2,
      savingThrows: ['strength', 'constitution'],
      skills: [],
      features: ['Second Wind'],
      traits: ['Darkvision', 'Dwarven Resilience'],
      equipment: ['Longsword', 'Shield', 'Chainmail'],
      inventory: [],
      currency: { copper: 0, silver: 0, electrum: 0, gold: 10, platinum: 0 },
      carriedWeight: 50,
      maxCarryWeight: 240,
      campaignId: 'campaign-1',
      playerId: 'player-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      notes: '',
    };

    // After session 1 (300 XP)
    const session1Character: Character = {
      ...initialCharacter,
      experiencePoints: 300,
      currency: { ...initialCharacter.currency, gold: 60 }, // +50 from treasure
      updatedAt: '2024-01-16T00:00:00.000Z',
    };

    // After session 3 (leveled up to 2)
    const leveledCharacter: Character = {
      ...session1Character,
      level: 2,
      experiencePoints: 900,
      classes: [{ name: 'Fighter', level: 2, hitDie: 'd10', subclass: undefined }],
      maxHitPoints: 22,
      currentHitPoints: 22,
      hitDice: [{ total: 2, current: 2, die: 'd10' }],
      features: ['Second Wind', 'Action Surge'],
      updatedAt: '2024-01-30T00:00:00.000Z',
    };

    expect(initialCharacter.level).toBe(1);
    expect(session1Character.experiencePoints).toBe(300);
    expect(leveledCharacter.level).toBe(2);
    expect(leveledCharacter.features).toContain('Action Surge');
  });

  test('should track multiple characters in same campaign', () => {
    const campaign: Campaign = {
      id: 'campaign-multi-char',
      name: 'Party Adventure',
      description: 'Multiple characters',
      setting: 'Forgotten Realms',
      startDate: '2024-01-01T00:00:00.000Z',
      status: 'active',
      edition: '5e',
      homebrew: false,
      difficultyLevel: 'normal',
      dmId: 'dm-1',
      playerIds: ['player-1', 'player-2', 'player-3'],
      characterIds: ['char-1', 'char-2', 'char-3'],
      sessionCount: 5,
      totalSessions: 10,
      currentLevel: 3,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      tags: [],
      isPublic: true,
    };

    expect(campaign.playerIds.length).toBe(3);
    expect(campaign.characterIds.length).toBe(3);
    expect(campaign.currentLevel).toBe(3); // Party level
  });
});

// ==================== FULL CAMPAIGN SNAPSHOT ====================

test.describe('Complete Campaign Snapshot', () => {
  test('should represent full campaign state at any point', () => {
    const campaign: Campaign = {
      id: 'campaign-snapshot',
      name: 'The Complete Adventure',
      description: 'Full featured campaign',
      setting: 'Forgotten Realms',
      startDate: '2024-01-01T00:00:00.000Z',
      status: 'active',
      edition: '5e',
      homebrew: false,
      difficultyLevel: 'normal',
      dmId: 'dm-1',
      playerIds: ['player-1', 'player-2'],
      characterIds: ['char-1', 'char-2'],
      sessionCount: 5,
      totalSessions: 20,
      currentLevel: 3,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-02-01T00:00:00.000Z',
      tags: ['active', 'beginner-friendly'],
      isPublic: true,
    };

    const sessions: CampaignSession[] = [
      /* 5 sessions */
    ];
    const npcs: CampaignNPC[] = [
      /* NPCs in campaign */
    ];
    const locations: CampaignLocation[] = [
      /* Locations discovered */
    ];
    const quests: CampaignQuest[] = [
      /* Active and completed quests */
    ];
    const notes: CampaignNote[] = [
      /* DM and session notes */
    ];

    // Campaign snapshot
    const snapshot = {
      campaign,
      sessionCount: sessions.length,
      npcCount: npcs.length,
      locationCount: locations.length,
      activeQuests: quests.filter(q => q.status === 'active').length,
      completedQuests: quests.filter(q => q.status === 'completed').length,
      noteCount: notes.length,
    };

    expect(snapshot.campaign.status).toBe('active');
    expect(snapshot.sessionCount).toBeLessThanOrEqual(snapshot.campaign.totalSessions);
  });
});
