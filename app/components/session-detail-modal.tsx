'use client';

import { Modal } from '@/app/components/ui/modal';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardHeader } from '@/app/components/ui/card';
import { Campaign, CampaignSession } from '@/app/types/campaign';
import {
  Calendar,
  Clock,
  Users,
  Sparkles,
  Scroll,
  Coins,
  FileText,
} from 'lucide-react';

interface SessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: CampaignSession;
  campaign?: Campaign;
}

export function SessionDetailModal({
  isOpen,
  onClose,
  session,
  campaign,
}: SessionDetailModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={session.title}>
      <div className="space-y-6">
        {/* Header with Session Number and Campaign */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="primary" glow size="lg">
              Session #{session.sessionNumber}
            </Badge>
            {campaign && (
              <span className="text-sm text-[#a1a1aa]">{campaign.name}</span>
            )}
          </div>
        </div>

        {/* Session Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Date */}
          <div className="glass-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={18} className="text-[#9d6fff]" />
              <span className="text-sm font-medium text-[#a1a1aa]">Date</span>
            </div>
            <p className="text-[#f5f5f5] font-medium">{formatDate(session.date)}</p>
            <p className="text-sm text-[#a1a1aa]">{formatTime(session.date)}</p>
          </div>

          {/* Duration */}
          <div className="glass-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className="text-[#9d6fff]" />
              <span className="text-sm font-medium text-[#a1a1aa]">Duration</span>
            </div>
            <p className="text-2xl font-bold text-[#9d6fff]">
              {formatDuration(session.duration)}
            </p>
            <p className="text-sm text-[#a1a1aa]">{session.duration} minutes</p>
          </div>

          {/* Attendees */}
          <div className="glass-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} className="text-[#9d6fff]" />
              <span className="text-sm font-medium text-[#a1a1aa]">Attendees</span>
            </div>
            <p className="text-2xl font-bold text-[#f5f5f5]">
              {session.attendees?.length ?? 0}
            </p>
            <p className="text-sm text-[#a1a1aa]">players present</p>
          </div>

          {/* XP Awarded */}
          <div className="glass-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} className="text-[#d4af37]" />
              <span className="text-sm font-medium text-[#a1a1aa]">XP Awarded</span>
            </div>
            <p className="text-2xl font-bold text-[#d4af37]">
              {(session.xpAwarded ?? 0).toLocaleString()}
            </p>
            <p className="text-sm text-[#a1a1aa]">experience points</p>
          </div>
        </div>

        {/* Summary Section */}
        {session.summary && (
          <Card variant="default">
            <CardHeader
              title="Session Summary"
              icon={Scroll}
              iconVariant="purple"
            />
            <p className="text-[#f5f5f5] leading-relaxed whitespace-pre-line">
              {session.summary}
            </p>
          </Card>
        )}

        {/* Treasure Section */}
        {session.treasureAwarded && session.treasureAwarded.length > 0 && (
          <Card variant="gold">
            <CardHeader
              title="Treasure Awarded"
              icon={Coins}
              iconVariant="gold"
            />
            <div className="space-y-2">
              {session.treasureAwarded.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 glass-card rounded-lg"
                >
                  <Coins size={20} className="text-[#d4af37] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[#f5f5f5] font-medium">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* DM Notes Section */}
        {session.notes && (
          <Card variant="default">
            <CardHeader
              title="DM Notes"
              icon={FileText}
              iconVariant="default"
            />
            <p className="text-[#a1a1aa] leading-relaxed whitespace-pre-line italic">
              {session.notes}
            </p>
          </Card>
        )}

        {/* Session Metadata */}
        <div className="pt-4 border-t border-[#1a1a1f]">
          <div className="text-sm text-[#a1a1aa]">
            <span>Created: {formatDate(session.createdAt)}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
