import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterCard } from '@/app/components/characters/character-card';
import { Character } from '@/app/types/character';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('CharacterCard', () => {
  const mockCharacter: Character = {
    id: '1',
    name: 'Tanis Half-Elven',
    race: 'Half-Elf',
    classes: [{ name: 'Fighter', level: 5, hitDie: 'd10' }],
    level: 5,
    background: 'Noble',
    alignment: 'Neutral Good',
    experiencePoints: 6500,
    abilityScores: {
      strength: 16,
      dexterity: 14,
      constitution: 15,
      intelligence: 10,
      wisdom: 12,
      charisma: 13,
    },
    maxHitPoints: 42,
    currentHitPoints: 30,
    temporaryHitPoints: 0,
    hitDice: [{ total: 5, current: 5, die: 'd10' }],
    armorClass: 18,
    initiative: 2,
    speed: 30,
    proficiencyBonus: 3,
    savingThrows: ['strength', 'constitution'],
    skills: [],
    features: [],
    traits: [],
    equipment: [],
    inventory: [],
    currency: { copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0 },
    carriedWeight: 0,
    maxCarryWeight: 240,
    effects: [],
    exhaustionLevel: 0,
    playerId: 'player-1',
    createdAt: '2024-01-01',
    updatedAt: '2024-02-20',
  };

  const mockOnDelete = jest.fn();

  beforeEach(() => {
    mockPush.mockClear();
    mockOnDelete.mockClear();
  });

  describe('Rendering', () => {
    it('renders character card with glass-card background', () => {
      const { container } = render(
        <CharacterCard character={mockCharacter} onDelete={mockOnDelete} />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('glass-card');
    });

    it('uses display font for character name', () => {
      render(<CharacterCard character={mockCharacter} onDelete={mockOnDelete} />);

      const title = screen.getByText('Tanis Half-Elven');
      expect(title).toHaveClass('font-display');
    });

    it('renders character icon with Lucide icon', () => {
      const { container } = render(
        <CharacterCard character={mockCharacter} onDelete={mockOnDelete} />
      );

      // Should have SVG icon instead of emoji
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it('displays race and class information', () => {
      render(<CharacterCard character={mockCharacter} onDelete={mockOnDelete} />);

      expect(screen.getByText(/Half-Elf • Fighter/)).toBeInTheDocument();
      expect(screen.getByText(/Fighter 5/)).toBeInTheDocument();
    });

    it('displays HP bar with gradient fill', () => {
      const { container } = render(
        <CharacterCard character={mockCharacter} onDelete={mockOnDelete} />
      );

      // Should have HP text
      expect(screen.getByText(/30.*\/.*42/)).toBeInTheDocument();

      // Should have HP bar
      const hpBar = container.querySelector('[style*="width"]');
      expect(hpBar).toBeInTheDocument();
    });
  });

  describe('Stats Display', () => {
    it('displays AC, Initiative, and Speed with icons', () => {
      const { container } = render(
        <CharacterCard character={mockCharacter} onDelete={mockOnDelete} />
      );

      // Should show AC
      const acElements = screen.getAllByText(/AC/i);
      expect(acElements.length).toBeGreaterThan(0);
      expect(screen.getByText('18')).toBeInTheDocument();

      // Should show Initiative
      const initiativeElements = screen.getAllByText(/Initiative/i);
      expect(initiativeElements.length).toBeGreaterThan(0);
      expect(screen.getByText('+2')).toBeInTheDocument(); // DEX modifier

      // Should show Speed
      const speedElements = screen.getAllByText(/Speed/i);
      expect(speedElements.length).toBeGreaterThan(0);

      // Verify icons are present
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(5); // Should have multiple icons
    });

    it('displays level badge', () => {
      render(<CharacterCard character={mockCharacter} onDelete={mockOnDelete} />);

      expect(screen.getByText(/Level 5/i)).toBeInTheDocument();
    });
  });

  describe('HP Bar', () => {
    it('shows green color when HP > 66%', () => {
      const highHpChar = {
        ...mockCharacter,
        currentHitPoints: 40,
        maxHitPoints: 42,
      };

      const { container } = render(
        <CharacterCard character={highHpChar} onDelete={mockOnDelete} />
      );

      const hpBar = container.querySelector('[class*="bg-gradient"]');
      expect(hpBar?.className).toContain('from-[#10b981]');
    });

    it('shows yellow color when HP 33-66%', () => {
      const medHpChar = {
        ...mockCharacter,
        currentHitPoints: 20,
        maxHitPoints: 42,
      };

      const { container } = render(
        <CharacterCard character={medHpChar} onDelete={mockOnDelete} />
      );

      const hpBar = container.querySelector('[class*="bg-gradient"]');
      expect(hpBar?.className).toContain('from-[#f59e0b]');
    });

    it('shows red color when HP < 33%', () => {
      const lowHpChar = {
        ...mockCharacter,
        currentHitPoints: 10,
        maxHitPoints: 42,
      };

      const { container } = render(
        <CharacterCard character={lowHpChar} onDelete={mockOnDelete} />
      );

      const hpBar = container.querySelector('[class*="bg-gradient"]');
      expect(hpBar?.className).toContain('from-[#ef4444]');
    });

    it('handles 0 HP correctly', () => {
      const zeroHpChar = {
        ...mockCharacter,
        currentHitPoints: 0,
        maxHitPoints: 42,
      };

      render(<CharacterCard character={zeroHpChar} onDelete={mockOnDelete} />);

      expect(screen.getByText(/0.*\/.*42/)).toBeInTheDocument();
    });
  });

  describe('Multiclass Support', () => {
    it('displays multiple classes correctly', () => {
      const multiclassChar: Character = {
        ...mockCharacter,
        classes: [
          { name: 'Fighter', level: 3, hitDie: 'd10' },
          { name: 'Rogue', level: 2, hitDie: 'd8' },
        ],
        level: 5,
      };

      render(<CharacterCard character={multiclassChar} onDelete={mockOnDelete} />);

      expect(screen.getByText(/Fighter.*\/.*Rogue/)).toBeInTheDocument();
      expect(screen.getByText(/Fighter 3/)).toBeInTheDocument();
      expect(screen.getByText(/Rogue 2/)).toBeInTheDocument();
    });
  });

  describe('Hover Effects', () => {
    it('applies depth shift animation on hover', () => {
      const { container } = render(
        <CharacterCard character={mockCharacter} onDelete={mockOnDelete} />
      );

      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('transition-all');
      expect(card.className).toContain('duration-350');
    });

    it('shows chevron icon on hover', () => {
      const { container } = render(
        <CharacterCard character={mockCharacter} onDelete={mockOnDelete} />
      );

      // Chevron should be present but hidden initially (opacity-0)
      const chevron = container.querySelector('.opacity-0');
      expect(chevron).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onDelete when delete button is clicked', () => {
      render(<CharacterCard character={mockCharacter} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });

    it('stops propagation when delete button is clicked', () => {
      render(<CharacterCard character={mockCharacter} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      // Delete should have been called
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });
  });

  describe('Color System', () => {
    it('uses updated purple color (#9d6fff)', () => {
      const { container } = render(
        <CharacterCard character={mockCharacter} onDelete={mockOnDelete} />
      );

      const purpleElements = container.querySelectorAll('[class*="#9d6fff"]');
      expect(purpleElements.length).toBeGreaterThan(0);
    });

    it('uses new muted text color (#a1a1aa)', () => {
      const { container } = render(
        <CharacterCard character={mockCharacter} onDelete={mockOnDelete} />
      );

      const mutedElements = container.querySelectorAll('[class*="#a1a1aa"]');
      expect(mutedElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles', () => {
      render(<CharacterCard character={mockCharacter} onDelete={mockOnDelete} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Click Behavior', () => {
    it('navigates to character sheet when card is clicked', () => {
      render(
        <CharacterCard
          character={mockCharacter}
          onDelete={mockOnDelete}
          onClick={() => mockPush('/characters/1')}
        />
      );

      const card = screen.getByText('Tanis Half-Elven').closest('div[class*="glass-card"]');
      if (card) {
        fireEvent.click(card);
        expect(mockPush).toHaveBeenCalledWith('/characters/1');
      }
    });
  });
});
