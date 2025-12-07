import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionDetailModal } from '@/app/components/session-detail-modal';
import { Campaign, CampaignSession } from '@/app/types/campaign';

describe('SessionDetailModal', () => {
  const mockCampaign: Campaign = {
    id: 'campaign-1',
    name: 'Test Campaign',
    description: 'A test campaign',
    setting: 'Forgotten Realms',
    status: 'active',
    edition: '5e',
    playerIds: ['player-1', 'player-2'],
    characterIds: ['char-1', 'char-2'],
    sessionCount: 5,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  };

  const mockSession: CampaignSession = {
    id: 'session-1',
    campaignId: 'campaign-1',
    sessionNumber: 3,
    title: 'The Lost Temple',
    summary: 'The party discovered an ancient temple hidden in the mountains.',
    date: '2024-01-15T18:00:00.000Z',
    duration: 240, // 4 hours
    attendees: ['player-1', 'player-2', 'player-3'],
    xpAwarded: 1500,
    treasureAwarded: ['Potion of Healing', '500 gold pieces', 'Magic Sword +1'],
    notes: 'Great session, players really enjoyed the puzzle room.',
    createdAt: '2024-01-15T18:00:00.000Z',
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={mockSession}
          campaign={mockCampaign}
        />
      );

      expect(screen.getByText('The Lost Temple')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(
        <SessionDetailModal
          isOpen={false}
          onClose={mockOnClose}
          session={mockSession}
          campaign={mockCampaign}
        />
      );

      expect(screen.queryByText('The Lost Temple')).not.toBeInTheDocument();
    });

    it('renders session number badge', () => {
      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={mockSession}
          campaign={mockCampaign}
        />
      );

      expect(screen.getByText('Session #3')).toBeInTheDocument();
    });

    it('renders campaign name when provided', () => {
      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={mockSession}
          campaign={mockCampaign}
        />
      );

      expect(screen.getByText('Test Campaign')).toBeInTheDocument();
    });

    it('renders without campaign', () => {
      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={mockSession}
        />
      );

      expect(screen.getByText('The Lost Temple')).toBeInTheDocument();
      expect(screen.queryByText('Test Campaign')).not.toBeInTheDocument();
    });
  });

  describe('Session Information Display', () => {
    it('displays formatted date', () => {
      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={mockSession}
          campaign={mockCampaign}
        />
      );

      // Date should be formatted as "Monday, January 15, 2024" or similar
      // Using getAllByText since date appears in both date section and metadata
      const dateElements = screen.getAllByText(/January 15, 2024/);
      expect(dateElements.length).toBeGreaterThanOrEqual(1);
    });

    it('displays duration in hours and minutes', () => {
      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={mockSession}
          campaign={mockCampaign}
        />
      );

      expect(screen.getByText('4h')).toBeInTheDocument();
      expect(screen.getByText('240 minutes')).toBeInTheDocument();
    });

    it('displays duration with hours and minutes', () => {
      const sessionWithMixedDuration: CampaignSession = {
        ...mockSession,
        duration: 150, // 2h 30m
      };

      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={sessionWithMixedDuration}
          campaign={mockCampaign}
        />
      );

      expect(screen.getByText('2h 30m')).toBeInTheDocument();
    });

    it('displays duration in minutes only when less than 1 hour', () => {
      const sessionWithMinutes: CampaignSession = {
        ...mockSession,
        duration: 45,
      };

      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={sessionWithMinutes}
          campaign={mockCampaign}
        />
      );

      expect(screen.getByText('45m')).toBeInTheDocument();
    });

    it('displays attendee count', () => {
      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={mockSession}
          campaign={mockCampaign}
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('players present')).toBeInTheDocument();
    });

    it('displays XP awarded with formatting', () => {
      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={mockSession}
          campaign={mockCampaign}
        />
      );

      expect(screen.getByText('1,500')).toBeInTheDocument();
      expect(screen.getByText('experience points')).toBeInTheDocument();
    });

    it('formats large XP numbers with commas', () => {
      const sessionWithLargeXP: CampaignSession = {
        ...mockSession,
        xpAwarded: 15000,
      };

      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={sessionWithLargeXP}
          campaign={mockCampaign}
        />
      );

      expect(screen.getByText('15,000')).toBeInTheDocument();
    });
  });

  describe('Summary Section', () => {
    it('displays session summary when present', () => {
      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={mockSession}
          campaign={mockCampaign}
        />
      );

      expect(
        screen.getByText('The party discovered an ancient temple hidden in the mountains.')
      ).toBeInTheDocument();
      expect(screen.getByText('Session Summary')).toBeInTheDocument();
    });

    it('does not render summary section when summary is empty', () => {
      const sessionNoSummary: CampaignSession = {
        ...mockSession,
        summary: '',
      };

      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={sessionNoSummary}
          campaign={mockCampaign}
        />
      );

      expect(screen.queryByText('Session Summary')).not.toBeInTheDocument();
    });

    it('preserves newlines in summary', () => {
      const sessionWithMultilineSummary: CampaignSession = {
        ...mockSession,
        summary: 'Line 1\nLine 2\nLine 3',
      };

      const { container } = render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={sessionWithMultilineSummary}
          campaign={mockCampaign}
        />
      );

      const summaryElement = container.querySelector('.whitespace-pre-line');
      expect(summaryElement).toHaveClass('whitespace-pre-line');
    });
  });

  describe('Treasure Section', () => {
    it('displays treasure items when present', () => {
      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={mockSession}
          campaign={mockCampaign}
        />
      );

      expect(screen.getByText('Treasure Awarded')).toBeInTheDocument();
      expect(screen.getByText('Potion of Healing')).toBeInTheDocument();
      expect(screen.getByText('500 gold pieces')).toBeInTheDocument();
      expect(screen.getByText('Magic Sword +1')).toBeInTheDocument();
    });

    it('does not render treasure section when array is empty', () => {
      const sessionNoTreasure: CampaignSession = {
        ...mockSession,
        treasureAwarded: [],
      };

      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={sessionNoTreasure}
          campaign={mockCampaign}
        />
      );

      expect(screen.queryByText('Treasure Awarded')).not.toBeInTheDocument();
    });

    it('renders gold variant card for treasure', () => {
      const { container } = render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={mockSession}
          campaign={mockCampaign}
        />
      );

      // Find the treasure card - it should have the gold border class
      const goldCards = container.querySelectorAll('.border-\\[\\#d4af37\\]\\/20');
      expect(goldCards.length).toBeGreaterThan(0);
    });
  });

  describe('Notes Section', () => {
    it('displays DM notes when present', () => {
      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={mockSession}
          campaign={mockCampaign}
        />
      );

      expect(screen.getByText('DM Notes')).toBeInTheDocument();
      expect(
        screen.getByText('Great session, players really enjoyed the puzzle room.')
      ).toBeInTheDocument();
    });

    it('does not render notes section when notes are empty', () => {
      const sessionNoNotes: CampaignSession = {
        ...mockSession,
        notes: '',
      };

      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={sessionNoNotes}
          campaign={mockCampaign}
        />
      );

      expect(screen.queryByText('DM Notes')).not.toBeInTheDocument();
    });

    it('preserves newlines in notes', () => {
      const sessionWithMultilineNotes: CampaignSession = {
        ...mockSession,
        notes: 'Note 1\nNote 2\nNote 3',
      };

      const { container } = render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={sessionWithMultilineNotes}
          campaign={mockCampaign}
        />
      );

      // Find the notes paragraph
      const notesElements = container.querySelectorAll('.whitespace-pre-line');
      expect(notesElements.length).toBeGreaterThan(0);
    });
  });

  describe('Metadata Display', () => {
    it('displays created date', () => {
      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={mockSession}
          campaign={mockCampaign}
        />
      );

      expect(screen.getByText(/Created:/)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when modal is closed', async () => {
      const user = userEvent.setup();

      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={mockSession}
          campaign={mockCampaign}
        />
      );

      // Find and click the close button (X in modal header)
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Icon Rendering', () => {
    it('renders all section icons', () => {
      const { container } = render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={mockSession}
          campaign={mockCampaign}
        />
      );

      // Should have multiple SVG icons
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(5); // Calendar, Clock, Users, Sparkles, Scroll, Coins, FileText
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={mockSession}
          campaign={mockCampaign}
        />
      );

      // Modal title should be accessible
      expect(screen.getByText('The Lost Temple')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined attendees gracefully', () => {
      const sessionWithUndefinedAttendees: CampaignSession = {
        ...mockSession,
        attendees: undefined as any, // Simulating corrupted data
      };

      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={sessionWithUndefinedAttendees}
          campaign={mockCampaign}
        />
      );

      // Should display 0 instead of crashing
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('players present')).toBeInTheDocument();
    });

    it('handles empty attendees array', () => {
      const sessionWithNoAttendees: CampaignSession = {
        ...mockSession,
        attendees: [],
      };

      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={sessionWithNoAttendees}
          campaign={mockCampaign}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('players present')).toBeInTheDocument();
    });

    it('handles undefined xpAwarded gracefully', () => {
      const sessionWithUndefinedXP: CampaignSession = {
        ...mockSession,
        xpAwarded: undefined as any, // Simulating corrupted data
      };

      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={sessionWithUndefinedXP}
          campaign={mockCampaign}
        />
      );

      // Should display 0 instead of crashing
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('experience points')).toBeInTheDocument();
    });

    it('handles null xpAwarded gracefully', () => {
      const sessionWithNullXP: CampaignSession = {
        ...mockSession,
        xpAwarded: null as any, // Simulating corrupted data
      };

      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={sessionWithNullXP}
          campaign={mockCampaign}
        />
      );

      // Should display 0 instead of crashing
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('experience points')).toBeInTheDocument();
    });

    it('handles zero xpAwarded', () => {
      const sessionWithZeroXP: CampaignSession = {
        ...mockSession,
        xpAwarded: 0,
      };

      render(
        <SessionDetailModal
          isOpen={true}
          onClose={mockOnClose}
          session={sessionWithZeroXP}
          campaign={mockCampaign}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('experience points')).toBeInTheDocument();
    });
  });
});
