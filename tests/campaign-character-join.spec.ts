import { test, expect } from '@playwright/test';
import type { Campaign } from '@/app/types/campaign';
import type { Character } from '@/app/types/character';

test.describe('Campaign-Character Join Functionality', () => {
  test.describe('Adding Character to Campaign', () => {
    test('should add character ID to campaign.characterIds array', () => {
      const campaign: Campaign = {
        id: 'campaign-1',
        name: 'Test Campaign',
        description: '',
        setting: 'Forgotten Realms',
        startDate: new Date().toISOString(),
        status: 'active',
        edition: '5e',
        homebrew: false,
        difficultyLevel: 'normal',
        dmId: 'dm-1',
        playerIds: [],
        characterIds: [],
        sessionCount: 0,
        totalSessions: 0,
        currentLevel: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        isPublic: false,
      };

      const characterId = 'char-1';

      // Function to add character to campaign
      const addCharacterToCampaign = (
        campaign: Campaign,
        characterId: string,
        playerId: string
      ): Campaign => {
        return {
          ...campaign,
          characterIds: [...campaign.characterIds, characterId],
          playerIds: campaign.playerIds.includes(playerId)
            ? campaign.playerIds
            : [...campaign.playerIds, playerId],
          updatedAt: new Date().toISOString(),
        };
      };

      const updated = addCharacterToCampaign(campaign, characterId, 'player-1');

      expect(updated.characterIds).toContain(characterId);
      expect(updated.characterIds.length).toBe(1);
      expect(updated.playerIds).toContain('player-1');
    });

    test('should not add duplicate character ID', () => {
      const campaign: Campaign = {
        id: 'campaign-1',
        name: 'Test Campaign',
        description: '',
        setting: 'Forgotten Realms',
        startDate: new Date().toISOString(),
        status: 'active',
        edition: '5e',
        homebrew: false,
        difficultyLevel: 'normal',
        dmId: 'dm-1',
        playerIds: ['player-1'],
        characterIds: ['char-1'],
        sessionCount: 0,
        totalSessions: 0,
        currentLevel: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        isPublic: false,
      };

      const addCharacterToCampaign = (
        campaign: Campaign,
        characterId: string,
        playerId: string
      ): Campaign => {
        // Don't add if already exists
        if (campaign.characterIds.includes(characterId)) {
          return campaign;
        }

        return {
          ...campaign,
          characterIds: [...campaign.characterIds, characterId],
          playerIds: campaign.playerIds.includes(playerId)
            ? campaign.playerIds
            : [...campaign.playerIds, playerId],
          updatedAt: new Date().toISOString(),
        };
      };

      const updated = addCharacterToCampaign(campaign, 'char-1', 'player-1');

      expect(updated.characterIds.length).toBe(1);
      expect(updated.characterIds).toEqual(['char-1']);
    });

    test('should add player ID when adding their character', () => {
      const campaign: Campaign = {
        id: 'campaign-1',
        name: 'Test Campaign',
        description: '',
        setting: 'Forgotten Realms',
        startDate: new Date().toISOString(),
        status: 'active',
        edition: '5e',
        homebrew: false,
        difficultyLevel: 'normal',
        dmId: 'dm-1',
        playerIds: [],
        characterIds: [],
        sessionCount: 0,
        totalSessions: 0,
        currentLevel: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        isPublic: false,
      };

      const addCharacterToCampaign = (
        campaign: Campaign,
        characterId: string,
        playerId: string
      ): Campaign => {
        return {
          ...campaign,
          characterIds: [...campaign.characterIds, characterId],
          playerIds: campaign.playerIds.includes(playerId)
            ? campaign.playerIds
            : [...campaign.playerIds, playerId],
          updatedAt: new Date().toISOString(),
        };
      };

      const updated = addCharacterToCampaign(campaign, 'char-1', 'player-new');

      expect(updated.playerIds).toContain('player-new');
      expect(updated.playerIds.length).toBe(1);
    });
  });

  test.describe('Removing Character from Campaign', () => {
    test('should remove character ID from campaign', () => {
      const campaign: Campaign = {
        id: 'campaign-1',
        name: 'Test Campaign',
        description: '',
        setting: 'Forgotten Realms',
        startDate: new Date().toISOString(),
        status: 'active',
        edition: '5e',
        homebrew: false,
        difficultyLevel: 'normal',
        dmId: 'dm-1',
        playerIds: ['player-1', 'player-2'],
        characterIds: ['char-1', 'char-2'],
        sessionCount: 0,
        totalSessions: 0,
        currentLevel: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        isPublic: false,
      };

      const removeCharacterFromCampaign = (
        campaign: Campaign,
        characterId: string
      ): Campaign => {
        return {
          ...campaign,
          characterIds: campaign.characterIds.filter((id) => id !== characterId),
          updatedAt: new Date().toISOString(),
        };
      };

      const updated = removeCharacterFromCampaign(campaign, 'char-1');

      expect(updated.characterIds).not.toContain('char-1');
      expect(updated.characterIds.length).toBe(1);
      expect(updated.characterIds).toEqual(['char-2']);
    });

    test('should handle removing non-existent character gracefully', () => {
      const campaign: Campaign = {
        id: 'campaign-1',
        name: 'Test Campaign',
        description: '',
        setting: 'Forgotten Realms',
        startDate: new Date().toISOString(),
        status: 'active',
        edition: '5e',
        homebrew: false,
        difficultyLevel: 'normal',
        dmId: 'dm-1',
        playerIds: ['player-1'],
        characterIds: ['char-1'],
        sessionCount: 0,
        totalSessions: 0,
        currentLevel: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        isPublic: false,
      };

      const removeCharacterFromCampaign = (
        campaign: Campaign,
        characterId: string
      ): Campaign => {
        return {
          ...campaign,
          characterIds: campaign.characterIds.filter((id) => id !== characterId),
          updatedAt: new Date().toISOString(),
        };
      };

      const updated = removeCharacterFromCampaign(campaign, 'non-existent');

      expect(updated.characterIds).toEqual(['char-1']);
      expect(updated.characterIds.length).toBe(1);
    });
  });

  test.describe('Character Campaign Assignment', () => {
    test('should set campaignId on character when joining', () => {
      const character: Partial<Character> = {
        id: 'char-1',
        name: 'Test Hero',
        campaignId: undefined,
      };

      const joinCampaign = (
        character: Partial<Character>,
        campaignId: string
      ): Partial<Character> => {
        return {
          ...character,
          campaignId,
          updatedAt: new Date().toISOString(),
        };
      };

      const updated = joinCampaign(character, 'campaign-1');

      expect(updated.campaignId).toBe('campaign-1');
    });

    test('should clear campaignId when leaving campaign', () => {
      const character: Partial<Character> = {
        id: 'char-1',
        name: 'Test Hero',
        campaignId: 'campaign-1',
      };

      const leaveCampaign = (character: Partial<Character>): Partial<Character> => {
        return {
          ...character,
          campaignId: undefined,
          updatedAt: new Date().toISOString(),
        };
      };

      const updated = leaveCampaign(character);

      expect(updated.campaignId).toBeUndefined();
    });

    test('should handle character switching campaigns', () => {
      const character: Partial<Character> = {
        id: 'char-1',
        name: 'Test Hero',
        campaignId: 'campaign-1',
      };

      const switchCampaign = (
        character: Partial<Character>,
        newCampaignId: string
      ): Partial<Character> => {
        return {
          ...character,
          campaignId: newCampaignId,
          updatedAt: new Date().toISOString(),
        };
      };

      const updated = switchCampaign(character, 'campaign-2');

      expect(updated.campaignId).toBe('campaign-2');
      expect(updated.campaignId).not.toBe('campaign-1');
    });
  });

  test.describe('Bidirectional Consistency', () => {
    test('adding character to campaign should maintain both sides', () => {
      const campaign: Campaign = {
        id: 'campaign-1',
        name: 'Test Campaign',
        description: '',
        setting: 'Forgotten Realms',
        startDate: new Date().toISOString(),
        status: 'active',
        edition: '5e',
        homebrew: false,
        difficultyLevel: 'normal',
        dmId: 'dm-1',
        playerIds: [],
        characterIds: [],
        sessionCount: 0,
        totalSessions: 0,
        currentLevel: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        isPublic: false,
      };

      const character: Partial<Character> = {
        id: 'char-1',
        name: 'Test Hero',
        campaignId: undefined,
        playerId: 'player-1',
      };

      // Simulating the full join process
      const joinCharacterToCampaign = (
        campaign: Campaign,
        character: Partial<Character>
      ): { campaign: Campaign; character: Partial<Character> } => {
        const updatedCampaign = {
          ...campaign,
          characterIds: [...campaign.characterIds, character.id!],
          playerIds: campaign.playerIds.includes(character.playerId!)
            ? campaign.playerIds
            : [...campaign.playerIds, character.playerId!],
          updatedAt: new Date().toISOString(),
        };

        const updatedCharacter = {
          ...character,
          campaignId: campaign.id,
          updatedAt: new Date().toISOString(),
        };

        return {
          campaign: updatedCampaign,
          character: updatedCharacter,
        };
      };

      const result = joinCharacterToCampaign(campaign, character);

      // Verify both sides are consistent
      expect(result.campaign.characterIds).toContain('char-1');
      expect(result.character.campaignId).toBe('campaign-1');
      expect(result.campaign.playerIds).toContain('player-1');
    });

    test('removing character should update both sides', () => {
      const campaign: Campaign = {
        id: 'campaign-1',
        name: 'Test Campaign',
        description: '',
        setting: 'Forgotten Realms',
        startDate: new Date().toISOString(),
        status: 'active',
        edition: '5e',
        homebrew: false,
        difficultyLevel: 'normal',
        dmId: 'dm-1',
        playerIds: ['player-1'],
        characterIds: ['char-1'],
        sessionCount: 0,
        totalSessions: 0,
        currentLevel: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        isPublic: false,
      };

      const character: Partial<Character> = {
        id: 'char-1',
        name: 'Test Hero',
        campaignId: 'campaign-1',
      };

      const removeCharacterFromCampaign = (
        campaign: Campaign,
        character: Partial<Character>
      ): { campaign: Campaign; character: Partial<Character> } => {
        const updatedCampaign = {
          ...campaign,
          characterIds: campaign.characterIds.filter((id) => id !== character.id),
          updatedAt: new Date().toISOString(),
        };

        const updatedCharacter = {
          ...character,
          campaignId: undefined,
          updatedAt: new Date().toISOString(),
        };

        return {
          campaign: updatedCampaign,
          character: updatedCharacter,
        };
      };

      const result = removeCharacterFromCampaign(campaign, character);

      // Verify both sides are consistent
      expect(result.campaign.characterIds).not.toContain('char-1');
      expect(result.character.campaignId).toBeUndefined();
    });
  });

  test.describe('Validation Rules', () => {
    test('should not allow adding character without playerId', () => {
      const isValidCharacterForCampaign = (character: Partial<Character>): boolean => {
        return !!character.id && !!character.playerId;
      };

      const characterWithoutPlayer: Partial<Character> = {
        id: 'char-1',
        name: 'Test Hero',
        playerId: undefined,
      };

      expect(isValidCharacterForCampaign(characterWithoutPlayer)).toBe(false);
    });

    test('should not allow character to join multiple campaigns simultaneously', () => {
      const canJoinCampaign = (character: Partial<Character>): boolean => {
        return !character.campaignId; // Can only join if not already in a campaign
      };

      const characterInCampaign: Partial<Character> = {
        id: 'char-1',
        name: 'Test Hero',
        campaignId: 'campaign-1',
      };

      const characterNotInCampaign: Partial<Character> = {
        id: 'char-2',
        name: 'Another Hero',
        campaignId: undefined,
      };

      expect(canJoinCampaign(characterInCampaign)).toBe(false);
      expect(canJoinCampaign(characterNotInCampaign)).toBe(true);
    });

    test('should validate campaign status allows new characters', () => {
      const canAddCharacterToCampaign = (campaign: Campaign): boolean => {
        return campaign.status === 'planning' || campaign.status === 'active';
      };

      const activeCampaign: Campaign = {
        id: 'campaign-1',
        name: 'Test Campaign',
        description: '',
        setting: 'Forgotten Realms',
        startDate: new Date().toISOString(),
        status: 'active',
        edition: '5e',
        homebrew: false,
        difficultyLevel: 'normal',
        dmId: 'dm-1',
        playerIds: [],
        characterIds: [],
        sessionCount: 0,
        totalSessions: 0,
        currentLevel: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        isPublic: false,
      };

      const completedCampaign: Campaign = {
        ...activeCampaign,
        status: 'completed',
      };

      expect(canAddCharacterToCampaign(activeCampaign)).toBe(true);
      expect(canAddCharacterToCampaign(completedCampaign)).toBe(false);
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle empty characterIds array', () => {
      const campaign: Campaign = {
        id: 'campaign-1',
        name: 'Test Campaign',
        description: '',
        setting: 'Forgotten Realms',
        startDate: new Date().toISOString(),
        status: 'active',
        edition: '5e',
        homebrew: false,
        difficultyLevel: 'normal',
        dmId: 'dm-1',
        playerIds: [],
        characterIds: [],
        sessionCount: 0,
        totalSessions: 0,
        currentLevel: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        isPublic: false,
      };

      expect(Array.isArray(campaign.characterIds)).toBe(true);
      expect(campaign.characterIds.length).toBe(0);
    });

    test('should handle campaign with many characters', () => {
      const campaign: Campaign = {
        id: 'campaign-1',
        name: 'Test Campaign',
        description: '',
        setting: 'Forgotten Realms',
        startDate: new Date().toISOString(),
        status: 'active',
        edition: '5e',
        homebrew: false,
        difficultyLevel: 'normal',
        dmId: 'dm-1',
        playerIds: Array.from({ length: 10 }, (_, i) => `player-${i}`),
        characterIds: Array.from({ length: 10 }, (_, i) => `char-${i}`),
        sessionCount: 0,
        totalSessions: 0,
        currentLevel: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        isPublic: false,
      };

      expect(campaign.characterIds.length).toBe(10);
      expect(campaign.playerIds.length).toBe(10);
    });

    test('should maintain referential integrity when character deleted', () => {
      const campaign: Campaign = {
        id: 'campaign-1',
        name: 'Test Campaign',
        description: '',
        setting: 'Forgotten Realms',
        startDate: new Date().toISOString(),
        status: 'active',
        edition: '5e',
        homebrew: false,
        difficultyLevel: 'normal',
        dmId: 'dm-1',
        playerIds: ['player-1', 'player-2'],
        characterIds: ['char-1', 'char-2'],
        sessionCount: 0,
        totalSessions: 0,
        currentLevel: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        isPublic: false,
      };

      // Simulate character deletion - should remove from campaign
      const cleanupDeletedCharacter = (
        campaign: Campaign,
        deletedCharacterId: string
      ): Campaign => {
        return {
          ...campaign,
          characterIds: campaign.characterIds.filter((id) => id !== deletedCharacterId),
          updatedAt: new Date().toISOString(),
        };
      };

      const updated = cleanupDeletedCharacter(campaign, 'char-1');

      expect(updated.characterIds).not.toContain('char-1');
      expect(updated.characterIds.length).toBe(1);
    });
  });
});
