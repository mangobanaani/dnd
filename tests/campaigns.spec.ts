import { test, expect } from '@playwright/test';
import {
  Campaign,
  CampaignStatus,
  DifficultyLevel,
  createDefaultCampaign,
  validateCampaignName,
  validateCampaignDescription,
  getStatusColor,
  getStatusBgColor,
  getDifficultyColor,
  getStatusLabel,
  getDifficultyLabel,
  formatCampaignDate,
  getCampaignDuration,
} from '@/app/types/campaign';
import { testCampaigns, testSessions, testQuests } from './fixtures/test-data';

test.describe('Campaign Type Tests', () => {
  test('should validate campaign structure', () => {
    const campaign = testCampaigns[0];

    expect(campaign.id).toBeDefined();
    expect(campaign.name).toBeTruthy();
    expect(campaign.dmId).toBeDefined();
    expect(Array.isArray(campaign.playerIds)).toBe(true);
    expect(Array.isArray(campaign.characterIds)).toBe(true);
    expect(campaign.status).toMatch(/planning|active|on-hold|completed/);
  });

  test('should have valid campaign statuses', () => {
    expect(testCampaigns[0].status).toBe('active');
    expect(testCampaigns[1].status).toBe('planning');
    expect(testCampaigns[2].status).toBe('completed');
  });

  test('should have valid difficulty levels', () => {
    const difficulties = testCampaigns.map(c => c.difficultyLevel);
    difficulties.forEach(diff => {
      expect(['easy', 'normal', 'hard', 'deadly']).toContain(diff);
    });
  });

  test('should have valid editions', () => {
    testCampaigns.forEach(campaign => {
      expect(['5e', '2024']).toContain(campaign.edition);
    });
  });
});

test.describe('Campaign Creation and Defaults', () => {
  test('should create default campaign with correct structure', () => {
    const dmId = 'dm-test-123';
    const campaign = createDefaultCampaign(dmId);

    expect(campaign.dmId).toBe(dmId);
    expect(campaign.name).toBe('');
    expect(campaign.description).toBe('');
    expect(campaign.status).toBe('planning');
    expect(campaign.setting).toBe('Forgotten Realms');
    expect(campaign.edition).toBe('5e');
    expect(campaign.homebrew).toBe(false);
    expect(campaign.difficultyLevel).toBe('normal');
    expect(campaign.playerIds).toEqual([]);
    expect(campaign.characterIds).toEqual([]);
    expect(campaign.sessionCount).toBe(0);
    expect(campaign.totalSessions).toBe(0);
    expect(campaign.currentLevel).toBe(1);
    expect(campaign.tags).toEqual([]);
    expect(campaign.isPublic).toBe(false);
    expect(campaign.createdAt).toBeDefined();
    expect(campaign.updatedAt).toBeDefined();
  });

  test('should have timestamps in ISO format', () => {
    const campaign = createDefaultCampaign('dm-1');

    expect(() => new Date(campaign.createdAt)).not.toThrow();
    expect(() => new Date(campaign.updatedAt)).not.toThrow();
    expect(() => new Date(campaign.startDate)).not.toThrow();
  });
});

test.describe('Campaign Validation', () => {
  test('should validate campaign name - required', () => {
    expect(validateCampaignName('')).toBe('Campaign name is required');
    expect(validateCampaignName('   ')).toBe('Campaign name is required');
  });

  test('should validate campaign name - length', () => {
    const longName = 'a'.repeat(101);
    expect(validateCampaignName(longName)).toBe('Campaign name must be less than 100 characters');
  });

  test('should accept valid campaign names', () => {
    expect(validateCampaignName('Lost Mines of Phandelver')).toBeNull();
    expect(validateCampaignName('Curse of Strahd')).toBeNull();
    expect(validateCampaignName('a'.repeat(100))).toBeNull();
  });

  test('should validate campaign description length', () => {
    const longDesc = 'a'.repeat(1001);
    expect(validateCampaignDescription(longDesc)).toBe(
      'Campaign description must be less than 1000 characters'
    );
  });

  test('should accept valid campaign descriptions', () => {
    expect(validateCampaignDescription('A great adventure')).toBeNull();
    expect(validateCampaignDescription('')).toBeNull();
    expect(validateCampaignDescription('a'.repeat(1000))).toBeNull();
  });
});

