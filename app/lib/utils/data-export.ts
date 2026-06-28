/**
 * Data Export/Import Utilities
 * Handles backup and restore of all application data
 */

import { migrateLocalStorage } from '@/app/lib/migrations/effects-migration';

export interface ExportData {
  version: number;
  timestamp: string;
  data: {
    campaigns: string | null;
    characters: string | null;
    [key: string]: string | null;
  };
}

const EXPORT_VERSION = 1;

const DATA_KEYS = [
  'dnd-campaigns',
  'dnd-characters',
  'dnd-sessions',
  'dnd-custom-monsters',
  'dnd-monster-favorites',
  'dnd-monster-history',
  'dnd-locations',
  'dnd-npcs',
  'dnd-quests',
  'dnd-saved-encounters',
] as const;

/**
 * Export all application data as JSON
 */
export function exportAllData(): ExportData {
  const data: ExportData['data'] = {} as ExportData['data'];

  // Export all known data keys
  DATA_KEYS.forEach((key) => {
    data[key] = localStorage.getItem(key);
  });

  // Export campaign-specific data (notes, sessions, npcs, locations, quests)
  const campaignsData = localStorage.getItem('dnd-campaigns');
  if (campaignsData) {
    try {
      const campaigns = JSON.parse(campaignsData);
      campaigns.forEach((campaign: { id: string }) => {
        const campaignKeys = [
          `dnd-campaign-notes-${campaign.id}`,
          `dnd-campaign-sessions-${campaign.id}`,
          `dnd-campaign-npcs-${campaign.id}`,
          `dnd-campaign-locations-${campaign.id}`,
          `dnd-campaign-quests-${campaign.id}`,
        ];

        campaignKeys.forEach((key) => {
          const value = localStorage.getItem(key);
          if (value) {
            data[key] = value;
          }
        });
      });
    } catch (error) {
      console.error('Failed to parse campaigns for export:', error);
    }
  }

  return {
    version: EXPORT_VERSION,
    timestamp: new Date().toISOString(),
    data,
  };
}

/**
 * Download exported data as JSON file
 */
export function downloadExportData(exportData: ExportData): void {
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `dnd-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import data from JSON
 */
export function importData(exportData: ExportData): {
  success: boolean;
  message: string;
  imported: number;
} {
  try {
    if (exportData.version !== EXPORT_VERSION) {
      return {
        success: false,
        message: `Unsupported data version: ${exportData.version}`,
        imported: 0,
      };
    }

    let imported = 0;
    const skipped: string[] = [];

    // Build an allowlist of accepted keys: static DATA_KEYS plus dynamic
    // per-campaign key patterns.
    const staticAllowlist = new Set<string>(DATA_KEYS as unknown as string[]);

    const isAllowedKey = (key: string): boolean => {
      if (staticAllowlist.has(key)) return true;
      // Dynamic per-campaign keys: dnd-campaign-{notes|sessions|npcs|locations|quests}-<id>
      return /^dnd-campaign-(notes|sessions|npcs|locations|quests)-[^/]+$/.test(key);
    };

    Object.entries(exportData.data).forEach(([key, value]) => {
      if (value === null) return;

      if (!isAllowedKey(key)) {
        skipped.push(key);
        return;
      }

      // Confirm the value is valid JSON before storing it.
      try {
        JSON.parse(value);
      } catch {
        skipped.push(key);
        return;
      }

      localStorage.setItem(key, value);
      imported++;
    });

    // Upgrade any legacy data that was just restored.
    migrateLocalStorage();

    return {
      success: true,
      message: `Successfully imported ${imported} data items${skipped.length > 0 ? ` (${skipped.length} skipped)` : ''}`,
      imported,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Import failed',
      imported: 0,
    };
  }
}

/**
 * Clear all application data
 */
export function clearAllData(): { success: boolean; message: string } {
  try {
    const keysToRemove: string[] = [];

    // Collect all keys to remove
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('dnd-')) {
        keysToRemove.push(key);
      }
    }

    // Remove all keys
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    return {
      success: true,
      message: `Cleared ${keysToRemove.length} data items`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Clear failed',
    };
  }
}

/**
 * Parse imported file
 */
export function parseImportFile(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        if (!data.version || !data.timestamp || !data.data) {
          reject(new Error('Invalid backup file format'));
          return;
        }

        resolve(data as ExportData);
      } catch (error) {
        reject(new Error('Failed to parse backup file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
