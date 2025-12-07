/**
 * AddEffectModal Component Tests
 * Tests for modal to add new effects
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddEffectModal } from '@/app/components/effects/add-effect-modal';
import { SPELL_TEMPLATES, CONDITION_TEMPLATES } from '@/app/data/effect-templates';

describe('AddEffectModal', () => {
  const mockOnAdd = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnAdd.mockClear();
    mockOnClose.mockClear();
  });

  describe('Display', () => {
    it('should render modal when open', () => {
      render(
        <AddEffectModal
          isOpen={true}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('heading', { name: 'Add Effect' })).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <AddEffectModal
          isOpen={false}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText('Add Effect')).not.toBeInTheDocument();
    });

    it('should show spell and condition tabs', () => {
      render(
        <AddEffectModal
          isOpen={true}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Spells')).toBeInTheDocument();
      expect(screen.getByText('Conditions')).toBeInTheDocument();
    });

    it('should display spell templates in Spells tab', () => {
      render(
        <AddEffectModal
          isOpen={true}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      // Click Spells tab
      fireEvent.click(screen.getByText('Spells'));

      // Should show some spell templates
      expect(screen.getByText('Bless')).toBeInTheDocument();
      expect(screen.getByText('Haste')).toBeInTheDocument();
    });

    it('should display condition templates in Conditions tab', () => {
      render(
        <AddEffectModal
          isOpen={true}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      // Click Conditions tab
      fireEvent.click(screen.getByText('Conditions'));

      // Should show some condition templates
      expect(screen.getByText('Poisoned')).toBeInTheDocument();
      expect(screen.getByText('Stunned')).toBeInTheDocument();
    });

    it('should show custom effect option', () => {
      render(
        <AddEffectModal
          isOpen={true}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Custom')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('should allow selecting a spell template', () => {
      render(
        <AddEffectModal
          isOpen={true}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByText('Spells'));
      fireEvent.click(screen.getByText('Bless'));

      // Should show selected template details with heading
      expect(screen.getByRole('heading', { name: 'Bless', level: 3 })).toBeInTheDocument();
    });

    it('should allow selecting a condition template', () => {
      render(
        <AddEffectModal
          isOpen={true}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByText('Conditions'));
      fireEvent.click(screen.getByText('Poisoned'));

      // Should show condition heading in details
      expect(screen.getByRole('heading', { name: 'Poisoned', level: 3 })).toBeInTheDocument();
    });

    it('should show duration input for selected effect', () => {
      render(
        <AddEffectModal
          isOpen={true}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByText('Spells'));
      fireEvent.click(screen.getByText('Bless'));

      // Should show duration input
      expect(screen.getByLabelText(/rounds/i)).toBeInTheDocument();
    });

    it('should show save DC input for save-based effects', () => {
      render(
        <AddEffectModal
          isOpen={true}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByText('Conditions'));
      fireEvent.click(screen.getByText('Poisoned'));

      // Should show DC input
      expect(screen.getByLabelText(/DC/i)).toBeInTheDocument();
    });
  });

  describe('Custom Effect', () => {
    it('should show custom effect form when Custom is selected', () => {
      render(
        <AddEffectModal
          isOpen={true}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByText('Custom'));

      expect(screen.getByLabelText(/Effect Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    });

    it('should allow creating custom effect', async () => {
      render(
        <AddEffectModal
          isOpen={true}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByText('Custom'));

      const nameInput = screen.getByLabelText(/Effect Name/i);
      fireEvent.change(nameInput, { target: { value: 'My Custom Effect' } });

      const descInput = screen.getByLabelText(/Description/i);
      fireEvent.change(descInput, { target: { value: 'Does something cool' } });

      const addButton = screen.getByRole('button', { name: 'Add Effect' });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalled();
      });

      const addedEffect = mockOnAdd.mock.calls[0][0];
      expect(addedEffect.name).toBe('My Custom Effect');
      expect(addedEffect.description).toBe('Does something cool');
    });
  });

  describe('Submission', () => {
    it('should create and add effect when Add Effect is clicked', async () => {
      render(
        <AddEffectModal
          isOpen={true}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByText('Spells'));
      fireEvent.click(screen.getByText('Bless'));

      const addButton = screen.getByRole('button', { name: 'Add Effect' });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalled();
      });

      const addedEffect = mockOnAdd.mock.calls[0][0];
      expect(addedEffect.name).toBe('Bless');
      expect(addedEffect.appliedBy).toBe('user-1');
      expect(addedEffect.appliedTo).toBe('char-1');
    });

    it('should close modal after adding effect', async () => {
      render(
        <AddEffectModal
          isOpen={true}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByText('Spells'));
      fireEvent.click(screen.getByText('Haste'));

      const addButton = screen.getByRole('button', { name: 'Add Effect' });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should not add effect if no template selected', () => {
      render(
        <AddEffectModal
          isOpen={true}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      const addButton = screen.getByRole('button', { name: 'Add Effect' });
      fireEvent.click(addButton);

      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it('should respect custom duration when provided', async () => {
      render(
        <AddEffectModal
          isOpen={true}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByText('Spells'));
      fireEvent.click(screen.getByText('Bless'));

      const durationInput = screen.getByLabelText(/rounds/i);
      fireEvent.change(durationInput, { target: { value: '5' } });

      const addButton = screen.getByRole('button', { name: 'Add Effect' });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalled();
      });

      const addedEffect = mockOnAdd.mock.calls[0][0];
      expect(addedEffect.roundsRemaining).toBe(5);
    });

    it('should respect custom DC when provided', async () => {
      render(
        <AddEffectModal
          isOpen={true}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByText('Conditions'));
      fireEvent.click(screen.getByText('Poisoned'));

      const dcInput = screen.getByLabelText(/DC/i);
      fireEvent.change(dcInput, { target: { value: '15' } });

      const addButton = screen.getByRole('button', { name: 'Add Effect' });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalled();
      });

      const addedEffect = mockOnAdd.mock.calls[0][0];
      expect(addedEffect.saveRequired?.dc).toBe(15);
    });
  });

  describe('Cancellation', () => {
    it('should close modal when Cancel is clicked', () => {
      render(
        <AddEffectModal
          isOpen={true}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it('should close modal when clicking outside', () => {
      render(
        <AddEffectModal
          isOpen={true}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      const backdrop = screen.getByTestId('modal-backdrop');
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close modal when pressing Escape', () => {
      render(
        <AddEffectModal
          isOpen={true}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Search', () => {
    it('should filter templates when searching', () => {
      render(
        <AddEffectModal
          isOpen={true}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'bless' } });

      expect(screen.getByText('Bless')).toBeInTheDocument();
      expect(screen.queryByText('Haste')).not.toBeInTheDocument();
    });

    it('should search across all categories', () => {
      render(
        <AddEffectModal
          isOpen={true}
          targetId="char-1"
          appliedBy="user-1"
          onAdd={mockOnAdd}
          onClose={mockOnClose}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'poison' } });

      // Should find Poisoned condition
      expect(screen.getByText('Poisoned')).toBeInTheDocument();
    });
  });
});