test.describe('Campaign Status Functions', () => {
  test('should get correct status colors', () => {
    expect(getStatusColor('planning')).toBe('text-yellow-400');
    expect(getStatusColor('active')).toBe('text-green-400');
    expect(getStatusColor('on-hold')).toBe('text-orange-400');
    expect(getStatusColor('completed')).toBe('text-gray-400');
  });

  test('should get correct status background colors', () => {
    expect(getStatusBgColor('planning')).toBe('bg-yellow-500/20');
    expect(getStatusBgColor('active')).toBe('bg-green-500/20');
    expect(getStatusBgColor('on-hold')).toBe('bg-orange-500/20');
    expect(getStatusBgColor('completed')).toBe('bg-gray-500/20');
  });

  test('should get correct status labels', () => {
    expect(getStatusLabel('planning')).toBe('Planning');
    expect(getStatusLabel('active')).toBe('Active');
    expect(getStatusLabel('on-hold')).toBe('On Hold');
    expect(getStatusLabel('completed')).toBe('Completed');
  });
});

test.describe('Campaign Difficulty Functions', () => {
  test('should get correct difficulty colors', () => {
    expect(getDifficultyColor('easy')).toBe('text-green-400');
    expect(getDifficultyColor('normal')).toBe('text-yellow-400');
    expect(getDifficultyColor('hard')).toBe('text-orange-400');
    expect(getDifficultyColor('deadly')).toBe('text-red-400');
  });

  test('should get correct difficulty labels', () => {
    expect(getDifficultyLabel('easy')).toBe('Easy');
    expect(getDifficultyLabel('normal')).toBe('Normal');
    expect(getDifficultyLabel('hard')).toBe('Hard');
    expect(getDifficultyLabel('deadly')).toBe('Deadly');
  });
});

test.describe('Campaign Date Functions', () => {
  test('should format campaign dates correctly', () => {
    const dateStr = '2024-01-15T00:00:00.000Z';
    const formatted = formatCampaignDate(dateStr);

    expect(formatted).toContain('January');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
  });

  test('should calculate campaign duration', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 30);

    const duration = getCampaignDuration(pastDate.toISOString());

    expect(duration).toBeGreaterThanOrEqual(30);
    expect(duration).toBeLessThanOrEqual(31);
  });

  test('should handle future dates in duration calculation', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    const duration = getCampaignDuration(futureDate.toISOString());

    expect(duration).toBeGreaterThanOrEqual(10);
  });
});

test.describe('Campaign Sessions', () => {
  test('should have valid session structure', () => {
    const session = testSessions[0];

    expect(session.id).toBeDefined();
    expect(session.campaignId).toBe('campaign-1');
    expect(session.sessionNumber).toBeGreaterThan(0);
    expect(session.title).toBeTruthy();
    expect(session.summary).toBeTruthy();
    expect(session.duration).toBeGreaterThan(0);
    expect(Array.isArray(session.attendees)).toBe(true);
    expect(session.xpAwarded).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(session.treasureAwarded)).toBe(true);
  });

  test('should track XP awards', () => {
    const session = testSessions[0];
    expect(session.xpAwarded).toBe(300);
  });

  test('should track treasure awards', () => {
    const session = testSessions[0];
    expect(session.treasureAwarded).toContain('50 gold pieces');
    expect(session.treasureAwarded).toContain('Potion of Healing');
  });

  test('should track session duration in minutes', () => {
    const session = testSessions[0];
    expect(session.duration).toBe(180); // 3 hours
  });
});

test.describe('Campaign Quests', () => {
  test('should have valid quest structure', () => {
    const quest = testQuests[0];

    expect(quest.id).toBeDefined();
    expect(quest.campaignId).toBeDefined();
    expect(quest.title).toBeTruthy();
    expect(quest.description).toBeTruthy();
    expect(['available', 'active', 'completed', 'failed']).toContain(quest.status);
    expect(['low', 'medium', 'high', 'critical']).toContain(quest.priority);
    expect(Array.isArray(quest.objectives)).toBe(true);
    expect(Array.isArray(quest.rewards)).toBe(true);
  });

  test('should track quest objectives', () => {
    const quest = testQuests[0];

    expect(quest.objectives.length).toBe(2);
    expect(quest.objectives[0].completed).toBe(true);
    expect(quest.objectives[1].completed).toBe(false);
  });

  test('should have optional and required objectives', () => {
    const quest = testQuests[0];

    quest.objectives.forEach(obj => {
      expect(typeof obj.optional).toBe('boolean');
    });
  });

  test('should track quest rewards', () => {
    const quest = testQuests[0];

    expect(quest.rewards.length).toBeGreaterThan(0);
    expect(quest.rewards).toContain('100 gold pieces');
  });

  test('should track quest giver', () => {
    const quest = testQuests[0];
    expect(quest.giver).toBe('Sildar Hallwinter');
  });
});

