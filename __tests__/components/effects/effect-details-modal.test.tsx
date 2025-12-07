/**
 * EffectDetailsModal Component Tests
 * Tests for modal to view and manage effect details
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EffectDetailsModal } from '@/app/components/effects/effect-details-modal';
import { createEffect } from '@/app/types/effects';

describe('EffectDetailsModal', () => {
  const mockEffect = createEffect({
    name: 'Bless',
    icon: '✨',
    description: 'Add 1d4 to attack rolls and saving throws',
    appliedBy: 'user-1',
    appliedTo: 'char-1',
    durationType: 'rounds',
    roundsRemaining: 10,
    mechanics: {
      requiresConcentration: true,
      bonuses: [
        { type: 'attack', value: '+1d4' },
        { type: 'save', value: '+1d4' },
      ],
    },
  });

  const mockOnUpdate = jest.fn();
  const mockOnRemove = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
    mockOnRemove.mockClear();
    mockOnClose.mockClear();
  });

  describe('Display', () => {
    it('should render modal when open with effect', () => {
      render(
        <EffectDetailsModal
          isOpen={true}
          effect={mockEffect}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('heading', { name: 'Bless' })).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <EffectDetailsModal
          isOpen={false}
          effect={mockEffect}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole('heading', { name: 'Bless' })).not.toBeInTheDocument();
    });

    it('should not render when no effect provided', () => {
      render(
        <EffectDetailsModal
          isOpen={true}
          effect={null}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole('heading', { name: 'Bless' })).not.toBeInTheDocument();
    });

    it('should display effect icon and description', () => {
      render(
        <EffectDetailsModal
          isOpen={true}
          effect={mockEffect}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('✨')).toBeInTheDocument();
      expect(screen.getByText(/Add 1d4 to attack rolls/i)).toBeInTheDocument();
    });

    it('should show duration information for round-based effects', () => {
      render(
        <EffectDetailsModal
          isOpen={true}
          effect={mockEffect}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/10 rounds remaining/i)).toBeInTheDocument();
    });

    it('should show concentration indicator for concentration effects', () => {
      render(
        <EffectDetailsModal
          isOpen={true}
          effect={mockEffect}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/requires concentration/i)).toBeInTheDocument();
    });

    it('should display effect mechanics bonuses', () => {
      render(
        <EffectDetailsModal
          isOpen={true}
          effect={mockEffect}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      // Check for both bonuses
      expect(screen.getByText(/\+1d4 to Attack rolls/i)).toBeInTheDocument();
      expect(screen.getByText(/\+1d4 to Saving throws/i)).toBeInTheDocument();
    });

    it('should show save requirement for save-based effects', () => {
      const saveEffect = createEffect({
        name: 'Poisoned',
        appliedBy: 'dm-1',
        appliedTo: 'char-1',
        durationType: 'saves',
        saveRequired: { ability: 'CON', dc: 12, timing: 'end' },
      });

      render(
        <EffectDetailsModal
          isOpen={true}
          effect={saveEffect}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/DC 12 CON/i)).toBeInTheDocument();
    });
  });

  describe('Editing', () => {
    it('should show edit button when editable', () => {
      render(
        <EffectDetailsModal
          isOpen={true}
          effect={mockEffect}
          editable={true}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    it('should not show edit button when not editable', () => {
      render(
        <EffectDetailsModal
          isOpen={true}
          effect={mockEffect}
          editable={false}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });

    it('should enter edit mode when Edit is clicked', () => {
      render(
        <EffectDetailsModal
          isOpen={true}
          effect={mockEffect}
          editable={true}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      expect(screen.getByLabelText(/rounds remaining/i)).toBeInTheDocument();
    });

    it('should allow updating duration', async () => {
      render(
        <EffectDetailsModal
          isOpen={true}
          effect={mockEffect}
          editable={true}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      const input = screen.getByLabelText(/rounds remaining/i);
      fireEvent.change(input, { target: { value: '5' } });

      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });

      const updatedEffect = mockOnUpdate.mock.calls[0][0];
      expect(updatedEffect.roundsRemaining).toBe(5);
    });

    it('should cancel editing when Cancel is clicked', () => {
      render(
        <EffectDetailsModal
          isOpen={true}
          effect={mockEffect}
          editable={true}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(screen.queryByLabelText(/rounds remaining/i)).not.toBeInTheDocument();
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  describe('Removal', () => {
    it('should show remove button when removable', () => {
      render(
        <EffectDetailsModal
          isOpen={true}
          effect={mockEffect}
          removable={true}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('button', { name: /remove effect/i })).toBeInTheDocument();
    });

    it('should not show remove button when not removable', () => {
      render(
        <EffectDetailsModal
          isOpen={true}
          effect={mockEffect}
          removable={false}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole('button', { name: /remove effect/i })).not.toBeInTheDocument();
    });

    it('should call onRemove when Remove Effect is clicked', () => {
      render(
        <EffectDetailsModal
          isOpen={true}
          effect={mockEffect}
          removable={true}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /remove effect/i }));

      expect(mockOnRemove).toHaveBeenCalledWith(mockEffect);
    });

    it('should close modal after removing effect', () => {
      render(
        <EffectDetailsModal
          isOpen={true}
          effect={mockEffect}
          removable={true}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /remove effect/i }));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Closing', () => {
    it('should close modal when Close is clicked', () => {
      render(
        <EffectDetailsModal
          isOpen={true}
          effect={mockEffect}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByLabelText(/close/i);
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close modal when clicking backdrop', () => {
      render(
        <EffectDetailsModal
          isOpen={true}
          effect={mockEffect}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      const backdrop = screen.getByTestId('modal-backdrop');
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close modal when pressing Escape', () => {
      render(
        <EffectDetailsModal
          isOpen={true}
          effect={mockEffect}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Effect Mechanics Display', () => {
    it('should display advantage mechanics', () => {
      const advantageEffect = createEffect({
        name: 'Guidance',
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 1,
        mechanics: {
          advantageOn: ['ability-checks'],
        },
      });

      render(
        <EffectDetailsModal
          isOpen={true}
          effect={advantageEffect}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/advantage.*ability checks/i)).toBeInTheDocument();
    });

    it('should display disadvantage mechanics', () => {
      const disadvantageEffect = createEffect({
        name: 'Poisoned',
        appliedBy: 'dm-1',
        appliedTo: 'char-1',
        durationType: 'permanent',
        mechanics: {
          disadvantageOn: ['attacks', 'ability-checks'],
        },
      });

      render(
        <EffectDetailsModal
          isOpen={true}
          effect={disadvantageEffect}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/disadvantage.*attacks/i)).toBeInTheDocument();
      expect(screen.getByText(/disadvantage.*ability checks/i)).toBeInTheDocument();
    });

    it('should display damage per round', () => {
      const damageEffect = createEffect({
        name: 'Burning',
        appliedBy: 'dm-1',
        appliedTo: 'char-1',
        durationType: 'rounds',
        roundsRemaining: 3,
        mechanics: {
          damagePerRound: { amount: 5, type: 'fire', timing: 'start' },
        },
      });

      render(
        <EffectDetailsModal
          isOpen={true}
          effect={damageEffect}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/5.*fire.*damage/i)).toBeInTheDocument();
    });

    it('should display temporary hit points', () => {
      const tempHpEffect = {
        ...createEffect({
          name: 'Aid',
          appliedBy: 'user-1',
          appliedTo: 'char-1',
          durationType: 'time',
          timeExpiry: new Date(Date.now() + 28800000).toISOString(),
        }),
        mechanics: {
          ...createEffect({
            name: 'Aid',
            appliedBy: 'user-1',
            appliedTo: 'char-1',
            durationType: 'time',
          }).mechanics,
          temporaryHitPoints: 10,
        },
      };

      render(
        <EffectDetailsModal
          isOpen={true}
          effect={tempHpEffect as any}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          onClose={mockOnClose}
        />
      );

      // Check for temp HP text
      expect(screen.getByText(/10 temporary HP/i)).toBeInTheDocument();
    });
  });
});
