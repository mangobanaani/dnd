/**
 * EffectBadge Component Tests
 * Tests for displaying individual effect badges
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EffectBadge } from '@/app/components/effects/effect-badge';
import { createEffect } from '@/app/types/effects';

describe('EffectBadge', () => {
  describe('Display', () => {
    it('should render effect name and icon', () => {
      const effect = createEffect({
        name: 'Bless',
        icon: '✨',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      render(<EffectBadge effect={effect} />);

      expect(screen.getByText('✨')).toBeInTheDocument();
      expect(screen.getByText('Bless')).toBeInTheDocument();
    });

    it('should display rounds remaining for round-based effects', () => {
      const effect = createEffect({
        name: 'Haste',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 5,
      });

      render(<EffectBadge effect={effect} />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should display concentration indicator for concentration effects', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: { requiresConcentration: true },
      });

      render(<EffectBadge effect={effect} />);

      expect(screen.getByText('C')).toBeInTheDocument();
    });

    it('should not display concentration indicator for non-concentration effects', () => {
      const effect = createEffect({
        name: 'Guidance',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 1,
        mechanics: { requiresConcentration: false },
      });

      render(<EffectBadge effect={effect} />);

      expect(screen.queryByText('C')).not.toBeInTheDocument();
    });

    it('should display save required indicator for save-based effects', () => {
      const effect = createEffect({
        name: 'Poisoned',
        appliedBy: 'dm-1',
        appliedTo: 'char-1',
        durationType: 'saves',
        saveRequired: { ability: 'CON', dc: 12, timing: 'end' },
      });

      render(<EffectBadge effect={effect} />);

      expect(screen.getByText(/CON/i)).toBeInTheDocument();
    });

    it('should not display duration for permanent effects', () => {
      const effect = createEffect({
        name: 'Hex',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'permanent',
      });

      render(<EffectBadge effect={effect} />);

      expect(screen.queryByText(/\d+/)).not.toBeInTheDocument();
    });

    it('should display time expiry for time-based effects', () => {
      const futureTime = new Date(Date.now() + 7200000).toISOString(); // 2 hours from now
      const effect = createEffect({
        name: 'Aid',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'time',
        timeExpiry: futureTime,
      });

      render(<EffectBadge effect={effect} />);

      // Should show hour indicator (1h or 2h depending on milliseconds elapsed)
      expect(screen.getByText(/\dh/i)).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onClick when clicked', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      const handleClick = jest.fn();

      render(<EffectBadge effect={effect} onClick={handleClick} />);

      const badge = screen.getByText('Bless').closest('button');
      if (badge) fireEvent.click(badge);

      expect(handleClick).toHaveBeenCalledWith(effect);
    });

    it('should not call onClick when removable and remove button clicked', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      const handleClick = jest.fn();
      const handleRemove = jest.fn();

      render(
        <EffectBadge
          effect={effect}
          onClick={handleClick}
          onRemove={handleRemove}
          removable={true}
        />
      );

      const removeButton = screen.getByLabelText(/remove/i);
      fireEvent.click(removeButton);

      expect(handleRemove).toHaveBeenCalledWith(effect);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not show remove button when not removable', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      render(<EffectBadge effect={effect} removable={false} />);

      expect(screen.queryByLabelText(/remove/i)).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply buff styling for beneficial effects', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
        mechanics: {
          bonuses: [{ type: 'attack', value: '+1d4' }],
        },
      });

      const { container } = render(<EffectBadge effect={effect} />);

      const badge = container.querySelector('.effect-badge');
      expect(badge).toHaveClass('buff');
    });

    it('should apply debuff styling for harmful effects', () => {
      const effect = createEffect({
        name: 'Poisoned',
        appliedBy: 'dm-1',
        appliedTo: 'char-1',
        durationType: 'saves',
        saveRequired: { ability: 'CON', dc: 12, timing: 'end' },
        mechanics: {
          disadvantageOn: ['attacks'],
        },
      });

      const { container } = render(<EffectBadge effect={effect} />);

      const badge = container.querySelector('.effect-badge');
      expect(badge).toHaveClass('debuff');
    });

    it('should apply neutral styling for neutral effects', () => {
      const effect = createEffect({
        name: 'Invisibility',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      const { container } = render(<EffectBadge effect={effect} />);

      const badge = container.querySelector('.effect-badge');
      expect(badge).toHaveClass('neutral');
    });

    it('should apply compact size when specified', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      const { container } = render(<EffectBadge effect={effect} size="compact" />);

      const badge = container.querySelector('.effect-badge');
      expect(badge).toHaveClass('compact');
    });

    it('should apply default size when not specified', () => {
      const effect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 10,
      });

      const { container } = render(<EffectBadge effect={effect} />);

      const badge = container.querySelector('.effect-badge');
      expect(badge).toHaveClass('default');
    });
  });

  describe('Edge Cases', () => {
    it('should handle effect with no icon gracefully', () => {
      const effect = createEffect({
        name: 'Custom Effect',
        icon: '',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 5,
      });

      render(<EffectBadge effect={effect} />);

      expect(screen.getByText('Custom Effect')).toBeInTheDocument();
    });

    it('should handle 0 rounds remaining', () => {
      const effect = createEffect({
        name: 'Expiring',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 0,
      });

      render(<EffectBadge effect={effect} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle expired time-based effects', () => {
      const pastTime = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
      const effect = createEffect({
        name: 'Old Spell',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'time',
        timeExpiry: pastTime,
      });

      const { container } = render(<EffectBadge effect={effect} />);

      // Check that duration shows "Expired"
      const durationElement = container.querySelector('.duration');
      expect(durationElement).toHaveTextContent('Expired');
    });
  });
});
