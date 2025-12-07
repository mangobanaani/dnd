import { test, expect } from '@playwright/test';
import {
  CampaignNPC,
  CampaignLocation,
  CampaignQuest,
  CampaignNote,
  QuestObjective,
} from '@/app/types/campaign';

// ==================== NPC MANAGEMENT TESTS ====================

test.describe('Campaign NPC Structure', () => {
  test('should have valid NPC structure', () => {
    const npc: CampaignNPC = {
      id: 'npc-1',
      campaignId: 'campaign-1',
      name: 'Sildar Hallwinter',
      race: 'Human',
      occupation: 'Knight',
      location: 'Phandalin',
      description: 'A veteran warrior and member of the Lords Alliance',
      relationship: 'ally',
      status: 'alive',
      notes: 'Rescued from goblins, now helping the party',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(npc.id).toBeDefined();
    expect(npc.campaignId).toBeTruthy();
    expect(npc.name).toBeTruthy();
    expect(['ally', 'neutral', 'enemy', 'unknown']).toContain(npc.relationship);
    expect(['alive', 'dead', 'unknown']).toContain(npc.status);
    expect(typeof npc.isPublic).toBe('boolean');
  });

  test('should support optional NPC fields', () => {
    const minimalNPC: CampaignNPC = {
      id: 'npc-2',
      campaignId: 'campaign-1',
      name: 'Mysterious Figure',
      description: 'A hooded stranger',
      relationship: 'unknown',
      status: 'unknown',
      notes: '',
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(minimalNPC.race).toBeUndefined();
    expect(minimalNPC.occupation).toBeUndefined();
    expect(minimalNPC.location).toBeUndefined();
    expect(minimalNPC.imageUrl).toBeUndefined();
  });

  test('should track NPC image URLs', () => {
    const npcWithImage: CampaignNPC = {
      id: 'npc-3',
      campaignId: 'campaign-1',
      name: 'Lord Neverember',
      description: 'Ruler of Neverwinter',
      relationship: 'neutral',
      status: 'alive',
      notes: '',
      imageUrl: 'https://example.com/neverember.jpg',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(npcWithImage.imageUrl).toBeTruthy();
    expect(typeof npcWithImage.imageUrl).toBe('string');
  });
});

test.describe('NPC Relationships', () => {
  test('should categorize NPCs as allies', () => {
    const ally: CampaignNPC = {
      id: 'npc-ally',
      campaignId: 'campaign-1',
      name: 'Friendly Shopkeeper',
      description: 'Helpful merchant',
      relationship: 'ally',
      status: 'alive',
      notes: 'Provides discounts',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(ally.relationship).toBe('ally');
  });

  test('should categorize NPCs as enemies', () => {
    const enemy: CampaignNPC = {
      id: 'npc-enemy',
      campaignId: 'campaign-1',
      name: 'Glasstaff',
      description: 'Evil wizard',
      relationship: 'enemy',
      status: 'alive',
      notes: 'Leader of the Redbrands',
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(enemy.relationship).toBe('enemy');
  });

  test('should categorize NPCs as neutral', () => {
    const neutral: CampaignNPC = {
      id: 'npc-neutral',
      campaignId: 'campaign-1',
      name: 'Barthen',
      description: 'Provision merchant',
      relationship: 'neutral',
      status: 'alive',
      notes: 'Standard merchant',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(neutral.relationship).toBe('neutral');
  });

  test('should handle unknown relationships', () => {
    const unknown: CampaignNPC = {
      id: 'npc-unknown',
      campaignId: 'campaign-1',
      name: 'Cloaked Stranger',
      description: 'Unknown motives',
      relationship: 'unknown',
      status: 'unknown',
      notes: 'Haven\'t interacted yet',
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(unknown.relationship).toBe('unknown');
  });
});

test.describe('NPC Status Tracking', () => {
  test('should track living NPCs', () => {
    const alive: CampaignNPC = {
      id: 'npc-alive',
      campaignId: 'campaign-1',
      name: 'Gundren Rockseeker',
      description: 'Dwarf miner',
      relationship: 'ally',
      status: 'alive',
      notes: 'Looking for Wave Echo Cave',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(alive.status).toBe('alive');
  });

  test('should track deceased NPCs', () => {
    const dead: CampaignNPC = {
      id: 'npc-dead',
      campaignId: 'campaign-1',
      name: 'Fallen Guard',
      description: 'Killed in goblin attack',
      relationship: 'ally',
      status: 'dead',
      notes: 'Died session 1',
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(dead.status).toBe('dead');
  });

  test('should handle unknown status', () => {
    const unknownStatus: CampaignNPC = {
      id: 'npc-status-unknown',
      campaignId: 'campaign-1',
      name: 'Missing Person',
      description: 'Whereabouts unknown',
      relationship: 'neutral',
      status: 'unknown',
      notes: 'Last seen 3 days ago',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(unknownStatus.status).toBe('unknown');
  });
});

test.describe('NPC Privacy and Visibility', () => {
  test('should support public NPCs visible to players', () => {
    const publicNPC: CampaignNPC = {
      id: 'npc-public',
      campaignId: 'campaign-1',
      name: 'Mayor',
      description: 'Town leader',
      relationship: 'ally',
      status: 'alive',
      notes: 'Players have met',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(publicNPC.isPublic).toBe(true);
  });

  test('should support private NPCs only DM can see', () => {
    const privateNPC: CampaignNPC = {
      id: 'npc-private',
      campaignId: 'campaign-1',
      name: 'Secret Villain',
      description: 'Hidden antagonist',
      relationship: 'enemy',
      status: 'alive',
      notes: 'Players don\'t know about this yet',
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(privateNPC.isPublic).toBe(false);
  });
});

test.describe('NPC Metadata and Timestamps', () => {
  test('should track creation timestamp', () => {
    const npc: CampaignNPC = {
      id: 'npc-timestamp',
      campaignId: 'campaign-1',
      name: 'Test NPC',
      description: 'Test',
      relationship: 'neutral',
      status: 'alive',
      notes: '',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => new Date(npc.createdAt)).not.toThrow();
    expect(new Date(npc.createdAt)).toBeInstanceOf(Date);
  });

  test('should track update timestamp', () => {
    const now = new Date().toISOString();
    const later = new Date(Date.now() + 1000).toISOString();

    const npc: CampaignNPC = {
      id: 'npc-update',
      campaignId: 'campaign-1',
      name: 'Updated NPC',
      description: 'Test',
      relationship: 'neutral',
      status: 'alive',
      notes: '',
      isPublic: true,
      createdAt: now,
      updatedAt: later,
    };

    expect(new Date(npc.updatedAt) >= new Date(npc.createdAt)).toBe(true);
  });
});

// ==================== LOCATION MANAGEMENT TESTS ====================

test.describe('Campaign Location Structure', () => {
  test('should have valid location structure', () => {
    const location: CampaignLocation = {
      id: 'loc-1',
      campaignId: 'campaign-1',
      name: 'Phandalin',
      type: 'town',
      description: 'A small frontier settlement',
      population: '~1,000',
      government: 'Townmaster',
      notableFeatures: ['Stonehill Inn', 'Barthen\'s Provisions', 'Shrine of Luck'],
      connectedLocations: ['loc-2', 'loc-3'],
      npcs: ['npc-1', 'npc-2'],
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(location.id).toBeDefined();
    expect(location.campaignId).toBeTruthy();
    expect(location.name).toBeTruthy();
    expect(['city', 'town', 'village', 'dungeon', 'wilderness', 'building', 'other']).toContain(location.type);
    expect(Array.isArray(location.notableFeatures)).toBe(true);
    expect(Array.isArray(location.connectedLocations)).toBe(true);
    expect(Array.isArray(location.npcs)).toBe(true);
  });

  test('should support all location types', () => {
    const types: CampaignLocation['type'][] = ['city', 'town', 'village', 'dungeon', 'wilderness', 'building', 'other'];

    types.forEach(type => {
      const location: CampaignLocation = {
        id: `loc-${type}`,
        campaignId: 'campaign-1',
        name: `Test ${type}`,
        type,
        description: `A ${type}`,
        notableFeatures: [],
        connectedLocations: [],
        npcs: [],
        isPublic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(location.type).toBe(type);
    });
  });

  test('should support optional location fields', () => {
    const minimalLocation: CampaignLocation = {
      id: 'loc-minimal',
      campaignId: 'campaign-1',
      name: 'Unknown Place',
      type: 'other',
      description: 'Mysterious',
      notableFeatures: [],
      connectedLocations: [],
      npcs: [],
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(minimalLocation.population).toBeUndefined();
    expect(minimalLocation.government).toBeUndefined();
    expect(minimalLocation.imageUrl).toBeUndefined();
    expect(minimalLocation.mapUrl).toBeUndefined();
  });
});

test.describe('Location Types', () => {
  test('should create city locations', () => {
    const city: CampaignLocation = {
      id: 'loc-city',
      campaignId: 'campaign-1',
      name: 'Waterdeep',
      type: 'city',
      description: 'The City of Splendors',
      population: '~130,000',
      government: 'Masked Lords',
      notableFeatures: ['Castle Waterdeep', 'Yawning Portal Inn'],
      connectedLocations: [],
      npcs: [],
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(city.type).toBe('city');
  });

  test('should create dungeon locations', () => {
    const dungeon: CampaignLocation = {
      id: 'loc-dungeon',
      campaignId: 'campaign-1',
      name: 'Cragmaw Hideout',
      type: 'dungeon',
      description: 'Goblin lair in a hillside cave',
      notableFeatures: ['Goblin guards', 'Klarg\'s chamber', 'Waterfall'],
      connectedLocations: [],
      npcs: ['npc-goblin-1'],
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(dungeon.type).toBe('dungeon');
  });

  test('should create wilderness locations', () => {
    const wilderness: CampaignLocation = {
      id: 'loc-wild',
      campaignId: 'campaign-1',
      name: 'Neverwinter Wood',
      type: 'wilderness',
      description: 'Dense forest',
      notableFeatures: ['Ancient trees', 'Hidden paths'],
      connectedLocations: [],
      npcs: [],
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(wilderness.type).toBe('wilderness');
  });
});

test.describe('Location Features and Relationships', () => {
  test('should track notable features', () => {
    const location: CampaignLocation = {
      id: 'loc-features',
      campaignId: 'campaign-1',
      name: 'Phandalin',
      type: 'town',
      description: 'Frontier town',
      notableFeatures: [
        'Stonehill Inn',
        'Barthen\'s Provisions',
        'Lionshield Coster',
        'Shrine of Luck',
        'Townmaster\'s Hall',
      ],
      connectedLocations: [],
      npcs: [],
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(location.notableFeatures.length).toBe(5);
    expect(location.notableFeatures).toContain('Stonehill Inn');
  });

  test('should link connected locations', () => {
    const location: CampaignLocation = {
      id: 'loc-connected',
      campaignId: 'campaign-1',
      name: 'Phandalin',
      type: 'town',
      description: 'Hub town',
      notableFeatures: [],
      connectedLocations: ['loc-neverwinter', 'loc-triboar', 'loc-cragmaw'],
      npcs: [],
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(location.connectedLocations.length).toBe(3);
    expect(location.connectedLocations).toContain('loc-neverwinter');
  });

  test('should link NPCs to locations', () => {
    const location: CampaignLocation = {
      id: 'loc-with-npcs',
      campaignId: 'campaign-1',
      name: 'Barthen\'s Provisions',
      type: 'building',
      description: 'General store',
      notableFeatures: ['Trading post', 'Warehouse'],
      connectedLocations: [],
      npcs: ['npc-barthen', 'npc-clerk'],
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(location.npcs.length).toBe(2);
    expect(location.npcs).toContain('npc-barthen');
  });
});

test.describe('Location Images and Maps', () => {
  test('should support location images', () => {
    const location: CampaignLocation = {
      id: 'loc-image',
      campaignId: 'campaign-1',
      name: 'Castle',
      type: 'building',
      description: 'Fortified castle',
      imageUrl: 'https://example.com/castle.jpg',
      notableFeatures: [],
      connectedLocations: [],
      npcs: [],
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(location.imageUrl).toBeTruthy();
    expect(typeof location.imageUrl).toBe('string');
  });

  test('should support map URLs', () => {
    const location: CampaignLocation = {
      id: 'loc-map',
      campaignId: 'campaign-1',
      name: 'Dungeon',
      type: 'dungeon',
      description: 'Complex dungeon',
      mapUrl: 'https://example.com/dungeon-map.jpg',
      notableFeatures: [],
      connectedLocations: [],
      npcs: [],
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(location.mapUrl).toBeTruthy();
    expect(typeof location.mapUrl).toBe('string');
  });
});

test.describe('Location Privacy', () => {
  test('should support public locations', () => {
    const publicLoc: CampaignLocation = {
      id: 'loc-public',
      campaignId: 'campaign-1',
      name: 'Known Town',
      type: 'town',
      description: 'Publicly known',
      notableFeatures: [],
      connectedLocations: [],
      npcs: [],
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(publicLoc.isPublic).toBe(true);
  });

  test('should support private/hidden locations', () => {
    const privateLoc: CampaignLocation = {
      id: 'loc-private',
      campaignId: 'campaign-1',
      name: 'Secret Base',
      type: 'dungeon',
      description: 'Hidden villain lair',
      notableFeatures: [],
      connectedLocations: [],
      npcs: [],
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(privateLoc.isPublic).toBe(false);
  });
});

// ==================== QUEST MANAGEMENT TESTS ====================

test.describe('Quest Objectives', () => {
  test('should have valid objective structure', () => {
    const objective: QuestObjective = {
      id: 'obj-1',
      description: 'Find the missing merchant',
      completed: false,
      optional: false,
    };

    expect(objective.id).toBeDefined();
    expect(objective.description).toBeTruthy();
    expect(typeof objective.completed).toBe('boolean');
    expect(typeof objective.optional).toBe('boolean');
  });

  test('should track objective completion', () => {
    const completed: QuestObjective = {
      id: 'obj-completed',
      description: 'Defeat the boss',
      completed: true,
      optional: false,
    };

    const incomplete: QuestObjective = {
      id: 'obj-incomplete',
      description: 'Find all keys',
      completed: false,
      optional: false,
    };

    expect(completed.completed).toBe(true);
    expect(incomplete.completed).toBe(false);
  });

  test('should distinguish optional vs required objectives', () => {
    const required: QuestObjective = {
      id: 'obj-required',
      description: 'Main objective',
      completed: false,
      optional: false,
    };

    const optional: QuestObjective = {
      id: 'obj-optional',
      description: 'Side objective',
      completed: false,
      optional: true,
    };

    expect(required.optional).toBe(false);
    expect(optional.optional).toBe(true);
  });

  test('should allow completing optional objectives', () => {
    const optionalCompleted: QuestObjective = {
      id: 'obj-opt-done',
      description: 'Bonus objective',
      completed: true,
      optional: true,
    };

    expect(optionalCompleted.completed).toBe(true);
    expect(optionalCompleted.optional).toBe(true);
  });
});

test.describe('Quest Status and Priority', () => {
  test('should track available quests', () => {
    const quest: CampaignQuest = {
      id: 'quest-available',
      campaignId: 'campaign-1',
      title: 'New Quest',
      description: 'Not started yet',
      status: 'available',
      priority: 'medium',
      objectives: [],
      rewards: [],
      notes: '',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(quest.status).toBe('available');
  });

  test('should track active quests', () => {
    const quest: CampaignQuest = {
      id: 'quest-active',
      campaignId: 'campaign-1',
      title: 'In Progress Quest',
      description: 'Currently working on this',
      status: 'active',
      priority: 'high',
      objectives: [],
      rewards: [],
      notes: '',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(quest.status).toBe('active');
  });

  test('should track completed quests', () => {
    const quest: CampaignQuest = {
      id: 'quest-completed',
      campaignId: 'campaign-1',
      title: 'Finished Quest',
      description: 'All done',
      status: 'completed',
      priority: 'medium',
      objectives: [],
      rewards: [],
      notes: '',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(quest.status).toBe('completed');
  });

  test('should track failed quests', () => {
    const quest: CampaignQuest = {
      id: 'quest-failed',
      campaignId: 'campaign-1',
      title: 'Failed Quest',
      description: 'Time ran out',
      status: 'failed',
      priority: 'low',
      objectives: [],
      rewards: [],
      notes: '',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(quest.status).toBe('failed');
  });

  test('should support all priority levels', () => {
    const priorities: CampaignQuest['priority'][] = ['low', 'medium', 'high', 'critical'];

    priorities.forEach(priority => {
      const quest: CampaignQuest = {
        id: `quest-${priority}`,
        campaignId: 'campaign-1',
        title: `${priority} quest`,
        description: 'Test',
        status: 'available',
        priority,
        objectives: [],
        rewards: [],
        notes: '',
        isPublic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(quest.priority).toBe(priority);
    });
  });
});

test.describe('Quest Objectives Management', () => {
  test('should support multiple objectives', () => {
    const quest: CampaignQuest = {
      id: 'quest-multi-obj',
      campaignId: 'campaign-1',
      title: 'Complex Quest',
      description: 'Multiple steps',
      status: 'active',
      priority: 'high',
      objectives: [
        { id: 'obj-1', description: 'Step 1', completed: true, optional: false },
        { id: 'obj-2', description: 'Step 2', completed: false, optional: false },
        { id: 'obj-3', description: 'Bonus', completed: false, optional: true },
      ],
      rewards: [],
      notes: '',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(quest.objectives.length).toBe(3);
    expect(quest.objectives[0].completed).toBe(true);
    expect(quest.objectives[1].completed).toBe(false);
    expect(quest.objectives[2].optional).toBe(true);
  });

  test('should track objective progress', () => {
    const quest: CampaignQuest = {
      id: 'quest-progress',
      campaignId: 'campaign-1',
      title: 'Tracking Quest',
      description: 'Test progress',
      status: 'active',
      priority: 'medium',
      objectives: [
        { id: 'obj-1', description: 'First', completed: true, optional: false },
        { id: 'obj-2', description: 'Second', completed: true, optional: false },
        { id: 'obj-3', description: 'Third', completed: false, optional: false },
        { id: 'obj-4', description: 'Fourth', completed: false, optional: false },
      ],
      rewards: [],
      notes: '',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const completedCount = quest.objectives.filter(obj => obj.completed).length;
    const totalRequired = quest.objectives.filter(obj => !obj.optional).length;

    expect(completedCount).toBe(2);
    expect(totalRequired).toBe(4);
    expect(completedCount / totalRequired).toBe(0.5); // 50% complete
  });

  test('should allow quest with no objectives', () => {
    const quest: CampaignQuest = {
      id: 'quest-no-obj',
      campaignId: 'campaign-1',
      title: 'Simple Quest',
      description: 'Just a goal',
      status: 'available',
      priority: 'low',
      objectives: [],
      rewards: [],
      notes: '',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(quest.objectives.length).toBe(0);
  });
});

test.describe('Quest Rewards and Details', () => {
  test('should track quest rewards', () => {
    const quest: CampaignQuest = {
      id: 'quest-rewards',
      campaignId: 'campaign-1',
      title: 'Rewarding Quest',
      description: 'Good pay',
      status: 'active',
      priority: 'high',
      objectives: [],
      rewards: ['500 gold pieces', 'Magic sword', 'Fame and glory'],
      notes: '',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(quest.rewards.length).toBe(3);
    expect(quest.rewards).toContain('Magic sword');
  });

  test('should track quest giver', () => {
    const quest: CampaignQuest = {
      id: 'quest-giver',
      campaignId: 'campaign-1',
      title: 'NPC Quest',
      description: 'Given by NPC',
      giver: 'Mayor Harbin Wester',
      status: 'available',
      priority: 'medium',
      objectives: [],
      rewards: [],
      notes: '',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(quest.giver).toBe('Mayor Harbin Wester');
  });

  test('should track quest location', () => {
    const quest: CampaignQuest = {
      id: 'quest-location',
      campaignId: 'campaign-1',
      title: 'Dungeon Quest',
      description: 'Clear the dungeon',
      location: 'Cragmaw Hideout',
      status: 'active',
      priority: 'high',
      objectives: [],
      rewards: [],
      notes: '',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(quest.location).toBe('Cragmaw Hideout');
  });

  test('should track quest deadline', () => {
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days from now

    const quest: CampaignQuest = {
      id: 'quest-deadline',
      campaignId: 'campaign-1',
      title: 'Timed Quest',
      description: 'Time sensitive',
      status: 'active',
      priority: 'critical',
      objectives: [],
      rewards: [],
      deadline,
      notes: '',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(quest.deadline).toBeDefined();
    expect(new Date(quest.deadline!) > new Date()).toBe(true);
  });
});

test.describe('Quest Chains', () => {
  test('should support parent quest for quest chains', () => {
    const parentQuest: CampaignQuest = {
      id: 'quest-parent',
      campaignId: 'campaign-1',
      title: 'Main Storyline',
      description: 'Part 1',
      status: 'completed',
      priority: 'high',
      objectives: [],
      rewards: [],
      notes: '',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const childQuest: CampaignQuest = {
      id: 'quest-child',
      campaignId: 'campaign-1',
      title: 'Main Storyline - Part 2',
      description: 'Continuation',
      status: 'active',
      priority: 'high',
      objectives: [],
      rewards: [],
      parentQuestId: 'quest-parent',
      notes: '',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(childQuest.parentQuestId).toBe(parentQuest.id);
  });
});

// ==================== CAMPAIGN NOTES TESTS ====================

test.describe('Campaign Notes', () => {
  test('should have valid note structure', () => {
    const note: CampaignNote = {
      id: 'note-1',
      campaignId: 'campaign-1',
      title: 'Session Notes',
      content: 'Important discoveries from last session',
      category: 'other',
      tags: ['session-1', 'important'],
      isPublic: true,
      createdBy: 'dm-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(note.id).toBeDefined();
    expect(note.campaignId).toBeTruthy();
    expect(note.title).toBeTruthy();
    expect(['npc', 'location', 'quest', 'lore', 'other']).toContain(note.category);
    expect(Array.isArray(note.tags)).toBe(true);
  });

  test('should support all note categories', () => {
    const categories: CampaignNote['category'][] = ['npc', 'location', 'quest', 'lore', 'other'];

    categories.forEach(category => {
      const note: CampaignNote = {
        id: `note-${category}`,
        campaignId: 'campaign-1',
        title: `${category} note`,
        content: 'Test content',
        category,
        tags: [],
        isPublic: true,
        createdBy: 'dm-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(note.category).toBe(category);
    });
  });

  test('should support note tags', () => {
    const note: CampaignNote = {
      id: 'note-tags',
      campaignId: 'campaign-1',
      title: 'Tagged Note',
      content: 'Well organized',
      category: 'lore',
      tags: ['important', 'session-5', 'combat', 'plot-reveal'],
      isPublic: true,
      createdBy: 'dm-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(note.tags.length).toBe(4);
    expect(note.tags).toContain('important');
  });

  test('should track note creator', () => {
    const note: CampaignNote = {
      id: 'note-creator',
      campaignId: 'campaign-1',
      title: 'DM Note',
      content: 'Created by DM',
      category: 'other',
      tags: [],
      isPublic: false,
      createdBy: 'dm-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(note.createdBy).toBe('dm-123');
  });
});
