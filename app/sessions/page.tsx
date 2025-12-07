'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Modal } from '@/app/components/ui/modal';
import { SessionDetailModal } from '@/app/components/session-detail-modal';
import { Campaign, CampaignSession } from '@/app/types/campaign';
import { Eye } from 'lucide-react';

export default function SessionsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [sessions, setSessions] = useState<CampaignSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Active session
  const [activeSession, setActiveSession] = useState<CampaignSession | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Create session modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');

  // End session modal
  const [showEndModal, setShowEndModal] = useState(false);
  const [sessionSummary, setSessionSummary] = useState('');
  const [xpAwarded, setXpAwarded] = useState(0);
  const [sessionNotes, setSessionNotes] = useState('');

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CampaignSession | null>(null);

  useEffect(() => {
    // Load campaigns
    const campaignsStored = localStorage.getItem('dnd-campaigns');
    if (campaignsStored) {
      try {
        setCampaigns(JSON.parse(campaignsStored));
      } catch (error) {
        console.error('Failed to parse campaigns from localStorage:', error);
      }
    }

    // Load sessions
    const sessionsStored = localStorage.getItem('dnd-sessions');
    if (sessionsStored) {
      try {
        setSessions(JSON.parse(sessionsStored));
      } catch (error) {
        console.error('Failed to parse sessions from localStorage:', error);
      }
    }

    // Check for active session
    const activeStored = localStorage.getItem('dnd-active-session');
    if (activeStored) {
      try {
        const { session, startTime } = JSON.parse(activeStored);
        setActiveSession(session);
        setSessionStartTime(startTime);
      } catch (error) {
        console.error('Failed to parse active session from localStorage:', error);
      }
    }

    setLoading(false);
  }, []);

  // Timer for active session
  useEffect(() => {
    if (!activeSession || !sessionStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, sessionStartTime]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = () => {
    if (!selectedCampaignId || !sessionTitle.trim()) {
      alert('Please select a campaign and enter a session title');
      return;
    }

    const campaign = campaigns.find(c => c.id === selectedCampaignId);
    if (!campaign) return;

    const newSession: CampaignSession = {
      id: crypto.randomUUID(),
      campaignId: selectedCampaignId,
      sessionNumber: campaign.sessionCount + 1,
      title: sessionTitle,
      summary: '',
      date: new Date().toISOString(),
      duration: 0,
      attendees: campaign.playerIds,
      xpAwarded: 0,
      treasureAwarded: [],
      notes: '',
      createdAt: new Date().toISOString(),
    };

    setActiveSession(newSession);
    setSessionStartTime(Date.now());

    // Save to localStorage
    localStorage.setItem('dnd-active-session', JSON.stringify({
      session: newSession,
      startTime: Date.now(),
    }));

    setShowCreateModal(false);
    setSelectedCampaignId('');
    setSessionTitle('');
  };

  const endSession = () => {
    if (!activeSession || !sessionStartTime) return;

    const duration = Math.floor((Date.now() - sessionStartTime) / 60000); // minutes

    const completedSession: CampaignSession = {
      ...activeSession,
      summary: sessionSummary,
      duration,
      xpAwarded,
      notes: sessionNotes,
    };

    // Save session
    const updatedSessions = [completedSession, ...sessions];
    setSessions(updatedSessions);
    localStorage.setItem('dnd-sessions', JSON.stringify(updatedSessions));

    // Update campaign
    const campaign = campaigns.find(c => c.id === activeSession.campaignId);
    if (campaign) {
      const updatedCampaign = {
        ...campaign,
        sessionCount: campaign.sessionCount + 1,
        updatedAt: new Date().toISOString(),
      };

      const updatedCampaigns = campaigns.map(c =>
        c.id === campaign.id ? updatedCampaign : c
      );
      setCampaigns(updatedCampaigns);
      localStorage.setItem('dnd-campaigns', JSON.stringify(updatedCampaigns));
    }

    // Clear active session
    setActiveSession(null);
    setSessionStartTime(null);
    setElapsedTime(0);
    localStorage.removeItem('dnd-active-session');

    // Reset modal fields
    setSessionSummary('');
    setXpAwarded(0);
    setSessionNotes('');
    setShowEndModal(false);
  };

  const pauseSession = () => {
    // In a real implementation, this would pause the timer
    // For now, we'll just show an alert
    alert('Session paused. Timer continues running but you can navigate away.');
  };

  const viewSessionDetails = (session: CampaignSession) => {
    setSelectedSession(session);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0a0a0f] to-[#131318] p-8 flex items-center justify-center">
        <div className="text-[#8b5cf6] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0a0a0f] to-[#131318] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8b5cf6] via-[#fbbf24] to-[#8b5cf6] bg-clip-text text-transparent mb-2">
              Session Management
            </h1>
            <p className="text-[#a1a1aa]">
              Start, track, and manage your D&D sessions
            </p>
          </div>
          {!activeSession && (
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              + Start New Session
            </Button>
          )}
        </div>

        {/* Active Session */}
        {activeSession && (
          <div className="glass-strong rounded-2xl p-8 border-2 border-[#8b5cf6]">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                    🟢 Session Active
                  </span>
                  <span className="text-[#a1a1aa]">
                    Session #{activeSession.sessionNumber}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-[#fafafa] mb-2">
                  {activeSession.title}
                </h2>
                <p className="text-[#a1a1aa]">
                  {campaigns.find(c => c.id === activeSession.campaignId)?.name}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-[#a1a1aa] mb-1">Elapsed Time</div>
                <div className="text-5xl font-bold text-[#8b5cf6] font-mono">
                  {formatTime(elapsedTime)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/combat"
                className="glass rounded-xl p-6 hover:glass-strong transition-all text-center"
              >
                <div className="text-4xl mb-2">⚔️</div>
                <h3 className="font-semibold text-lg">Combat Tracker</h3>
                <p className="text-sm text-[#a1a1aa]">Manage initiative & HP</p>
              </Link>

              <Link
                href="/dice"
                className="glass rounded-xl p-6 hover:glass-strong transition-all text-center"
              >
                <div className="text-4xl mb-2">🎲</div>
                <h3 className="font-semibold text-lg">Dice Roller</h3>
                <p className="text-sm text-[#a1a1aa]">Roll checks & saves</p>
              </Link>

              <Link
                href={`/campaigns/${activeSession.campaignId}`}
                className="glass rounded-xl p-6 hover:glass-strong transition-all text-center"
              >
                <div className="text-4xl mb-2">📖</div>
                <h3 className="font-semibold text-lg">Campaign Details</h3>
                <p className="text-sm text-[#a1a1aa]">View quests & NPCs</p>
              </Link>
            </div>

            <div className="flex gap-4 mt-6">
              <Button variant="secondary" onClick={pauseSession} className="flex-1">
                ⏸️ Pause Session
              </Button>
              <Button variant="danger" onClick={() => setShowEndModal(true)} className="flex-1">
                ⏹️ End Session
              </Button>
            </div>
          </div>
        )}

        {/* Session History */}
        <div className="glass-subtle rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Session History</h2>

          {sessions.length === 0 ? (
            <div className="text-center py-12 text-[#a1a1aa]">
              <div className="text-6xl mb-4">📜</div>
              <p className="text-lg mb-2">No sessions yet</p>
              <p className="text-sm">Start your first session to begin tracking your campaign progress</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const campaign = campaigns.find(c => c.id === session.campaignId);
                return (
                  <div key={session.id} className="glass rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-[#a1a1aa]">Session #{session.sessionNumber}</span>
                          <span className="text-sm text-[#a1a1aa]">•</span>
                          <span className="text-sm text-[#a1a1aa]">
                            {new Date(session.date).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-[#fafafa] mb-1">
                          {session.title}
                        </h3>
                        {campaign && (
                          <p className="text-sm text-[#a1a1aa]">{campaign.name}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[#a1a1aa]">Duration</div>
                        <div className="text-2xl font-bold text-[#8b5cf6]">
                          {Math.floor(session.duration / 60)}h {session.duration % 60}m
                        </div>
                      </div>
                    </div>

                    {session.summary && (
                      <div className="mb-4">
                        <div className="text-sm font-medium text-[#a1a1aa] mb-1">Summary</div>
                        <p className="text-[#fafafa]">{session.summary}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-[#a1a1aa]">XP Awarded</div>
                        <div className="text-[#fafafa] font-medium">{session.xpAwarded}</div>
                      </div>
                      <div>
                        <div className="text-[#a1a1aa]">Attendees</div>
                        <div className="text-[#fafafa] font-medium">{session.attendees.length}</div>
                      </div>
                      <div>
                        <div className="text-[#a1a1aa]">Treasure</div>
                        <div className="text-[#fafafa] font-medium">
                          {session.treasureAwarded.length} items
                        </div>
                      </div>
                      <div>
                        <div className="text-[#a1a1aa]">Started</div>
                        <div className="text-[#fafafa] font-medium">
                          {new Date(session.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    {session.notes && (
                      <div className="mt-4 pt-4 border-t border-[#27272a]">
                        <div className="text-sm font-medium text-[#a1a1aa] mb-1">Notes</div>
                        <p className="text-sm text-[#fafafa]">{session.notes}</p>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-[#27272a]">
                      <Button
                        variant="ghostGold"
                        size="sm"
                        icon={Eye}
                        iconPosition="left"
                        onClick={() => viewSessionDetails(session)}
                        className="w-full"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Start Session Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Start New Session"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Campaign
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full px-4 py-2 bg-[#27272a] text-[#fafafa] rounded-lg border border-[#3f3f46] focus:border-[#8b5cf6] focus:outline-none"
              >
                <option value="">Select a campaign</option>
                {campaigns
                  .filter(c => c.status === 'active' || c.status === 'planning')
                  .map(campaign => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name} (Session #{campaign.sessionCount + 1})
                    </option>
                  ))}
              </select>
            </div>

            <Input
              type="text"
              label="Session Title"
              placeholder="The Quest for the Lost Artifact"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              required
            />

            <div className="glass-subtle rounded-lg p-4">
              <p className="text-sm text-[#a1a1aa]">
                Starting a session will begin tracking time and provide quick access to combat, dice rolling, and campaign information.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={startSession}>
                Start Session
              </Button>
            </div>
          </div>
        </Modal>

        {/* End Session Modal */}
        <Modal
          isOpen={showEndModal}
          onClose={() => setShowEndModal(false)}
          title="End Session"
        >
          <div className="space-y-4">
            <div className="glass-subtle rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#a1a1aa]">Session Duration</span>
                <span className="text-lg font-bold text-[#8b5cf6]">{formatTime(elapsedTime)}</span>
              </div>
              <div className="text-xs text-[#a1a1aa]">
                = {Math.floor(elapsedTime / 60)} minutes
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Session Summary
              </label>
              <textarea
                value={sessionSummary}
                onChange={(e) => setSessionSummary(e.target.value)}
                placeholder="What happened in this session?"
                rows={3}
                className="w-full px-4 py-2 bg-[#27272a] text-[#fafafa] rounded-lg border border-[#3f3f46] focus:border-[#8b5cf6] focus:outline-none resize-none"
              />
            </div>

            <Input
              type="number"
              label="Total XP Awarded"
              placeholder="0"
              value={xpAwarded}
              onChange={(e) => setXpAwarded(parseInt(e.target.value) || 0)}
              min={0}
            />

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                DM Notes (Optional)
              </label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Private notes about the session..."
                rows={3}
                className="w-full px-4 py-2 bg-[#27272a] text-[#fafafa] rounded-lg border border-[#3f3f46] focus:border-[#8b5cf6] focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowEndModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={endSession}>
                End Session & Save
              </Button>
            </div>
          </div>
        </Modal>

        {/* Session Detail Modal */}
        {selectedSession && (
          <SessionDetailModal
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            session={selectedSession}
            campaign={campaigns.find(c => c.id === selectedSession.campaignId)}
          />
        )}
      </div>
    </div>
  );
}
