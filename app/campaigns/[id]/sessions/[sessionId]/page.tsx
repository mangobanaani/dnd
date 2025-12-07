"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Campaign, CampaignSession } from '@/app/types/campaign';
import { Character } from '@/app/types/character';

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const { id: campaignId, sessionId } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<CampaignSession | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [attendees, setAttendees] = useState<Character[]>([]);

  useEffect(() => {
    // Load campaign
    const campaignsStored = localStorage.getItem('dnd-campaigns');
    if (campaignsStored) {
      const campaigns: Campaign[] = JSON.parse(campaignsStored);
      const found = campaigns.find((c) => c.id === campaignId);
      if (found) {
        setCampaign(found);
      }
    }

    // Load session
    const sessionsStored = localStorage.getItem(`dnd-campaign-sessions-${campaignId}`);
    if (sessionsStored) {
      const sessions: CampaignSession[] = JSON.parse(sessionsStored);
      const foundSession = sessions.find((s) => s.id === sessionId);
      if (foundSession) {
        setSession(foundSession);

        // Load attendee characters
        const charsStored = localStorage.getItem('dnd-characters');
        if (charsStored) {
          const allChars: Character[] = JSON.parse(charsStored);
          const sessionAttendees = allChars.filter((char) =>
            foundSession.attendees.includes(char.id)
          );
          setAttendees(sessionAttendees);
        }
      }
    }
  }, [campaignId, sessionId]);

  if (!session || !campaign) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#fafafa] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-lg text-[#a1a1aa]">Session not found</p>
            <Link href={`/campaigns/${campaignId}`}>
              <Button variant="primary" className="mt-4">
                Back to Campaign
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-[#a1a1aa] mb-4">
            <Link href="/campaigns" className="hover:text-[#8b5cf6] transition-colors">
              Campaigns
            </Link>
            <span>/</span>
            <Link
              href={`/campaigns/${campaignId}`}
              className="hover:text-[#8b5cf6] transition-colors"
            >
              {campaign.name}
            </Link>
            <span>/</span>
            <span className="text-[#fafafa]">Session #{session.sessionNumber}</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-3xl font-bold text-[#8b5cf6]">
                  #{session.sessionNumber}
                </span>
                <h1 className="text-3xl font-bold">{session.title}</h1>
              </div>
              <p className="text-[#a1a1aa]">
                📅 {new Date(session.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <Link href={`/campaigns/${campaignId}`}>
              <Button variant="secondary">Back to Campaign</Button>
            </Link>
          </div>
        </div>

        {/* Session Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="glass-subtle rounded-lg p-4">
            <div className="text-[#a1a1aa] text-sm mb-1">XP Awarded</div>
            <div className="text-2xl font-bold text-green-400">
              {session.xpAwarded > 0 ? `✨ ${session.xpAwarded}` : '0'}
            </div>
          </div>
          <div className="glass-subtle rounded-lg p-4">
            <div className="text-[#a1a1aa] text-sm mb-1">Treasure</div>
            <div className="text-2xl font-bold text-yellow-400">
              {session.treasureAwarded && session.treasureAwarded.length > 0 ? `💰 ${session.treasureAwarded.join(', ')}` : 'None'}
            </div>
          </div>
          <div className="glass-subtle rounded-lg p-4">
            <div className="text-[#a1a1aa] text-sm mb-1">Attendees</div>
            <div className="text-2xl font-bold text-[#8b5cf6]">
              👥 {session.attendees.length}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="glass rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Session Summary</h2>
          <p className="text-[#d4d4d8] whitespace-pre-wrap leading-relaxed">
            {session.summary}
          </p>
        </div>

        {/* Attendees */}
        {attendees.length > 0 && (
          <div className="glass rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Players in This Session</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {attendees.map((char) => (
                <Link
                  key={char.id}
                  href={`/characters/${char.id}`}
                  className="glass-subtle rounded-lg p-4 hover:bg-[#27272a] transition-colors"
                >
                  <div className="font-semibold text-[#fafafa] mb-1">{char.name}</div>
                  <div className="text-sm text-[#a1a1aa]">
                    Level {char.level} {char.race} {char.classes.map((c) => c.name).join('/')}
                  </div>
                  {session.xpAwarded > 0 && (
                    <div className="text-xs text-green-400 mt-2">
                      +{session.xpAwarded} XP earned
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {session.notes && (
          <div className="glass rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Notes</h2>
            <p className="text-[#d4d4d8] whitespace-pre-wrap">{session.notes}</p>
          </div>
        )}

        {/* Session Metadata */}
        <div className="glass-subtle rounded-lg p-4 text-sm text-[#a1a1aa]">
          <div className="flex flex-wrap gap-4">
            <span>Created: {new Date(session.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
