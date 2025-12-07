/**
 * Campaign Role System Tests
 * Tests for DM/Player role detection and management
 */

import {
  getUserRole,
  isDM,
  isPlayer,
  canManageCampaign,
  canApplyEffects,
  addPlayerToCampaign,
  removePlayerFromCampaign,
  Campaign,
} from '@/app/lib/helpers/campaign-role';

describe('Campaign Role Helpers', () => {
  const mockCampaign: Campaign = {
    id: 'campaign-1',
    name: 'Test Campaign',
    description: '',
    setting: '',
    dmId: 'user-dm',
    playerIds: ['user-player1', 'user-player2'],
    characterIds: ['char-1', 'char-2'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  describe('getUserRole', () => {
    it('should return "dm" for campaign creator', () => {
      const role = getUserRole(mockCampaign, 'user-dm');
      expect(role).toBe('dm');
    });

    it('should return "player" for campaign member', () => {
      const role = getUserRole(mockCampaign, 'user-player1');
      expect(role).toBe('player');
    });

    it('should return null for non-member', () => {
      const role = getUserRole(mockCampaign, 'user-stranger');
      expect(role).toBeNull();
    });

    it('should handle campaign without playerIds array', () => {
      const campaignWithoutPlayers = { ...mockCampaign, playerIds: undefined };
      const role = getUserRole(campaignWithoutPlayers as any, 'user-player1');
      expect(role).toBeNull();
    });
  });

  describe('isDM', () => {
    it('should return true for DM', () => {
      expect(isDM(mockCampaign, 'user-dm')).toBe(true);
    });

    it('should return false for player', () => {
      expect(isDM(mockCampaign, 'user-player1')).toBe(false);
    });

    it('should return false for non-member', () => {
      expect(isDM(mockCampaign, 'user-stranger')).toBe(false);
    });
  });

  describe('isPlayer', () => {
    it('should return true for player', () => {
      expect(isPlayer(mockCampaign, 'user-player1')).toBe(true);
      expect(isPlayer(mockCampaign, 'user-player2')).toBe(true);
    });

    it('should return false for DM', () => {
      expect(isPlayer(mockCampaign, 'user-dm')).toBe(false);
    });

    it('should return false for non-member', () => {
      expect(isPlayer(mockCampaign, 'user-stranger')).toBe(false);
    });
  });

  describe('canManageCampaign', () => {
    it('should allow DM to manage campaign', () => {
      expect(canManageCampaign(mockCampaign, 'user-dm')).toBe(true);
    });

    it('should not allow player to manage campaign', () => {
      expect(canManageCampaign(mockCampaign, 'user-player1')).toBe(false);
    });

    it('should not allow non-member to manage campaign', () => {
      expect(canManageCampaign(mockCampaign, 'user-stranger')).toBe(false);
    });
  });

  describe('canApplyEffects', () => {
    it('should allow DM to apply effects to anyone', () => {
      expect(canApplyEffects(mockCampaign, 'user-dm', 'char-1')).toBe(true);
      expect(canApplyEffects(mockCampaign, 'user-dm', 'char-2')).toBe(true);
    });

    it('should allow player to apply effects to own character', () => {
      expect(canApplyEffects(mockCampaign, 'user-player1', 'char-1')).toBe(true);
    });

    it('should not allow player to apply effects to other characters', () => {
      expect(canApplyEffects(mockCampaign, 'user-player1', 'char-2')).toBe(false);
    });

    it('should not allow non-member to apply effects', () => {
      expect(canApplyEffects(mockCampaign, 'user-stranger', 'char-1')).toBe(false);
    });
  });

  describe('addPlayerToCampaign', () => {
    it('should add new player to campaign', () => {
      const updated = addPlayerToCampaign(mockCampaign, 'user-player3');

      expect(updated.playerIds).toHaveLength(3);
      expect(updated.playerIds).toContain('user-player3');
    });

    it('should not add duplicate player', () => {
      const updated = addPlayerToCampaign(mockCampaign, 'user-player1');

      expect(updated.playerIds).toHaveLength(2);
      expect(updated.playerIds.filter(id => id === 'user-player1')).toHaveLength(1);
    });

    it('should not add DM as player', () => {
      const updated = addPlayerToCampaign(mockCampaign, 'user-dm');

      expect(updated.playerIds).toHaveLength(2);
      expect(updated.playerIds).not.toContain('user-dm');
    });

    it('should initialize playerIds if undefined', () => {
      const campaignWithoutPlayers = { ...mockCampaign, playerIds: undefined };
      const updated = addPlayerToCampaign(campaignWithoutPlayers as any, 'user-new');

      expect(updated.playerIds).toEqual(['user-new']);
    });
  });

  describe('removePlayerFromCampaign', () => {
    it('should remove existing player', () => {
      const updated = removePlayerFromCampaign(mockCampaign, 'user-player1');

      expect(updated.playerIds).toHaveLength(1);
      expect(updated.playerIds).not.toContain('user-player1');
      expect(updated.playerIds).toContain('user-player2');
    });

    it('should handle removing non-existent player', () => {
      const updated = removePlayerFromCampaign(mockCampaign, 'user-stranger');

      expect(updated.playerIds).toHaveLength(2);
      expect(updated.playerIds).toEqual(mockCampaign.playerIds);
    });

    it('should not remove DM', () => {
      const updated = removePlayerFromCampaign(mockCampaign, 'user-dm');

      expect(updated.dmId).toBe('user-dm');
      expect(updated.playerIds).toEqual(mockCampaign.playerIds);
    });

    it('should handle campaign without playerIds', () => {
      const campaignWithoutPlayers = { ...mockCampaign, playerIds: undefined };
      const updated = removePlayerFromCampaign(campaignWithoutPlayers as any, 'user-player1');

      expect(updated.playerIds).toEqual([]);
    });
  });
});
