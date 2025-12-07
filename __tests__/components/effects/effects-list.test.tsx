/**
 * EffectsList Component Tests
 * Tests for displaying lists of effects
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EffectsList } from '@/app/components/effects/effects-list';
import { createEffect } from '@/app/types/effects';

describe('EffectsList', () => {
  describe('Display', () => {
    it('should render list of effects', () => {
      const effects = [
        createEffect({
          name: 'Bless',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 10,
        }),
        createEffect({
          name: 'Haste',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 5,
        }),
        createEffect({
          name: 'Shield',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 1,
        }),
      ];

      render(<EffectsList effects={effects} />);

      expect(screen.getByText('Bless')).toBeInTheDocument();
      expect(screen.getByText('Haste')).toBeInTheDocument();
      expect(screen.getByText('Shield')).toBeInTheDocument();
    });

    it('should render empty state when no effects', () => {
      render(<EffectsList effects={[]} />);

      expect(screen.getByText(/no active effects/i)).toBeInTheDocument();
    });

    it('should show custom empty message', () => {
      render(<EffectsList effects={[]} emptyMessage="No buffs active" />);

      expect(screen.getByText('No buffs active')).toBeInTheDocument();
    });

    it('should group effects by type when groupByType is true', () => {
      const effects = [
        createEffect({
          name: 'Bless',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 10,
          mechanics: { bonuses: [{ type: 'attack', value: '+1d4' }] },
        }),
        createEffect({
          name: 'Poisoned',
          appliedBy: 'dm-1',
          appliedTo: 'char-1',
          durationType: 'saves',
          saveRequired: { ability: 'CON', dc: 12, timing: 'end' },
          mechanics: { disadvantageOn: ['attacks'] },
        }),
        createEffect({
          name: 'Haste',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 5,
          mechanics: { bonuses: [{ type: 'ac', value: '+2' }] },
        }),
      ];

      render(<EffectsList effects={effects} groupByType={true} />);

      expect(screen.getByText('Buffs')).toBeInTheDocument();
      expect(screen.getByText('Debuffs')).toBeInTheDocument();
    });

    it('should not show group headers when groupByType is false', () => {
      const effects = [
        createEffect({
          name: 'Bless',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 10,
          mechanics: { bonuses: [{ type: 'attack', value: '+1d4' }] },
        }),
      ];

      render(<EffectsList effects={effects} groupByType={false} />);

      expect(screen.queryByText('Buffs')).not.toBeInTheDocument();
    });

    it('should render with compact size', () => {
      const effects = [
        createEffect({
          name: 'Bless',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 10,
        }),
      ];

      const { container } = render(<EffectsList effects={effects} size="compact" />);

      const badges = container.querySelectorAll('.effect-badge.compact');
      expect(badges.length).toBe(1);
    });
  });

  describe('Interaction', () => {
    it('should call onEffectClick when effect is clicked', () => {
      const effects = [
        createEffect({
          name: 'Bless',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 10,
        }),
      ];

      const handleClick = jest.fn();

      render(<EffectsList effects={effects} onEffectClick={handleClick} />);

      const badge = screen.getByText('Bless').closest('button');
      if (badge) fireEvent.click(badge);

      expect(handleClick).toHaveBeenCalledWith(effects[0]);
    });

    it('should show remove buttons when removable', () => {
      const effects = [
        createEffect({
          name: 'Bless',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 10,
        }),
      ];

      render(<EffectsList effects={effects} removable={true} />);

      expect(screen.getByLabelText(/remove bless/i)).toBeInTheDocument();
    });

    it('should call onRemoveEffect when remove button clicked', () => {
      const effects = [
        createEffect({
          name: 'Bless',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 10,
        }),
      ];

      const handleRemove = jest.fn();

      render(
        <EffectsList
          effects={effects}
          removable={true}
          onRemoveEffect={handleRemove}
        />
      );

      const removeButton = screen.getByLabelText(/remove bless/i);
      fireEvent.click(removeButton);

      expect(handleRemove).toHaveBeenCalledWith(effects[0]);
    });

    it('should not show remove buttons when not removable', () => {
      const effects = [
        createEffect({
          name: 'Bless',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 10,
        }),
      ];

      render(<EffectsList effects={effects} removable={false} />);

      expect(screen.queryByLabelText(/remove/i)).not.toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should filter effects when filter prop is provided', () => {
      const effects = [
        createEffect({
          name: 'Bless',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 10,
          mechanics: { bonuses: [{ type: 'attack', value: '+1d4' }] },
        }),
        createEffect({
          name: 'Poisoned',
          appliedBy: 'dm-1',
          appliedTo: 'char-1',
          durationType: 'saves',
          saveRequired: { ability: 'CON', dc: 12, timing: 'end' },
          mechanics: { disadvantageOn: ['attacks'] },
        }),
      ];

      // Only show buffs
      render(<EffectsList effects={effects} filter={(e) => e.mechanics.bonuses !== undefined} />);

      expect(screen.getByText('Bless')).toBeInTheDocument();
      expect(screen.queryByText('Poisoned')).not.toBeInTheDocument();
    });

    it('should show concentration effects only when showConcentrationOnly is true', () => {
      const effects = [
        createEffect({
          name: 'Bless',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 10,
          mechanics: { requiresConcentration: true },
        }),
        createEffect({
          name: 'Shield',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 1,
          mechanics: { requiresConcentration: false },
        }),
      ];

      render(<EffectsList effects={effects} showConcentrationOnly={true} />);

      expect(screen.getByText('Bless')).toBeInTheDocument();
      expect(screen.queryByText('Shield')).not.toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort by duration remaining when sortBy is "duration"', () => {
      const effects = [
        createEffect({
          name: 'Long',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 10,
        }),
        createEffect({
          name: 'Short',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 1,
        }),
        createEffect({
          name: 'Medium',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 5,
        }),
      ];

      const { container } = render(<EffectsList effects={effects} sortBy="duration" />);

      const badges = Array.from(container.querySelectorAll('.effect-badge .name'));
      const names = badges.map(badge => badge.textContent);

      expect(names).toEqual(['Short', 'Medium', 'Long']);
    });

    it('should sort alphabetically when sortBy is "name"', () => {
      const effects = [
        createEffect({
          name: 'Zeal',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 10,
        }),
        createEffect({
          name: 'Aid',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 10,
        }),
        createEffect({
          name: 'Bless',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 10,
        }),
      ];

      const { container } = render(<EffectsList effects={effects} sortBy="name" />);

      const badges = Array.from(container.querySelectorAll('.effect-badge .name'));
      const names = badges.map(badge => badge.textContent);

      expect(names).toEqual(['Aid', 'Bless', 'Zeal']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined effects gracefully', () => {
      render(<EffectsList effects={undefined as any} />);

      expect(screen.getByText(/no active effects/i)).toBeInTheDocument();
    });

    it('should handle single effect', () => {
      const effects = [
        createEffect({
          name: 'Solo',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 10,
        }),
      ];

      render(<EffectsList effects={effects} />);

      expect(screen.getByText('Solo')).toBeInTheDocument();
    });

    it('should handle large number of effects', () => {
      const effects = Array.from({ length: 50 }, (_, i) =>
        createEffect({
          name: `Effect ${i}`,
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'rounds',
          roundsRemaining: 10,
        })
      );

      const { container } = render(<EffectsList effects={effects} />);

      const badges = container.querySelectorAll('.effect-badge');
      expect(badges.length).toBe(50);
    });
  });
});
