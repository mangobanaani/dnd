// D&D Campaign Types and Utilities

export interface Campaign {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;

  // Campaign Settings
  setting: string; // e.g., "Forgotten Realms", "Eberron", "Homebrew"
  startDate: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';

  // Game Details
  edition: '5e' | '2024';
  homebrew: boolean;
  difficultyLevel: 'easy' | 'normal' | 'hard' | 'deadly';

  // Membership
  dmId: string;
  playerIds: string[];
  characterIds: string[];

  // Statistics
  sessionCount: number;
  totalSessions: number;
  currentLevel: number;
  nextSessionDate?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isPublic: boolean;
}

export interface CampaignMember {
  userId: string;
  campaignId: string;
  role: 'dm' | 'player';
  characterIds: string[];
  joinedAt: string;
}

export interface CampaignSession {
  id: string;
  campaignId: string;
  sessionNumber: number;
  title: string;
  summary: string;
  date: string;
  duration: number; // in minutes
  attendees: string[];
  xpAwarded: number;
  treasureAwarded: string[];
  notes: string;
  createdAt: string;
}

export interface CampaignNote {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  category: 'npc' | 'location' | 'quest' | 'lore' | 'other';
  tags: string[];
  isPublic: boolean; // visible to players
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignNPC {
  id: string;
  campaignId: string;
  name: string;
  race?: string;
  occupation?: string;
  location?: string;
  description: string;
  relationship: 'ally' | 'neutral' | 'enemy' | 'unknown';
  status: 'alive' | 'dead' | 'unknown';
  notes: string;
  imageUrl?: string;
  isPublic: boolean; // visible to players
  createdAt: string;
  updatedAt: string;
}

export interface CampaignLocation {
  id: string;
  campaignId: string;
  name: string;
  type: 'city' | 'town' | 'village' | 'dungeon' | 'wilderness' | 'building' | 'other';
  description: string;
  population?: string;
  government?: string;
  notableFeatures: string[];
  connectedLocations: string[]; // IDs of connected locations
  npcs: string[]; // IDs of NPCs in this location
  imageUrl?: string;
  mapUrl?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignQuest {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  giver?: string; // NPC name or ID
  status: 'available' | 'active' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  objectives: QuestObjective[];
  rewards: string[];
  location?: string;
  deadline?: string;
  parentQuestId?: string; // For quest chains
  notes: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  optional: boolean;
}

export interface SavedEncounter {
  id: string;
  name: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  partyLevel: number;
  partySize: number;
  monsters: {
    slug: string;
    name: string;
    cr: number;
    xp: number;
    count: number;
    hp?: number;
    ac?: number;
  }[];
  totalXP: number;
  adjustedXP: number;
  campaignId?: string;
  createdAt: string;
  tags?: string[];
}

// Campaign Settings
export const CAMPAIGN_SETTINGS = [
  'Forgotten Realms',
  'Eberron',
  'Greyhawk',
  'Dragonlance',
  'Ravenloft',
  'Planescape',
  'Dark Sun',
  'Spelljammer',
  'Homebrew',
  'Other',
] as const;

export type CampaignSetting = typeof CAMPAIGN_SETTINGS[number];

// Difficulty Levels
export const DIFFICULTY_LEVELS = [
  'easy',
  'normal',
  'hard',
  'deadly',
] as const;

export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

// Campaign Status
export const CAMPAIGN_STATUSES = [
  'planning',
  'active',
  'on-hold',
  'completed',
] as const;

export type CampaignStatus = typeof CAMPAIGN_STATUSES[number];

// Utility Functions

/**
 * Get status color for UI display
 */
export function getStatusColor(status: CampaignStatus): string {
  switch (status) {
    case 'planning':
      return 'text-yellow-400';
    case 'active':
      return 'text-green-400';
    case 'on-hold':
      return 'text-orange-400';
    case 'completed':
      return 'text-gray-400';
    default:
      return 'text-gray-400';
  }
}

/**
 * Get status background color for UI display
 */
export function getStatusBgColor(status: CampaignStatus): string {
  switch (status) {
    case 'planning':
      return 'bg-yellow-500/20';
    case 'active':
      return 'bg-green-500/20';
    case 'on-hold':
      return 'bg-orange-500/20';
    case 'completed':
      return 'bg-gray-500/20';
    default:
      return 'bg-gray-500/20';
  }
}

/**
 * Get difficulty color for UI display
 */
export function getDifficultyColor(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case 'easy':
      return 'text-green-400';
    case 'normal':
      return 'text-yellow-400';
    case 'hard':
      return 'text-orange-400';
    case 'deadly':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

/**
 * Format campaign date for display
 */
export function formatCampaignDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Calculate campaign duration in days
 */
export function getCampaignDuration(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Create default campaign
 */
export function createDefaultCampaign(dmId: string): Omit<Campaign, 'id'> {
  const now = new Date().toISOString();

  return {
    name: '',
    description: '',
    setting: 'Forgotten Realms',
    startDate: now,
    status: 'planning',
    edition: '5e',
    homebrew: false,
    difficultyLevel: 'normal',
    dmId,
    playerIds: [],
    characterIds: [],
    sessionCount: 0,
    totalSessions: 0,
    currentLevel: 1,
    createdAt: now,
    updatedAt: now,
    tags: [],
    isPublic: false,
  };
}

/**
 * Validate campaign name
 */
export function validateCampaignName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return 'Campaign name is required';
  }
  if (name.length > 100) {
    return 'Campaign name must be less than 100 characters';
  }
  return null;
}

/**
 * Validate campaign description
 */
export function validateCampaignDescription(description: string): string | null {
  if (description.length > 1000) {
    return 'Campaign description must be less than 1000 characters';
  }
  return null;
}

/**
 * Get campaign status label
 */
export function getStatusLabel(status: CampaignStatus): string {
  switch (status) {
    case 'planning':
      return 'Planning';
    case 'active':
      return 'Active';
    case 'on-hold':
      return 'On Hold';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
}

/**
 * Get difficulty label
 */
export function getDifficultyLabel(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case 'easy':
      return 'Easy';
    case 'normal':
      return 'Normal';
    case 'hard':
      return 'Hard';
    case 'deadly':
      return 'Deadly';
    default:
      return difficulty;
  }
}
