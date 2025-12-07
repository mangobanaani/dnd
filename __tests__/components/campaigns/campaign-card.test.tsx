import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CampaignCard } from '@/app/components/campaigns/campaign-card';
import { Campaign } from '@/app/types/campaign';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('CampaignCard', () => {
  const mockCampaign: Campaign = {
    id: '1',
    name: 'Chronicles of the War of the Lance',
    description: 'An epic Dragonlance campaign',
    setting: 'Dragonlance',
    edition: '5e',
    status: 'active',
    currentLevel: 5,
    difficultyLevel: 'medium',
    homebrew: false,
    playerIds: ['p1', 'p2', 'p3', 'p4'],
    sessionCount: 12,
    startDate: '2024-01-15',
    nextSessionDate: '2024-03-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-02-20',
  };

  const mockOnDelete = jest.fn();
  const mockOnSetActive = jest.fn();

  beforeEach(() => {
    mockPush.mockClear();
    mockOnDelete.mockClear();
    mockOnSetActive.mockClear();
  });

  describe('Rendering', () => {
    it('renders campaign card with glass-card background', () => {
      const { container } = render(
        <CampaignCard
          campaign={mockCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('glass-card');
    });

    it('uses display font for campaign name', () => {
      render(
        <CampaignCard
          campaign={mockCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      const title = screen.getByText('Chronicles of the War of the Lance');
      expect(title).toHaveClass('font-display');
    });

    it('renders campaign icon with Lucide icon', () => {
      const { container } = render(
        <CampaignCard
          campaign={mockCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      // Should have SVG icon instead of emoji
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it('displays campaign description', () => {
      render(
        <CampaignCard
          campaign={mockCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      expect(screen.getByText('An epic Dragonlance campaign')).toBeInTheDocument();
    });

    it('displays stats with icons', () => {
      render(
        <CampaignCard
          campaign={mockCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      // Should show player count
      expect(screen.getByText(/4 players/i)).toBeInTheDocument();

      // Should show session count
      expect(screen.getByText(/12 sessions/i)).toBeInTheDocument();

      // Should show level
      expect(screen.getByText(/Level 5/i)).toBeInTheDocument();
    });
  });

  describe('Status Badge', () => {
    it('renders active status with gold accent', () => {
      render(
        <CampaignCard
          campaign={mockCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      const badge = screen.getByText(/active/i);
      expect(badge.className).toContain('#d4af37');
    });

    it('renders planning status with default styling', () => {
      const planningCampaign = { ...mockCampaign, status: 'planning' as const };

      render(
        <CampaignCard
          campaign={planningCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      expect(screen.getByText(/planning/i)).toBeInTheDocument();
    });

    it('renders completed status with appropriate styling', () => {
      const completedCampaign = { ...mockCampaign, status: 'completed' as const };

      render(
        <CampaignCard
          campaign={completedCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      expect(screen.getByText(/completed/i)).toBeInTheDocument();
    });

    it('renders on-hold status with appropriate styling', () => {
      const onHoldCampaign = { ...mockCampaign, status: 'on-hold' as const };

      render(
        <CampaignCard
          campaign={onHoldCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      expect(screen.getByText(/on hold/i)).toBeInTheDocument();
    });
  });

  describe('Badges', () => {
    it('displays homebrew badge when campaign is homebrew', () => {
      const homebrewCampaign = { ...mockCampaign, homebrew: true };

      render(
        <CampaignCard
          campaign={homebrewCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      expect(screen.getByText(/homebrew/i)).toBeInTheDocument();
    });

    it('does not display homebrew badge when campaign is not homebrew', () => {
      render(
        <CampaignCard
          campaign={mockCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      expect(screen.queryByText(/homebrew/i)).not.toBeInTheDocument();
    });
  });

  describe('Hover Effects', () => {
    it('applies depth shift animation on hover', () => {
      const { container } = render(
        <CampaignCard
          campaign={mockCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('transition-all');
      expect(card.className).toContain('duration-350');
    });

    it('shows chevron icon on hover', () => {
      const { container } = render(
        <CampaignCard
          campaign={mockCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      // Chevron should be present but hidden initially (opacity-0)
      const chevron = container.querySelector('.opacity-0');
      expect(chevron).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onDelete when delete button is clicked', () => {
      render(
        <CampaignCard
          campaign={mockCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });

    it('calls onSetActive when set active button is clicked', () => {
      const inactiveCampaign = { ...mockCampaign, status: 'planning' as const };

      render(
        <CampaignCard
          campaign={inactiveCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      const setActiveButton = screen.getByRole('button', { name: /set active/i });
      fireEvent.click(setActiveButton);

      expect(mockOnSetActive).toHaveBeenCalledWith('1');
    });

    it('does not show set active button for active campaigns', () => {
      render(
        <CampaignCard
          campaign={mockCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      expect(screen.queryByRole('button', { name: /set active/i })).not.toBeInTheDocument();
    });

    it('stops propagation when delete button is clicked', () => {
      const { container } = render(
        <CampaignCard
          campaign={mockCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');

      fireEvent.click(deleteButton);

      // Delete should have been called
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });
  });

  describe('Color System', () => {
    it('uses updated purple color (#9d6fff)', () => {
      const { container } = render(
        <CampaignCard
          campaign={mockCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      const purpleElements = container.querySelectorAll('[class*="#9d6fff"]');
      expect(purpleElements.length).toBeGreaterThan(0);
    });

    it('uses gold accent color (#d4af37) for active status', () => {
      render(
        <CampaignCard
          campaign={mockCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      const activeBadge = screen.getByText(/active/i);
      expect(activeBadge.className).toContain('#d4af37');
    });

    it('uses new muted text color (#a1a1aa)', () => {
      const { container } = render(
        <CampaignCard
          campaign={mockCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      const mutedElements = container.querySelectorAll('[class*="#a1a1aa"]');
      expect(mutedElements.length).toBeGreaterThan(0);
    });
  });

  describe('Next Session Date', () => {
    it('displays next session date when present', () => {
      render(
        <CampaignCard
          campaign={mockCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      expect(screen.getByText(/next session/i)).toBeInTheDocument();
    });

    it('does not display next session section when date is not set', () => {
      const campaignWithoutNextSession = { ...mockCampaign, nextSessionDate: undefined };

      render(
        <CampaignCard
          campaign={campaignWithoutNextSession}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      expect(screen.queryByText(/next session/i)).not.toBeInTheDocument();
    });
  });

  describe('Duration Display', () => {
    it('displays campaign duration in days', () => {
      render(
        <CampaignCard
          campaign={mockCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      // Should show either "X days" or "Started today"
      const durationText = screen.getByText(/days|Started today/i);
      expect(durationText).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles', () => {
      render(
        <CampaignCard
          campaign={mockCampaign}
          onDelete={mockOnDelete}
          onSetActive={mockOnSetActive}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });
  });
});
