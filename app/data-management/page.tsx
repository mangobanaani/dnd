'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { useToast } from '@/app/components/ui/toast';
import { useConfirm } from '@/app/components/ui/confirm-dialog';
import {
  exportAllData,
  downloadExportData,
  importData,
  clearAllData,
  parseImportFile,
  type ExportData,
} from '@/app/lib/utils/data-export';
import { SeedDataService } from '@/app/lib/services/seed-data.service';
import { Sparkles } from 'lucide-react';

export default function DataManagementPage() {
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExport = () => {
    try {
      setIsProcessing(true);
      const exportData = exportAllData();
      downloadExportData(exportData);
      addToast('Data exported successfully', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      addToast('Failed to export data', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    const confirmed = await confirm({
      title: 'Import Data',
      message: 'Importing will overwrite existing data. Continue?',
      confirmLabel: 'Import',
      confirmVariant: 'primary',
    });

    if (!confirmed) return;

    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const exportData = await parseImportFile(file);
      const result = importData(exportData);

      if (result.success) {
        addToast(result.message, 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        addToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Import failed:', error);
      addToast(error instanceof Error ? error.message : 'Import failed', 'error');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearAll = async () => {
    const confirmed = await confirm({
      title: 'Clear All Data',
      message: 'This will delete ALL campaigns, characters, and settings. This action cannot be undone. Are you sure?',
      confirmLabel: 'Delete Everything',
      confirmVariant: 'danger',
    });

    if (!confirmed) return;

    try {
      setIsProcessing(true);
      const result = clearAllData();

      if (result.success) {
        addToast(result.message, 'success');
        setTimeout(() => window.location.href = '/', 1000);
      } else {
        addToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Clear failed:', error);
      addToast('Failed to clear data', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSeedData = async () => {
    const confirmed = await confirm({
      title: 'Load Example Campaign',
      message: 'Load the Dragonlance: Chronicles of the War of the Lance campaign with 8 characters, locations, sessions, and encounters? This will add example data to your app.',
      confirmLabel: 'Load Dragonlance Campaign',
      confirmVariant: 'primary',
    });

    if (!confirmed) return;

    try {
      setIsProcessing(true);
      const result = await SeedDataService.loadDragonlanceSeedData();

      if (result.success && result.data) {
        addToast(
          `Loaded: 1 campaign, ${result.data.characters} characters, ${result.data.locations} locations, ${result.data.sessions} sessions, ${result.data.encounters} encounters!`,
          'success'
        );
        setTimeout(() => window.location.href = '/campaigns', 1500);
      } else {
        addToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Seed data load failed:', error);
      addToast('Failed to load example campaign', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const isSeedDataLoaded = typeof window !== 'undefined' && SeedDataService.isSeedDataLoaded();
  const dataSummary = typeof window !== 'undefined' ? SeedDataService.getDataSummary() : null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-[#8b5cf6] hover:text-[#7c3aed] mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-[#fafafa] mb-2">
            Data Management
          </h1>
          <p className="text-[#a1a1aa]">
            Export, import, and manage your D&D Campaign Manager data
          </p>
        </div>

        <div className="space-y-6">
          {/* Example Campaign Section */}
          <div className="glass-premium rounded-xl p-6 border-[#d4af37]/30">
            <div className="flex items-start gap-4">
              <div className="text-4xl">
                <Sparkles className="w-10 h-10 text-[#d4af37]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-[#f5f5f5]">
                    Example Campaign: Dragonlance
                  </h2>
                  {isSeedDataLoaded && (
                    <Badge variant="gold" glow size="sm">
                      Loaded
                    </Badge>
                  )}
                </div>
                <p className="text-[#a1a1aa] mb-4">
                  Load a complete example campaign set in the world of <strong className="text-[#d4af37]">Dragonlance</strong>.
                  Includes the Heroes of the Lance, iconic locations like Solace and Xak Tsaroth,
                  sample sessions, encounters with draconians, NPCs, and quests.
                </p>

                {dataSummary && (dataSummary.campaigns > 0 || dataSummary.characters > 0) && (
                  <div className="glass-card rounded-lg p-4 mb-4">
                    <p className="text-sm text-[#a1a1aa] mb-2">
                      <strong className="text-[#f5f5f5]">Current Data:</strong>
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-[#9d6fff] font-semibold">{dataSummary.campaigns}</div>
                        <div className="text-[#a1a1aa]">Campaigns</div>
                      </div>
                      <div>
                        <div className="text-[#9d6fff] font-semibold">{dataSummary.characters}</div>
                        <div className="text-[#a1a1aa]">Characters</div>
                      </div>
                      <div>
                        <div className="text-[#9d6fff] font-semibold">{dataSummary.sessions}</div>
                        <div className="text-[#a1a1aa]">Sessions</div>
                      </div>
                      <div>
                        <div className="text-[#9d6fff] font-semibold">{dataSummary.encounters}</div>
                        <div className="text-[#a1a1aa]">Encounters</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button
                    variant={isSeedDataLoaded ? "ghostGold" : "gold"}
                    onClick={handleLoadSeedData}
                    disabled={isProcessing}
                    icon={Sparkles}
                  >
                    {isSeedDataLoaded ? 'Reload Dragonlance' : 'Load Dragonlance Campaign'}
                  </Button>
                  {isSeedDataLoaded && (
                    <span className="text-xs text-[#a1a1aa]">
                      You can reload to refresh the example data
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">💾</div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[#fafafa] mb-2">
                  Export Data
                </h2>
                <p className="text-[#a1a1aa] mb-4">
                  Download a backup of all your campaigns, characters, and settings as a JSON file.
                  You can use this to restore your data later or transfer it to another device.
                </p>
                <Button
                  variant="primary"
                  onClick={handleExport}
                  disabled={isProcessing}
                >
                  Export All Data
                </Button>
              </div>
            </div>
          </div>

          {/* Import Section */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">📥</div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[#fafafa] mb-2">
                  Import Data
                </h2>
                <p className="text-[#a1a1aa] mb-4">
                  Restore your data from a previously exported backup file. This will overwrite any existing data.
                </p>
                <Button
                  variant="secondary"
                  onClick={handleImport}
                  disabled={isProcessing}
                >
                  Import from File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Clear Data Section */}
          <div className="glass rounded-xl p-6 border border-red-500/20">
            <div className="flex items-start gap-4">
              <div className="text-4xl">⚠️</div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[#fafafa] mb-2">
                  Clear All Data
                </h2>
                <p className="text-[#a1a1aa] mb-4">
                  Permanently delete all campaigns, characters, sessions, and settings.
                  This action cannot be undone. Make sure to export your data first if you want to keep a backup.
                </p>
                <Button
                  variant="danger"
                  onClick={handleClearAll}
                  disabled={isProcessing}
                >
                  Clear All Data
                </Button>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="glass rounded-lg p-4">
            <p className="text-[#a1a1aa] text-sm">
              <strong className="text-[#fafafa]">Tip:</strong> Export your data regularly to avoid losing your campaigns and characters.
              The exported file is a standard JSON file that can be stored safely on your computer or cloud storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
