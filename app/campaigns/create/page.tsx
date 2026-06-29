"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { campaignRepository } from '@/app/lib/repositories/campaign.repository';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  CAMPAIGN_SETTINGS,
  CAMPAIGN_STATUSES,
  DIFFICULTY_LEVELS,
  CampaignStatus,
  DifficultyLevel,
  createDefaultCampaign,
  validateCampaignName,
  validateCampaignDescription,
} from '@/app/types/campaign';

export default function CreateCampaignPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [setting, setSetting] = useState('Forgotten Realms');
  const [status, setStatus] = useState<CampaignStatus>('planning');
  const [edition, setEdition] = useState<'5e' | '2024'>('5e');
  const [homebrew, setHomebrew] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('normal');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isPublic, setIsPublic] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameError = validateCampaignName(name);
    if (nameError) newErrors.name = nameError;

    const descError = validateCampaignDescription(description);
    if (descError) newErrors.description = descError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const campaign = {
      id: crypto.randomUUID(),
      // dmId will be overwritten by campaignRepository.add() with the real user id
      ...createDefaultCampaign(''),
      name,
      description,
      setting,
      status,
      edition,
      homebrew,
      difficultyLevel,
      currentLevel,
      isPublic,
    };

    try {
      await campaignRepository.add(campaign);
      router.push('/campaigns');
    } catch (err) {
      console.error('Failed to create campaign:', err);
      setErrors({ submit: 'Failed to save campaign. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/campaigns">
            <Button variant="secondary" size="sm" className="mb-4">
              ← Back to Campaigns
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-[#fafafa] mb-2">
            Create New Campaign
          </h1>
          <p className="text-[#a1a1aa]">
            Set up a new D&D campaign for your adventuring party
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="glass rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-2xl font-bold text-[#fafafa]">
              Basic Information
            </h2>

            <div>
              <Input
                type="text"
                label="Campaign Name"
                placeholder="The Lost Mines of Phandelver"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your campaign's story, themes, and what makes it unique..."
                rows={4}
                className="w-full px-4 py-3 bg-[#1a1a22] border border-[#27272a] rounded-lg text-[#fafafa] placeholder:text-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] transition-all"
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-3">
                Setting
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CAMPAIGN_SETTINGS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSetting(s)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      setting === s
                        ? 'bg-[#8b5cf6] text-white'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Game Settings */}
          <div className="glass rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-2xl font-bold text-[#fafafa]">
              Game Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#fafafa] mb-3">
                  Edition
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEdition('5e')}
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      edition === '5e'
                        ? 'bg-[#8b5cf6] text-white'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                    }`}
                  >
                    D&D 5e (2014)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEdition('2024')}
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      edition === '2024'
                        ? 'bg-[#8b5cf6] text-white'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                    }`}
                  >
                    D&D 5e (2024)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#fafafa] mb-3">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CAMPAIGN_STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all capitalize ${
                        status === s
                          ? 'bg-[#8b5cf6] text-white'
                          : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                      }`}
                    >
                      {s.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-3">
                Difficulty Level
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {DIFFICULTY_LEVELS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficultyLevel(d)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all capitalize ${
                      difficultyLevel === d
                        ? 'bg-[#8b5cf6] text-white'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Input
                type="number"
                label="Starting Level"
                min={1}
                max={20}
                value={currentLevel}
                onChange={(e) => setCurrentLevel(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setHomebrew(!homebrew)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  homebrew ? 'bg-[#8b5cf6]' : 'bg-[#27272a]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    homebrew ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <div>
                <label className="text-sm font-medium text-[#fafafa]">
                  Homebrew Content
                </label>
                <p className="text-xs text-[#a1a1aa]">
                  Allow custom rules, items, and creatures
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  isPublic ? 'bg-[#8b5cf6]' : 'bg-[#27272a]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    isPublic ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <div>
                <label className="text-sm font-medium text-[#fafafa]">
                  Public Campaign
                </label>
                <p className="text-xs text-[#a1a1aa]">
                  Allow others to view (but not edit) this campaign
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <Link href="/campaigns">
              <Button variant="secondary">Cancel</Button>
            </Link>
            <div className="flex flex-col items-end gap-2">
              {errors.submit && (
                <p className="text-red-400 text-sm">{errors.submit}</p>
              )}
              <Button type="submit" variant="primary">
                Create Campaign
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
