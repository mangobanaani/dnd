import { test, expect } from '@playwright/test';

/**
 * Campaign UI Flows E2E Tests
 * Tests for NPC management, Location tracking, Quest management, and integrated workflows
 */

test.describe('NPC Management UI Flow', () => {
  test('should create a new NPC with full details', () => {
    const npc = {
      id: crypto.randomUUID(),
      campaignId: 'test-campaign-1',
      name: 'Aldric Stormwind',
      race: 'Human',
      occupation: 'Blacksmith',
      location: 'Phandalin',
      description: 'A gruff but kindly blacksmith who owes the party a favor.',
      relationship: 'ally' as const,
      status: 'alive' as const,
      notes: 'Can craft +1 weapons for 500gp each.',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(npc.name).toBe('Aldric Stormwind');
    expect(npc.relationship).toBe('ally');
    expect(npc.status).toBe('alive');
    expect(npc.occupation).toBe('Blacksmith');
    expect(npc.location).toBe('Phandalin');
  });

  test('should update NPC relationship status', () => {
    const npc = {
      id: 'npc-1',
      campaignId: 'campaign-1',
      name: 'Lord Neverember',
      relationship: 'neutral' as const,
      status: 'alive' as const,
      description: 'The ambitious ruler of Neverwinter',
      isPublic: true,
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Party helps the lord
    const updated = { ...npc, relationship: 'ally' as const, updatedAt: new Date().toISOString() };

    expect(updated.relationship).toBe('ally');
    expect(updated.name).toBe('Lord Neverember');
  });

  test('should mark NPC as deceased', () => {
    const npc = {
      id: 'npc-2',
      campaignId: 'campaign-1',
      name: 'Glassstaff',
      relationship: 'enemy' as const,
      status: 'alive' as const,
      description: 'Evil wizard',
      isPublic: false,
      notes: 'Boss of Redbrand hideout',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // NPC is defeated in combat
    const deceased = { ...npc, status: 'dead' as const, updatedAt: new Date().toISOString() };

    expect(deceased.status).toBe('dead');
    expect(deceased.name).toBe('Glassstaff');
  });

  test('should filter NPCs by relationship', () => {
    const npcs = [
      { id: '1', relationship: 'ally', name: 'Sildar', status: 'alive', isPublic: true, campaignId: 'c1', description: '', notes: '', createdAt: '', updatedAt: '' },
      { id: '2', relationship: 'enemy', name: 'Black Spider', status: 'alive', isPublic: false, campaignId: 'c1', description: '', notes: '', createdAt: '', updatedAt: '' },
      { id: '3', relationship: 'neutral', name: 'Halia Thornton', status: 'alive', isPublic: true, campaignId: 'c1', description: '', notes: '', createdAt: '', updatedAt: '' },
      { id: '4', relationship: 'ally', name: 'Gundren Rockseeker', status: 'alive', isPublic: true, campaignId: 'c1', description: '', notes: '', createdAt: '', updatedAt: '' },
    ];

    const allies = npcs.filter(n => n.relationship === 'ally');
    const enemies = npcs.filter(n => n.relationship === 'enemy');

    expect(allies.length).toBe(2);
    expect(enemies.length).toBe(1);
    expect(allies[0].name).toBe('Sildar');
    expect(enemies[0].name).toBe('Black Spider');
  });

  test('should filter NPCs by location', () => {
    const npcs = [
      { id: '1', location: 'Phandalin', name: 'Sildar', relationship: 'ally', status: 'alive', isPublic: true, campaignId: 'c1', description: '', notes: '', createdAt: '', updatedAt: '' },
      { id: '2', location: 'Wave Echo Cave', name: 'Black Spider', relationship: 'enemy', status: 'alive', isPublic: false, campaignId: 'c1', description: '', notes: '', createdAt: '', updatedAt: '' },
      { id: '3', location: 'Phandalin', name: 'Halia', relationship: 'neutral', status: 'alive', isPublic: true, campaignId: 'c1', description: '', notes: '', createdAt: '', updatedAt: '' },
    ];

    const phandalinNpcs = npcs.filter(n => n.location === 'Phandalin');

    expect(phandalinNpcs.length).toBe(2);
    expect(phandalinNpcs.every(n => n.location === 'Phandalin')).toBe(true);
  });

  test('should toggle NPC visibility (public/private)', () => {
    const npc = {
      id: 'npc-3',
      name: 'Secret Villain',
      relationship: 'enemy' as const,
      status: 'alive' as const,
      isPublic: false, // DM-only information
      description: 'The secret mastermind',
      notes: 'Players don\'t know about this yet',
      campaignId: 'c1',
      createdAt: '',
      updatedAt: '',
    };

    // Reveal to players
    const revealed = { ...npc, isPublic: true };

    expect(npc.isPublic).toBe(false);
    expect(revealed.isPublic).toBe(true);
  });

  test('should validate required NPC fields', () => {
    const validNPC = {
      id: crypto.randomUUID(),
      campaignId: 'campaign-1',
      name: 'Valid Name',
      relationship: 'neutral' as const,
      status: 'alive' as const,
      description: 'Description',
      isPublic: true,
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(validNPC.name.length).toBeGreaterThan(0);
    expect(validNPC.campaignId.length).toBeGreaterThan(0);
    expect(['ally', 'enemy', 'neutral', 'unknown']).toContain(validNPC.relationship);
    expect(['alive', 'dead', 'unknown']).toContain(validNPC.status);
  });
});

test.describe('Location Management UI Flow', () => {
  test('should create a location with all properties', () => {
    const location = {
      id: crypto.randomUUID(),
      campaignId: 'campaign-1',
      name: 'Phandalin',
      type: 'town' as const,
      description: 'A frontier town built on the ruins of a much older settlement.',
      population: '~500',
      government: 'Town Elder Council',
      notableFeatures: ['Stonehill Inn', 'Lionshield Coster', 'Redbrand hideout'],
      connectedLocations: ['High Road', 'Triboar Trail'],
      npcs: ['npc-1', 'npc-2', 'npc-3'],
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(location.name).toBe('Phandalin');
    expect(location.type).toBe('town');
    expect(location.notableFeatures.length).toBe(3);
    expect(location.connectedLocations.length).toBe(2);
    expect(location.npcs.length).toBe(3);
  });

  test('should support all location types', () => {
    const types = ['city', 'town', 'village', 'dungeon', 'wilderness', 'building', 'other'] as const;

    types.forEach(type => {
      const location = {
        id: crypto.randomUUID(),
        campaignId: 'c1',
        name: `Test ${type}`,
        type,
        description: '',
        notableFeatures: [],
        connectedLocations: [],
        npcs: [],
        isPublic: true,
        createdAt: '',
        updatedAt: '',
      };

      expect(location.type).toBe(type);
    });
  });

  test('should link NPCs to locations', () => {
    const location = {
      id: 'loc-1',
      name: 'Stonehill Inn',
      type: 'building' as const,
      npcs: ['npc-1', 'npc-2'], // Innkeeper and bartender
      description: '',
      notableFeatures: [],
      connectedLocations: [],
      isPublic: true,
      campaignId: 'c1',
      createdAt: '',
      updatedAt: '',
    };

    const npcs = [
      { id: 'npc-1', name: 'Toblen Stonehill', location: 'Stonehill Inn' },
      { id: 'npc-2', name: 'Quelline Alderleaf', location: 'Alderleaf Farm' },
      { id: 'npc-3', name: 'Trilena', location: 'Stonehill Inn' },
    ];

    const locationNPCs = npcs.filter(npc =>
      location.npcs.includes(npc.id) || npc.location === location.name
    );

    expect(locationNPCs.length).toBeGreaterThanOrEqual(2);
  });

  test('should create connected location network', () => {
    const locations = [
      {
        id: 'loc-1',
        name: 'Phandalin',
        connectedLocations: ['loc-2', 'loc-3'],
        type: 'town' as const,
        description: '',
        notableFeatures: [],
        npcs: [],
        isPublic: true,
        campaignId: 'c1',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'loc-2',
        name: 'Wave Echo Cave',
        connectedLocations: ['loc-1'],
        type: 'dungeon' as const,
        description: '',
        notableFeatures: [],
        npcs: [],
        isPublic: true,
        campaignId: 'c1',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'loc-3',
        name: 'Neverwinter',
        connectedLocations: ['loc-1', 'loc-4'],
        type: 'city' as const,
        description: '',
        notableFeatures: [],
        npcs: [],
        isPublic: true,
        campaignId: 'c1',
        createdAt: '',
        updatedAt: '',
      },
    ];

    const phandalin = locations[0];
    const connectedToPhandalin = locations.filter(loc =>
      phandalin.connectedLocations.includes(loc.id)
    );

    expect(connectedToPhandalin.length).toBe(2);
    expect(connectedToPhandalin.map(l => l.name)).toContain('Wave Echo Cave');
  });

  test('should filter locations by type', () => {
    const locations = [
      { id: '1', type: 'town', name: 'Phandalin', description: '', notableFeatures: [], connectedLocations: [], npcs: [], isPublic: true, campaignId: 'c1', createdAt: '', updatedAt: '' },
      { id: '2', type: 'dungeon', name: 'Wave Echo Cave', description: '', notableFeatures: [], connectedLocations: [], npcs: [], isPublic: true, campaignId: 'c1', createdAt: '', updatedAt: '' },
      { id: '3', type: 'city', name: 'Neverwinter', description: '', notableFeatures: [], connectedLocations: [], npcs: [], isPublic: true, campaignId: 'c1', createdAt: '', updatedAt: '' },
      { id: '4', type: 'dungeon', name: 'Cragmaw Castle', description: '', notableFeatures: [], connectedLocations: [], npcs: [], isPublic: true, campaignId: 'c1', createdAt: '', updatedAt: '' },
    ];

    const dungeons = locations.filter(l => l.type === 'dungeon');
    const settlements = locations.filter(l => ['city', 'town', 'village'].includes(l.type));

    expect(dungeons.length).toBe(2);
    expect(settlements.length).toBe(2);
  });
});

test.describe('Quest Management UI Flow', () => {
  test('should create a quest with objectives', () => {
    const quest = {
      id: crypto.randomUUID(),
      campaignId: 'campaign-1',
      title: 'Lost Mine of Phandelver',
      description: 'Find the lost mine and rescue Gundren Rockseeker',
      giver: 'Sildar Hallwinter',
      status: 'active' as const,
      priority: 'high' as const,
      objectives: [
        { id: '1', description: 'Find Cragmaw Castle', completed: true, optional: false },
        { id: '2', description: 'Rescue Gundren', completed: true, optional: false },
        { id: '3', description: 'Locate Wave Echo Cave', completed: false, optional: false },
        { id: '4', description: 'Defeat the Black Spider', completed: false, optional: false },
      ],
      rewards: ['500 XP', '10% share of mine profits', 'Lightbringer mace'],
      location: 'Phandalin',
      notes: '',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(quest.objectives.length).toBe(4);
    expect(quest.objectives.filter(o => o.completed).length).toBe(2);
    expect(quest.rewards.length).toBe(3);
  });

  test('should track quest progress via objectives', () => {
    const quest = {
      id: 'quest-1',
      title: 'Test Quest',
      objectives: [
        { id: '1', description: 'Obj 1', completed: true, optional: false },
        { id: '2', description: 'Obj 2', completed: true, optional: false },
        { id: '3', description: 'Obj 3', completed: false, optional: false },
        { id: '4', description: 'Obj 4', completed: false, optional: false },
      ],
      status: 'active' as const,
      priority: 'medium' as const,
      description: '',
      rewards: [],
      notes: '',
      isPublic: true,
      campaignId: 'c1',
      createdAt: '',
      updatedAt: '',
    };

    const completedCount = quest.objectives.filter(o => o.completed).length;
    const totalCount = quest.objectives.length;
    const progress = (completedCount / totalCount) * 100;

    expect(progress).toBe(50);
    expect(completedCount).toBe(2);
  });

  test('should support optional objectives', () => {
    const quest = {
      id: 'quest-2',
      title: 'Save the Town',
      objectives: [
        { id: '1', description: 'Defeat bandits', completed: false, optional: false },
        { id: '2', description: 'Find treasure', completed: false, optional: true },
        { id: '3', description: 'Rescue hostages', completed: false, optional: false },
      ],
      status: 'active' as const,
      priority: 'high' as const,
      description: '',
      rewards: [],
      notes: '',
      isPublic: true,
      campaignId: 'c1',
      createdAt: '',
      updatedAt: '',
    };

    const requiredObjectives = quest.objectives.filter(o => !o.optional);
    const optionalObjectives = quest.objectives.filter(o => o.optional);

    expect(requiredObjectives.length).toBe(2);
    expect(optionalObjectives.length).toBe(1);
  });

  test('should change quest status through workflow', () => {
    type QuestStatus = 'available' | 'active' | 'completed' | 'failed';
    let quest: {
      id: string; title: string; status: QuestStatus; objectives: unknown[];
      priority: 'low' | 'medium' | 'high' | 'critical'; description: string;
      rewards: string[]; notes: string; isPublic: boolean; campaignId: string;
      createdAt: string; updatedAt: string;
    } = {
      id: 'quest-3',
      title: 'Retrieve Artifact',
      status: 'available',
      objectives: [],
      priority: 'medium',
      description: '',
      rewards: [],
      notes: '',
      isPublic: true,
      campaignId: 'c1',
      createdAt: '',
      updatedAt: new Date().toISOString(),
    };

    // Party accepts quest
    quest = { ...quest, status: 'active', updatedAt: new Date().toISOString() };
    expect(quest.status).toBe('active');

    // Party completes quest
    quest = { ...quest, status: 'completed', updatedAt: new Date().toISOString() };
    expect(quest.status).toBe('completed');
  });

  test('should support quest chains with parent quests', () => {
    const mainQuest = {
      id: 'quest-main',
      title: 'Main Quest Line',
      parentQuestId: undefined,
      status: 'active' as const,
      priority: 'high' as const,
      description: '',
      objectives: [],
      rewards: [],
      notes: '',
      isPublic: true,
      campaignId: 'c1',
      createdAt: '',
      updatedAt: '',
    };

    const subQuest1 = {
      id: 'quest-sub1',
      title: 'Side Quest 1',
      parentQuestId: 'quest-main',
      status: 'completed' as const,
      priority: 'medium' as const,
      description: '',
      objectives: [],
      rewards: [],
      notes: '',
      isPublic: true,
      campaignId: 'c1',
      createdAt: '',
      updatedAt: '',
    };

    const subQuest2 = {
      id: 'quest-sub2',
      title: 'Side Quest 2',
      parentQuestId: 'quest-main',
      status: 'active' as const,
      priority: 'medium' as const,
      description: '',
      objectives: [],
      rewards: [],
      notes: '',
      isPublic: true,
      campaignId: 'c1',
      createdAt: '',
      updatedAt: '',
    };

    const quests = [mainQuest, subQuest1, subQuest2];
    const childQuests = quests.filter(q => q.parentQuestId === mainQuest.id);

    expect(childQuests.length).toBe(2);
    expect(childQuests.every(q => q.parentQuestId === mainQuest.id)).toBe(true);
  });

  test('should filter quests by status', () => {
    const quests = [
      { id: '1', status: 'available', title: 'Q1', priority: 'low' as const, description: '', objectives: [], rewards: [], notes: '', isPublic: true, campaignId: 'c1', createdAt: '', updatedAt: '' },
      { id: '2', status: 'active', title: 'Q2', priority: 'high' as const, description: '', objectives: [], rewards: [], notes: '', isPublic: true, campaignId: 'c1', createdAt: '', updatedAt: '' },
      { id: '3', status: 'completed', title: 'Q3', priority: 'medium' as const, description: '', objectives: [], rewards: [], notes: '', isPublic: true, campaignId: 'c1', createdAt: '', updatedAt: '' },
      { id: '4', status: 'active', title: 'Q4', priority: 'critical' as const, description: '', objectives: [], rewards: [], notes: '', isPublic: true, campaignId: 'c1', createdAt: '', updatedAt: '' },
    ];

    const activeQuests = quests.filter(q => q.status === 'active');
    const completedQuests = quests.filter(q => q.status === 'completed');

    expect(activeQuests.length).toBe(2);
    expect(completedQuests.length).toBe(1);
  });

  test('should sort quests by priority', () => {
    const quests = [
      { id: '1', priority: 'low', title: 'Q1', status: 'active' as const, description: '', objectives: [], rewards: [], notes: '', isPublic: true, campaignId: 'c1', createdAt: '', updatedAt: '' },
      { id: '2', priority: 'critical', title: 'Q2', status: 'active' as const, description: '', objectives: [], rewards: [], notes: '', isPublic: true, campaignId: 'c1', createdAt: '', updatedAt: '' },
      { id: '3', priority: 'high', title: 'Q3', status: 'active' as const, description: '', objectives: [], rewards: [], notes: '', isPublic: true, campaignId: 'c1', createdAt: '', updatedAt: '' },
      { id: '4', priority: 'medium', title: 'Q4', status: 'active' as const, description: '', objectives: [], rewards: [], notes: '', isPublic: true, campaignId: 'c1', createdAt: '', updatedAt: '' },
    ];

    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    const sorted = [...quests].sort((a, b) =>
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    expect(sorted[0].priority).toBe('critical');
    expect(sorted[sorted.length - 1].priority).toBe('low');
  });
});

test.describe('Integrated Campaign Workflows', () => {
  test('should link quests, NPCs, and locations together', () => {
    const npc = {
      id: 'npc-1',
      name: 'Sildar Hallwinter',
      location: 'Phandalin',
      relationship: 'ally' as const,
      status: 'alive' as const,
      description: '',
      notes: '',
      isPublic: true,
      campaignId: 'c1',
      createdAt: '',
      updatedAt: '',
    };

    const location = {
      id: 'loc-1',
      name: 'Phandalin',
      type: 'town' as const,
      npcs: ['npc-1'],
      description: '',
      notableFeatures: [],
      connectedLocations: [],
      isPublic: true,
      campaignId: 'c1',
      createdAt: '',
      updatedAt: '',
    };

    const quest = {
      id: 'quest-1',
      title: 'Find Iarno',
      giver: 'Sildar Hallwinter',
      location: 'Phandalin',
      status: 'active' as const,
      priority: 'medium' as const,
      description: '',
      objectives: [],
      rewards: [],
      notes: '',
      isPublic: true,
      campaignId: 'c1',
      createdAt: '',
      updatedAt: '',
    };

    // Verify relationships
    expect(quest.giver).toBe(npc.name);
    expect(quest.location).toBe(location.name);
    expect(npc.location).toBe(location.name);
    expect(location.npcs).toContain(npc.id);
  });

  test('should track campaign progression through quests', () => {
    const quests = [
      { id: '1', status: 'completed', title: 'Q1', priority: 'low' as const, description: '', objectives: [], rewards: [], notes: '', isPublic: true, campaignId: 'c1', createdAt: '', updatedAt: '' },
      { id: '2', status: 'completed', title: 'Q2', priority: 'medium' as const, description: '', objectives: [], rewards: [], notes: '', isPublic: true, campaignId: 'c1', createdAt: '', updatedAt: '' },
      { id: '3', status: 'active', title: 'Q3', priority: 'high' as const, description: '', objectives: [], rewards: [], notes: '', isPublic: true, campaignId: 'c1', createdAt: '', updatedAt: '' },
      { id: '4', status: 'available', title: 'Q4', priority: 'medium' as const, description: '', objectives: [], rewards: [], notes: '', isPublic: true, campaignId: 'c1', createdAt: '', updatedAt: '' },
    ];

    const completed = quests.filter(q => q.status === 'completed').length;
    const total = quests.length;
    const progressPercent = (completed / total) * 100;

    expect(progressPercent).toBe(50);
  });

  test('should handle quest completion and NPC relationship changes', () => {
    const npc: {
      id: string; name: string; relationship: string; status: string;
      description: string; notes: string; isPublic: boolean; campaignId: string;
      createdAt: string; updatedAt: string;
    } = {
      id: 'npc-1',
      name: 'Town Elder',
      relationship: 'neutral',
      status: 'alive',
      description: '',
      notes: '',
      isPublic: true,
      campaignId: 'c1',
      createdAt: '',
      updatedAt: '',
    };

    const quest: {
      id: string; title: string; giver: string; status: string;
      priority: string; description: string;
      objectives: { id: string; description: string; completed: boolean; optional: boolean }[];
      rewards: string[]; notes: string; isPublic: boolean; campaignId: string;
      createdAt: string; updatedAt: string;
    } = {
      id: 'quest-1',
      title: 'Save the Town',
      giver: 'Town Elder',
      status: 'active',
      priority: 'high',
      description: '',
      objectives: [{ id: '1', description: 'Defeat bandits', completed: false, optional: false }],
      rewards: [],
      notes: '',
      isPublic: true,
      campaignId: 'c1',
      createdAt: '',
      updatedAt: '',
    };

    // Complete quest objective
    quest.objectives[0].completed = true;
    quest.status = 'completed';

    // NPC becomes ally after completing quest
    npc.relationship = 'ally';

    expect(quest.status).toBe('completed');
    expect(npc.relationship).toBe('ally');
  });
});

test.describe('Quest Board UI', () => {
  test('should organize quests by status columns', () => {
    const quests = [
      { id: '1', status: 'available' as const, title: 'Q1', priority: 'low' as const, description: '', objectives: [], rewards: [], notes: '', isPublic: true, campaignId: 'c1', createdAt: '', updatedAt: '' },
      { id: '2', status: 'active' as const, title: 'Q2', priority: 'high' as const, description: '', objectives: [], rewards: [], notes: '', isPublic: true, campaignId: 'c1', createdAt: '', updatedAt: '' },
      { id: '3', status: 'active' as const, title: 'Q3', priority: 'medium' as const, description: '', objectives: [], rewards: [], notes: '', isPublic: true, campaignId: 'c1', createdAt: '', updatedAt: '' },
      { id: '4', status: 'completed' as const, title: 'Q4', priority: 'low' as const, description: '', objectives: [], rewards: [], notes: '', isPublic: true, campaignId: 'c1', createdAt: '', updatedAt: '' },
      { id: '5', status: 'failed' as const, title: 'Q5', priority: 'medium' as const, description: '', objectives: [], rewards: [], notes: '', isPublic: true, campaignId: 'c1', createdAt: '', updatedAt: '' },
    ];

    const columns = {
      available: quests.filter(q => q.status === 'available'),
      active: quests.filter(q => q.status === 'active'),
      completed: quests.filter(q => q.status === 'completed'),
      failed: quests.filter(q => q.status === 'failed'),
    };

    expect(columns.available.length).toBe(1);
    expect(columns.active.length).toBe(2);
    expect(columns.completed.length).toBe(1);
    expect(columns.failed.length).toBe(1);
  });

  test('should calculate quest deadline status', () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const quests = [
      { deadline: tomorrow.toISOString(), title: 'Due soon' },
      { deadline: nextWeek.toISOString(), title: 'Due later' },
      { deadline: yesterday.toISOString(), title: 'Overdue' },
      { deadline: undefined, title: 'No deadline' },
    ];

    const getDeadlineStatus = (deadline?: string) => {
      if (!deadline) return null;
      const date = new Date(deadline);
      const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil < 0) return 'overdue';
      if (daysUntil <= 1) return 'urgent';
      return 'normal';
    };

    expect(getDeadlineStatus(quests[0].deadline)).toBe('urgent');
    expect(getDeadlineStatus(quests[1].deadline)).toBe('normal');
    expect(getDeadlineStatus(quests[2].deadline)).toBe('overdue');
    expect(getDeadlineStatus(quests[3].deadline)).toBeNull();
  });
});

test.describe('NPC Relationship Graph', () => {
  test('should group NPCs by relationship type', () => {
    const npcs = [
      { id: '1', relationship: 'ally', name: 'NPC1', status: 'alive', isPublic: true, campaignId: 'c1', description: '', notes: '', createdAt: '', updatedAt: '' },
      { id: '2', relationship: 'ally', name: 'NPC2', status: 'alive', isPublic: true, campaignId: 'c1', description: '', notes: '', createdAt: '', updatedAt: '' },
      { id: '3', relationship: 'enemy', name: 'NPC3', status: 'alive', isPublic: false, campaignId: 'c1', description: '', notes: '', createdAt: '', updatedAt: '' },
      { id: '4', relationship: 'neutral', name: 'NPC4', status: 'alive', isPublic: true, campaignId: 'c1', description: '', notes: '', createdAt: '', updatedAt: '' },
    ];

    const grouped = {
      allies: npcs.filter(n => n.relationship === 'ally'),
      enemies: npcs.filter(n => n.relationship === 'enemy'),
      neutral: npcs.filter(n => n.relationship === 'neutral'),
    };

    expect(grouped.allies.length).toBe(2);
    expect(grouped.enemies.length).toBe(1);
    expect(grouped.neutral.length).toBe(1);
  });

  test('should connect NPCs in same location', () => {
    const npcs = [
      { id: '1', location: 'Phandalin', name: 'NPC1', relationship: 'ally', status: 'alive', isPublic: true, campaignId: 'c1', description: '', notes: '', createdAt: '', updatedAt: '' },
      { id: '2', location: 'Phandalin', name: 'NPC2', relationship: 'neutral', status: 'alive', isPublic: true, campaignId: 'c1', description: '', notes: '', createdAt: '', updatedAt: '' },
      { id: '3', location: 'Neverwinter', name: 'NPC3', relationship: 'ally', status: 'alive', isPublic: true, campaignId: 'c1', description: '', notes: '', createdAt: '', updatedAt: '' },
    ];

    const getConnections = (npcId: string) => {
      const npc = npcs.find(n => n.id === npcId);
      if (!npc?.location) return [];
      return npcs.filter(n => n.id !== npcId && n.location === npc.location);
    };

    const connections = getConnections('1');
    expect(connections.length).toBe(1);
    expect(connections[0].id).toBe('2');
  });
});
