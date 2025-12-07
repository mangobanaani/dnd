"use client";

import { Campaign, getStatusLabel, getDifficultyLabel, getCampaignDuration } from '@/app/types/campaign';
import {
  Map,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  ChevronRight,
  X,
  Zap,
} from 'lucide-react';

interface CampaignCardProps {
  campaign: Campaign;
  onDelete: (id: string) => void;
  onSetActive: (id: string) => void;
  onClick?: () => void;
}

export function CampaignCard({ campaign, onDelete, onSetActive, onClick }: CampaignCardProps) {
  const duration = getCampaignDuration(campaign.startDate);

  const getStatusBadgeClass = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/30';
      case 'planning':
        return 'bg-[#9d6fff]/20 text-[#9d6fff] border-[#9d6fff]/30';
      case 'completed':
        return 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30';
      case 'on-hold':
        return 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30';
      default:
        return 'bg-[#27272a] text-[#a1a1aa] border-[#27272a]';
    }
  };

  return (
    <div
      className="glass-card rounded-xl p-6 cursor-pointer group transition-all duration-350 hover:border-[#9d6fff]/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:translate-y-[1px]"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <Map size={24} className="text-[#9d6fff] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-2xl text-[#f5f5f5] [text-shadow:0_0_16px_rgba(157,111,255,0.4),0_2px_6px_rgba(0,0,0,0.7)] line-clamp-1">
              {campaign.name}
            </h3>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(campaign.id);
          }}
          aria-label="Delete campaign"
          className="text-[#a1a1aa] hover:text-red-400 transition-colors p-1"
        >
          <X size={20} />
        </button>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${getStatusBadgeClass(
            campaign.status
          )}`}
        >
          {getStatusLabel(campaign.status)}
        </span>
        {campaign.homebrew && (
          <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#9d6fff]/20 text-[#9d6fff] border border-[#9d6fff]/30">
            Homebrew
          </span>
        )}
        {campaign.status !== 'active' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetActive(campaign.id);
            }}
            aria-label="Set active campaign"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 hover:bg-[#10b981]/30 transition-all duration-200"
          >
            <Zap size={14} />
            Set Active
          </button>
        )}
      </div>

      {/* Description */}
      {campaign.description && (
        <p className="text-sm text-[#a1a1aa] line-clamp-2 mb-4">
          {campaign.description}
        </p>
      )}

      <div className="border-t border-[#1a1a1f] pt-4 mb-4" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Players */}
        <div className="flex items-center gap-2">
          <Users size={16} className="text-[#9d6fff]" />
          <div>
            <div className="text-xs text-[#a1a1aa]">Players</div>
            <div className="text-sm font-medium text-[#f5f5f5]">
              {campaign.playerIds.length} players
            </div>
          </div>
        </div>

        {/* Sessions */}
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#9d6fff]" />
          <div>
            <div className="text-xs text-[#a1a1aa]">Sessions</div>
            <div className="text-sm font-medium text-[#f5f5f5]">
              {campaign.sessionCount} sessions
            </div>
          </div>
        </div>

        {/* Level */}
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-[#9d6fff]" />
          <div>
            <div className="text-xs text-[#a1a1aa]">Level</div>
            <div className="text-sm font-medium text-[#f5f5f5]">
              Level {campaign.currentLevel}
            </div>
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[#9d6fff]" />
          <div>
            <div className="text-xs text-[#a1a1aa]">Duration</div>
            <div className="text-sm font-medium text-[#f5f5f5]">
              {duration === 0 ? 'Started today' : `${duration} days`}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-3 text-xs text-[#a1a1aa] mb-4">
        <div>
          <span className="font-medium text-[#f5f5f5]">{campaign.setting}</span>
        </div>
        <div>
          <span className="font-medium text-[#f5f5f5]">D&D {campaign.edition}</span>
        </div>
      </div>

      {/* Next Session */}
      {campaign.nextSessionDate && (
        <>
          <div className="border-t border-[#1a1a1f] pt-4 mb-4" />
          <div className="text-xs text-[#a1a1aa]">
            Next session:{' '}
            <span className="text-[#f5f5f5] font-medium">
              {new Date(campaign.nextSessionDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </>
      )}

      {/* Footer with Chevron */}
      <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1f]">
        <span className="text-sm text-[#a1a1aa]">
          Difficulty: <span className="font-medium text-[#f5f5f5]">{getDifficultyLabel(campaign.difficultyLevel)}</span>
        </span>
        <ChevronRight
          className="w-5 h-5 text-[#9d6fff] opacity-0 group-hover:opacity-100 transition-opacity duration-350"
        />
      </div>
    </div>
  );
}
