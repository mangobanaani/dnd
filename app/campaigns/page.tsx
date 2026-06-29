"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useConfirm } from '@/app/components/ui/confirm-dialog';
import { useToast } from '@/app/components/ui/toast';
import { CampaignCardSkeleton } from '@/app/components/ui/skeleton';
import { CampaignCard } from '@/app/components/campaigns/campaign-card';
import { Campaign } from '@/app/types/campaign';
import { campaignRepository } from '@/app/lib/repositories/campaign.repository';
import { Map } from 'lucide-react';

export default function CampaignsPage() {
  const router = useRouter();
  const { confirm } = useConfirm();
  const { addToast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    campaignRepository
      .list()
      .then((data) => setCampaigns(data))
      .catch((err) => {
        console.error('Failed to load campaigns:', err);
        setCampaigns([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const deleteCampaign = async (id: string) => {
    const campaign = campaigns.find((c) => c.id === id);
    const confirmed = await confirm({
      title: 'Delete Campaign',
      message: `Delete ${campaign?.name || 'this campaign'}? This action cannot be undone.`,
      confirmLabel: 'Delete',
      confirmVariant: 'danger',
    });

    if (confirmed) {
      try {
        await campaignRepository.remove(id);
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
        addToast(`${campaign?.name || 'Campaign'} deleted`, 'success');
      } catch (err) {
        console.error('Failed to delete campaign:', err);
        addToast('Failed to delete campaign', 'error');
      }
    }
  };

  const setActiveCampaign = async (id: string) => {
    // Set all campaigns to non-active, then set the selected one to active
    const updated = campaigns.map(c => ({
      ...c,
      status: c.id === id ? 'active' as const : c.status === 'active' ? 'planning' as const : c.status,
    }));

    // Persist only the campaigns whose status changed
    const changed = updated.filter((c, i) => c.status !== campaigns[i]?.status);
    try {
      await Promise.all(changed.map((c) => campaignRepository.update(c.id, c)));
      setCampaigns(updated);
    } catch (err) {
      console.error('Failed to set active campaign:', err);
      addToast('Failed to update campaign status', 'error');
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.setting.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-10 w-64 bg-[#27272a] animate-pulse rounded mb-2" />
            <div className="h-6 w-96 bg-[#27272a] animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CampaignCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-7xl mx-auto relative">
        {/* Mage Character Image - Decorative Background */}
        <div className="hidden xl:block absolute top-0 right-0 pointer-events-none" style={{ width: '500px', height: '500px' }}>
          <img
            src="/images/mage.png"
            alt="D&D Mage Character"
            className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(157,111,255,0.7)] opacity-60 hover:opacity-80 transition-opacity duration-350"
            style={{ background: 'transparent' }}
          />
        </div>

        {/* Header */}
        <div className="mb-8 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-display text-[#f5f5f5] mb-2 [text-shadow:0_0_20px_rgba(212,175,55,0.3),0_2px_8px_rgba(0,0,0,0.8)]">
                My Campaigns
              </h1>
              <p className="text-[#a1a1aa]">
                Manage your D&D campaigns and adventures
              </p>
            </div>

            <Link href="/campaigns/create">
              <Button variant="primary">
                + Create Campaign
              </Button>
            </Link>
          </div>

          {/* Search */}
          {campaigns.length > 0 && (
            <div className="max-w-md">
              <Input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Campaigns List */}
        {campaigns.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="flex justify-center mb-4">
              <Map size={64} className="text-[#9d6fff]" />
            </div>
            <h3 className="text-xl font-display text-[#f5f5f5] mb-2">
              No campaigns yet
            </h3>
            <p className="text-[#a1a1aa] mb-6">
              Create your first campaign to start your D&D adventure
            </p>
            <Link href="/campaigns/create">
              <Button variant="primary">
                Create Your First Campaign
              </Button>
            </Link>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="flex justify-center mb-4">
              <Map size={64} className="text-[#9d6fff]" />
            </div>
            <h3 className="text-xl font-display text-[#f5f5f5] mb-2">
              No campaigns found
            </h3>
            <p className="text-[#a1a1aa]">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onDelete={deleteCampaign}
                onSetActive={setActiveCampaign}
                onClick={() => router.push(`/campaigns/${campaign.id}`)}
              />
            ))}
          </div>
        )}

        {/* Info Box */}
        {campaigns.length > 0 && (
          <div className="mt-8 glass-card rounded-lg p-4">
            <p className="text-[#a1a1aa] text-sm text-center">
              Click on a campaign card to view details and manage your adventure
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
