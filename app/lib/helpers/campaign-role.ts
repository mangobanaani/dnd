/**
 * Campaign Role Management
 * Helpers for DM/Player role detection and permissions
 */

import { Campaign as BaseCampaign } from '@/app/types/campaign';

// Re-export Campaign type for test compatibility
export type Campaign = BaseCampaign;

/**
 * Get user's role in a campaign
 */
export function getUserRole(campaign: Campaign, userId: string): 'dm' | 'player' | null {
  if (campaign.dmId === userId) {
    return 'dm';
  }

  if (campaign.playerIds && campaign.playerIds.includes(userId)) {
    return 'player';
  }

  return null;
}

/**
 * Check if user is the DM of a campaign
 */
export function isDM(campaign: Campaign, userId: string): boolean {
  return campaign.dmId === userId;
}

/**
 * Check if user is a player in a campaign
 */
export function isPlayer(campaign: Campaign, userId: string): boolean {
  if (!campaign.playerIds) return false;
  return campaign.playerIds.includes(userId);
}

/**
 * Check if user can manage campaign (DM only)
 */
export function canManageCampaign(campaign: Campaign, userId: string): boolean {
  return isDM(campaign, userId);
}

/**
 * Check if user can apply effects to a character
 * DM can apply to anyone, players can only apply to their own characters
 */
export function canApplyEffects(
  campaign: Campaign,
  userId: string,
  characterId: string,
  characters: Array<{ id: string; playerId: string }>
): boolean {
  // DM can apply effects to anyone
  if (isDM(campaign, userId)) {
    return true;
  }

  // Players can only apply effects to their own characters
  if (isPlayer(campaign, userId)) {
    const character = characters.find(c => c.id === characterId);
    return character?.playerId === userId;
  }

  return false;
}

/**
 * Add a player to a campaign
 */
export function addPlayerToCampaign(campaign: Campaign, userId: string): Campaign {
  // Don't add if user is the DM
  if (campaign.dmId === userId) {
    return campaign;
  }

  // Initialize playerIds if undefined
  const playerIds = campaign.playerIds || [];

  // Don't add if already a player
  if (playerIds.includes(userId)) {
    return campaign;
  }

  return {
    ...campaign,
    playerIds: [...playerIds, userId],
  };
}

/**
 * Remove a player from a campaign
 */
export function removePlayerFromCampaign(campaign: Campaign, userId: string): Campaign {
  // Can't remove the DM
  if (campaign.dmId === userId) {
    return campaign;
  }

  // Initialize playerIds if undefined
  const playerIds = campaign.playerIds || [];

  return {
    ...campaign,
    playerIds: playerIds.filter(id => id !== userId),
  };
}
