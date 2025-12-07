import { dragonlanceSeedData } from '@/app/data/seed/dragonlance';
import { dragonlanceExtendedData } from '@/app/data/seed/dragonlance-extended';
import { StorageService } from './storage.service';

/**
 * Seed Data Service
 * Loads example campaign data into the application
 */
export class SeedDataService {
  private static SEED_FLAG_KEY = 'app:seed:loaded';

  /**
   * Check if seed data has been loaded
   */
  static isSeedDataLoaded(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(this.SEED_FLAG_KEY) === 'true';
  }

  /**
   * Load Dragonlance seed data into the application
   * Includes: Campaign, Characters, Locations, Sessions, Encounters, NPCs, Quests
   */
  static async loadDragonlanceSeedData(): Promise<{
    success: boolean;
    message: string;
    data?: {
      campaign: any;
      characters: number;
      locations: number;
      sessions: number;
      encounters: number;
      npcs: number;
      quests: number;
    };
  }> {
    try {
      if (typeof window === 'undefined') {
        return {
          success: false,
          message: 'Cannot load seed data on server side',
        };
      }

      // Load Campaign
      const campaignService = new StorageService('dnd-campaigns');
      campaignService.add(dragonlanceSeedData.campaign);

      // Load Characters
      const characterService = new StorageService('dnd-characters');
      for (const character of dragonlanceSeedData.characters) {
        characterService.add(character);
      }

      // Load Locations (stored as campaign notes or custom data)
      const locationService = new StorageService('dnd-locations');
      for (const location of dragonlanceSeedData.locations) {
        locationService.add(location);
      }

      // Load Sessions
      const sessionService = new StorageService('dnd-sessions');
      for (const session of dragonlanceExtendedData.sessions) {
        sessionService.add(session);
      }

      // Load Encounters
      const encounterService = new StorageService('dnd-saved-encounters');
      for (const encounter of dragonlanceExtendedData.encounters) {
        encounterService.add(encounter);
      }

      // Load NPCs
      const npcService = new StorageService('dnd-npcs');
      for (const npc of dragonlanceExtendedData.npcs) {
        npcService.add(npc);
      }

      // Load Quests
      const questService = new StorageService('dnd-quests');
      for (const quest of dragonlanceExtendedData.quests) {
        questService.add(quest);
      }

      // Mark seed data as loaded
      localStorage.setItem(this.SEED_FLAG_KEY, 'true');
      localStorage.setItem(
        'app:seed:loaded:timestamp',
        new Date().toISOString()
      );

      return {
        success: true,
        message: 'Dragonlance campaign data loaded successfully!',
        data: {
          campaign: dragonlanceSeedData.campaign,
          characters: dragonlanceSeedData.characters.length,
          locations: dragonlanceSeedData.locations.length,
          sessions: dragonlanceExtendedData.sessions.length,
          encounters: dragonlanceExtendedData.encounters.length,
          npcs: dragonlanceExtendedData.npcs.length,
          quests: dragonlanceExtendedData.quests.length,
        },
      };
    } catch (error) {
      console.error('Failed to load seed data:', error);
      return {
        success: false,
        message: `Failed to load seed data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Clear seed data flag (useful for re-loading)
   */
  static clearSeedFlag(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.SEED_FLAG_KEY);
    localStorage.removeItem('app:seed:loaded:timestamp');
  }

  /**
   * Get seed data load timestamp
   */
  static getSeedLoadTimestamp(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('app:seed:loaded:timestamp');
  }

  /**
   * Clear ALL application data (use with caution!)
   */
  static async clearAllData(): Promise<void> {
    if (typeof window === 'undefined') return;

    const keys = [
      'dnd-campaigns',
      'dnd-characters',
      'dnd-locations',
      'dnd-sessions',
      'dnd-saved-encounters',
      'dnd-npcs',
      'dnd-quests',
    ];

    for (const key of keys) {
      localStorage.removeItem(key);
    }

    this.clearSeedFlag();
  }

  /**
   * Get summary of loaded data
   */
  static getDataSummary(): {
    campaigns: number;
    characters: number;
    locations: number;
    sessions: number;
    encounters: number;
    npcs: number;
    quests: number;
  } {
    if (typeof window === 'undefined') {
      return {
        campaigns: 0,
        characters: 0,
        locations: 0,
        sessions: 0,
        encounters: 0,
        npcs: 0,
        quests: 0,
      };
    }

    const getCount = (key: string): number => {
      try {
        const data = localStorage.getItem(key);
        if (!data) return 0;
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
      } catch {
        return 0;
      }
    };

    return {
      campaigns: getCount('dnd-campaigns'),
      characters: getCount('dnd-characters'),
      locations: getCount('dnd-locations'),
      sessions: getCount('dnd-sessions'),
      encounters: getCount('dnd-saved-encounters'),
      npcs: getCount('dnd-npcs'),
      quests: getCount('dnd-quests'),
    };
  }
}