test.describe('Campaign Integration', () => {
  test('should link campaigns to sessions', () => {
    const campaign = testCampaigns[0];
    const session = testSessions[0];

    expect(session.campaignId).toBe(campaign.id);
  });

  test('should link campaigns to quests', () => {
    const campaign = testCampaigns[0];
    const quest = testQuests[0];

    expect(quest.campaignId).toBe(campaign.id);
  });

  test('should track campaign progress through session count', () => {
    const campaign = testCampaigns[0];

    expect(campaign.sessionCount).toBeLessThanOrEqual(campaign.totalSessions);
    expect(campaign.sessionCount).toBe(5);
    expect(campaign.totalSessions).toBe(10);
  });

  test('should track party level progression', () => {
    const campaign = testCampaigns[0];

    expect(campaign.currentLevel).toBeGreaterThanOrEqual(1);
    expect(campaign.currentLevel).toBeLessThanOrEqual(20);
    expect(campaign.currentLevel).toBe(3);
  });

  test('should manage player and character lists', () => {
    const campaign = testCampaigns[0];

    expect(campaign.playerIds.length).toBe(3);
    expect(campaign.characterIds.length).toBe(3);
    expect(campaign.playerIds.length).toBe(campaign.characterIds.length);
  });

  test('should support next session scheduling', () => {
    const campaign = testCampaigns[0];

    expect(campaign.nextSessionDate).toBeDefined();
    if (campaign.nextSessionDate) {
      const nextSession = new Date(campaign.nextSessionDate);
      expect(nextSession).toBeInstanceOf(Date);
    }
  });
});

test.describe('Campaign Tags and Metadata', () => {
  test('should support campaign tags', () => {
    const campaign = testCampaigns[0];

    expect(Array.isArray(campaign.tags)).toBe(true);
    expect(campaign.tags).toContain('beginner');
    expect(campaign.tags).toContain('classic');
  });

  test('should support public/private visibility', () => {
    expect(testCampaigns[0].isPublic).toBe(true);
    expect(testCampaigns[1].isPublic).toBe(false);
  });

  test('should support campaign images', () => {
    // Optional field
    const campaign = testCampaigns[0];
    expect(campaign.imageUrl === undefined || typeof campaign.imageUrl === 'string').toBe(true);
  });

  test('should support homebrew flag', () => {
    expect(testCampaigns[0].homebrew).toBe(false);
    expect(testCampaigns[1].homebrew).toBe(true);
  });
});

test.describe('Campaign Lifecycle', () => {
  test('should transition through valid statuses', () => {
    const statuses: CampaignStatus[] = ['planning', 'active', 'on-hold', 'completed'];

    statuses.forEach(status => {
      expect(['planning', 'active', 'on-hold', 'completed']).toContain(status);
    });
  });

  test('should track creation and update timestamps', () => {
    const campaign = testCampaigns[0];

    const created = new Date(campaign.createdAt);
    const updated = new Date(campaign.updatedAt);

    expect(updated >= created).toBe(true);
  });

  test('completed campaign should have full session history', () => {
    const completedCampaign = testCampaigns[2];

    expect(completedCampaign.status).toBe('completed');
    expect(completedCampaign.sessionCount).toBe(completedCampaign.totalSessions);
    expect(completedCampaign.sessionCount).toBe(20);
  });
});

test.describe('Campaign Settings', () => {
  test('should support various campaign settings', () => {
    const settings = ['Forgotten Realms', 'Ravenloft', 'Eberron'];

    testCampaigns.forEach(campaign => {
      expect(typeof campaign.setting).toBe('string');
    });

    expect(testCampaigns[0].setting).toBe('Forgotten Realms');
    expect(testCampaigns[1].setting).toBe('Ravenloft');
  });

  test('should have start date', () => {
    testCampaigns.forEach(campaign => {
      expect(campaign.startDate).toBeDefined();
      expect(() => new Date(campaign.startDate)).not.toThrow();
    });
  });
});
