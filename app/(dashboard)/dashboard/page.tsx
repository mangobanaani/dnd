'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Campaign } from '@/app/types/campaign';
import { Character } from '@/app/types/character';

type Timestamped = { updatedAt?: string | number | Date };

const sortByUpdatedAt = <T extends Timestamped>(items: T[], take: number) => {
  return [...items]
    .sort((a, b) => {
      const aTime = new Date(a.updatedAt ?? 0).getTime();
      const bTime = new Date(b.updatedAt ?? 0).getTime();
      return bTime - aTime;
    })
    .slice(0, take);
};

const formatRelativeTime = (input?: string | number | Date) => {
  if (!input) return 'Updated moments ago';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return 'Updated moments ago';

  const diff = Date.now() - date.getTime();
  const tense = diff >= 0 ? 'past' : 'future';
  const distance = Math.abs(diff);

  const units = [
    { label: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
    { label: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
    { label: 'week', ms: 1000 * 60 * 60 * 24 * 7 },
    { label: 'day', ms: 1000 * 60 * 60 * 24 },
    { label: 'hour', ms: 1000 * 60 * 60 },
    { label: 'minute', ms: 1000 * 60 },
  ];

  const match = units.find(unit => distance >= unit.ms);
  if (!match) return 'Updated moments ago';

  const value = Math.round(distance / match.ms);
  if (tense === 'future') {
    return `Planned in ${value} ${match.label}${value > 1 ? 's' : ''}`;
  }
  return `Updated ${value} ${match.label}${value > 1 ? 's' : ''} ago`;
};

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load campaigns from localStorage
    const campaignsStored = localStorage.getItem('dnd-campaigns');
    if (campaignsStored) {
      try {
        const allCampaigns: Campaign[] = JSON.parse(campaignsStored);
        setCampaigns(allCampaigns);
      } catch (error) {
        console.error('Failed to parse campaigns from localStorage:', error);
      }
    }

    // Load characters from localStorage
    const charactersStored = localStorage.getItem('dnd-characters');
    if (charactersStored) {
      try {
        const allCharacters: Character[] = JSON.parse(charactersStored);
        setCharacters(allCharacters);
      } catch (error) {
        console.error('Failed to parse characters from localStorage:', error);
      }
    }

    setLoading(false);
  }, []);

  // Calculate stats
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalSessions = campaigns.reduce((sum, c) => sum + (c.sessionCount || 0), 0);
  const recentCampaigns = sortByUpdatedAt(campaigns, 3);
  const recentCharacters = sortByUpdatedAt(characters, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0a0a0f] to-[#131318] p-8 flex items-center justify-center">
        <div className="text-[#8b5cf6] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0a0a0f] to-[#131318] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="glass-strong rounded-2xl p-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8b5cf6] via-[#fbbf24] to-[#8b5cf6] bg-clip-text text-transparent mb-4">
            Welcome back, Adventurer!
          </h1>
          <p className="text-[#a1a1aa] text-lg">
            Ready to embark on your next adventure?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/campaigns"
            className="glass rounded-xl p-6 hover:glass-strong transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fbbf24]/60"
            aria-label="View all campaigns"
          >
            <div className="text-4xl mb-2" aria-hidden>🎲</div>
            <h3 className="text-xl font-semibold mb-1">
              {activeCampaigns} Active Campaign{activeCampaigns !== 1 ? 's' : ''}
            </h3>
            <p className="text-[#a1a1aa] text-sm">
              {campaigns.length} total campaign{campaigns.length !== 1 ? 's' : ''}
            </p>
          </Link>

          <Link
            href="/characters"
            className="glass rounded-xl p-6 hover:glass-strong transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fbbf24]/60"
            aria-label="View all characters"
          >
            <div className="text-4xl mb-2" aria-hidden>⚔️</div>
            <h3 className="text-xl font-semibold mb-1">
              {characters.length} Character{characters.length !== 1 ? 's' : ''}
            </h3>
            <p className="text-[#a1a1aa] text-sm">Your heroic roster</p>
          </Link>

          <Link
            href="/sessions"
            className="glass rounded-xl p-6 hover:glass-strong transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fbbf24]/60"
            aria-label="View session history"
          >
            <div className="text-4xl mb-2" aria-hidden>📜</div>
            <h3 className="text-xl font-semibold mb-1">
              {totalSessions} Session{totalSessions !== 1 ? 's' : ''} Played
            </h3>
            <p className="text-[#a1a1aa] text-sm">Epic adventures</p>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="glass-subtle rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Link
              href="/campaigns/create"
              className="glass rounded-xl p-6 hover:glass-strong transition-all flex items-center gap-4"
            >
              <div className="text-4xl">➕</div>
              <div>
                <h3 className="text-lg font-semibold">Create Campaign</h3>
                <p className="text-[#a1a1aa] text-sm">Start a new adventure</p>
              </div>
            </Link>

            <Link
              href="/characters/create"
              className="glass rounded-xl p-6 hover:glass-strong transition-all flex items-center gap-4"
            >
              <div className="text-4xl">🗡️</div>
              <div>
                <h3 className="text-lg font-semibold">Create Character</h3>
                <p className="text-[#a1a1aa] text-sm">Build your hero</p>
              </div>
            </Link>

            <Link
              href="/encounters"
              className="glass rounded-xl p-6 hover:glass-strong transition-all flex items-center gap-4"
            >
              <div className="text-4xl">🧙‍♂️</div>
              <div>
                <h3 className="text-lg font-semibold">Open Encounter Builder</h3>
                <p className="text-[#a1a1aa] text-sm">Prep balanced battles</p>
              </div>
            </Link>

            <Link
              href="/monsters"
              className="glass rounded-xl p-6 hover:glass-strong transition-all flex items-center gap-4"
            >
              <div className="text-4xl">📚</div>
              <div>
                <h3 className="text-lg font-semibold">Browse Monster Compendium</h3>
                <p className="text-[#a1a1aa] text-sm">2,400+ creatures ready to deploy</p>
              </div>
            </Link>

            <Link
              href="/dice"
              className="glass rounded-xl p-6 hover:glass-strong transition-all flex items-center gap-4 sm:col-span-2 xl:col-span-1"
            >
              <div className="text-4xl">🎯</div>
              <div>
                <h3 className="text-lg font-semibold">Launch Dice Roller</h3>
                <p className="text-[#a1a1aa] text-sm">Quick rolls with advantage & history</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Campaigns */}
        {recentCampaigns.length > 0 && (
          <div className="glass-subtle rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Recent Campaigns</h2>
              <Link href="/campaigns" className="text-[#8b5cf6] hover:text-[#fbbf24] transition-colors">
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {recentCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}`}
                  className="glass rounded-xl p-4 hover:glass-strong transition-all flex justify-between items-center"
                  aria-label={`Open ${campaign.name} campaign`}
                >
                  <div>
                    <h3 className="font-semibold text-lg">{campaign.name}</h3>
                    <p className="text-[#a1a1aa] text-sm line-clamp-1">{campaign.description}</p>
                    <p className="text-[#71717a] text-xs mt-1">{formatRelativeTime(campaign.updatedAt)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      campaign.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      campaign.status === 'planning' ? 'bg-blue-500/20 text-blue-400' :
                      campaign.status === 'on-hold' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {campaign.status}
                    </span>
                    <span className="text-[#a1a1aa] text-sm">Level {campaign.currentLevel}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Characters */}
        {recentCharacters.length > 0 && (
          <div className="glass-subtle rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Recent Characters</h2>
              <Link href="/characters" className="text-[#8b5cf6] hover:text-[#fbbf24] transition-colors">
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {recentCharacters.map((character) => (
                <Link
                  key={character.id}
                  href={`/characters/${character.id}`}
                  className="glass rounded-xl p-4 hover:glass-strong transition-all flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{character.name}</h3>
                    <p className="text-[#a1a1aa] text-sm">
                      {character.race} {character.classes.map(c => c.name).join(' / ')}
                    </p>
                    <p className="text-[#71717a] text-xs mt-1">{formatRelativeTime(character.updatedAt)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[#a1a1aa] text-sm">Level {character.level}</span>
                    <span className="text-[#a1a1aa] text-sm">{character.currentHitPoints}/{character.maxHitPoints} HP</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {campaigns.length === 0 && characters.length === 0 && (
          <div className="glass-subtle rounded-2xl p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">🎲 Start Your Adventure!</h2>
            <p className="text-[#a1a1aa] mb-6">
              Create your first campaign or character to begin your epic D&D journey.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/campaigns/create"
                className="px-6 py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-lg transition-colors font-semibold"
              >
                Create Campaign
              </Link>
              <Link
                href="/characters/create"
                className="px-6 py-3 glass hover:glass-strong rounded-lg transition-all font-semibold"
              >
                Create Character
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
