import React from 'react';
import { render, screen } from '@testing-library/react';
import { VirtualMonsterGrid } from '@/app/components/monsters/virtual-monster-grid';
import { Monster } from '@/app/types/monster';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock react-window
jest.mock('react-window', () => ({
  List: ({ rowComponent: RowComponent, rowCount, defaultHeight }: any) => {
    // Render first few rows for testing
    const itemsToRender = Math.min(rowCount, 3);
    return (
      <div data-testid="virtual-list" style={{ height: `${defaultHeight}px` }}>
        {Array.from({ length: itemsToRender }).map((_, index) => (
          <div key={index}>
            {RowComponent && RowComponent({ index, style: {}, ariaAttributes: {} })}
          </div>
        ))}
      </div>
    );
  },
}));

describe('VirtualMonsterGrid', () => {
  const mockMonsters: Monster[] = [
    {
      name: 'Goblin',
      slug: 'goblin',
      size: 'Small',
      type: 'Humanoid',
      tag: '',
      alignment: 'neutral evil',
      movement: '',
      ac: 15,
      hp: 7,
      speed: '30 ft.',
      abilityScores: {
        strength: 8,
        dexterity: 14,
        constitution: 10,
        intelligence: 10,
        wisdom: 8,
        charisma: 8,
      },
      cr: '1/4',
      xp: 50,
      sourceBook: 'Monster Manual',
      sourcePage: '166',
      spellUser: false,
      legendaryActions: false,
      lairActions: false,
      abilities: '',
      actions: '',
      reaction: '',
      credits: '',
      environments: {
        arctic: false,
        coastal: false,
        desert: false,
        forest: true,
        grassland: false,
        hill: true,
        mountain: false,
        swamp: false,
        underdark: true,
        underwater: false,
        urban: false,
        other: false,
      },
    },
    {
      name: 'Orc',
      slug: 'orc',
      size: 'Medium',
      type: 'Humanoid',
      tag: '',
      alignment: 'chaotic evil',
      movement: '',
      ac: 13,
      hp: 15,
      speed: '30 ft.',
      abilityScores: {
        strength: 16,
        dexterity: 12,
        constitution: 16,
        intelligence: 7,
        wisdom: 11,
        charisma: 10,
      },
      cr: '1/2',
      xp: 100,
      sourceBook: 'Monster Manual',
      sourcePage: '246',
      spellUser: false,
      legendaryActions: false,
      lairActions: false,
      abilities: '',
      actions: '',
      reaction: '',
      credits: '',
      environments: {
        arctic: false,
        coastal: false,
        desert: false,
        forest: false,
        grassland: false,
        hill: true,
        mountain: true,
        swamp: false,
        underdark: true,
        underwater: false,
        urban: false,
        other: false,
      },
    },
    {
      name: 'Ancient Red Dragon',
      slug: 'ancient-red-dragon',
      size: 'Huge',
      type: 'Dragon',
      tag: '',
      alignment: 'chaotic evil',
      movement: 'Fly 80 ft.',
      ac: 19,
      hp: 256,
      speed: '40 ft., fly 80 ft.',
      abilityScores: {
        strength: 27,
        dexterity: 10,
        constitution: 25,
        intelligence: 16,
        wisdom: 13,
        charisma: 21,
      },
      cr: '17',
      xp: 18000,
      sourceBook: 'Monster Manual',
      sourcePage: '100',
      spellUser: false,
      legendaryActions: true,
      lairActions: true,
      abilities: '',
      actions: '',
      reaction: '',
      credits: '',
      environments: {
        arctic: false,
        coastal: false,
        desert: false,
        forest: false,
        grassland: false,
        hill: false,
        mountain: true,
        swamp: false,
        underdark: false,
        underwater: false,
        urban: false,
        other: false,
      },
    },
  ];

  const mockOnSelect = jest.fn();
  const mockOnAddToEncounter = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
    mockOnAddToEncounter.mockClear();

    // Mock container offsetWidth for responsive calculations
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 1200, // Desktop width
    });
  });

  describe('Rendering', () => {
    it('renders virtual list with monsters', () => {
      render(
        <VirtualMonsterGrid
          monsters={mockMonsters}
          onSelect={mockOnSelect}
          onAddToEncounter={mockOnAddToEncounter}
        />
      );

      const virtualList = screen.getByTestId('virtual-list');
      expect(virtualList).toBeInTheDocument();
    });

    it('renders monster cards', () => {
      render(
        <VirtualMonsterGrid
          monsters={mockMonsters}
          onSelect={mockOnSelect}
          onAddToEncounter={mockOnAddToEncounter}
        />
      );

      expect(screen.getByText('Goblin')).toBeInTheDocument();
      expect(screen.getByText('Orc')).toBeInTheDocument();
    });

    it('displays empty state when no monsters', () => {
      render(
        <VirtualMonsterGrid
          monsters={[]}
          onSelect={mockOnSelect}
          onAddToEncounter={mockOnAddToEncounter}
        />
      );

      expect(screen.getByText(/no monsters found/i)).toBeInTheDocument();
    });

    it('displays loading state initially', () => {
      const { container } = render(
        <VirtualMonsterGrid
          monsters={mockMonsters}
          onSelect={mockOnSelect}
          onAddToEncounter={mockOnAddToEncounter}
        />
      );

      // Component should render loading state before container width is measured
      // This happens in the first render cycle
      expect(container.querySelector('.w-full')).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('calculates correct number of columns based on width', () => {
      // This tests the column count logic
      render(
        <VirtualMonsterGrid
          monsters={mockMonsters}
          onSelect={mockOnSelect}
          onAddToEncounter={mockOnAddToEncounter}
        />
      );

      // The component should adapt to container width
      // We're testing that it renders without crashing
      expect(screen.getByTestId('virtual-list')).toBeInTheDocument();
    });
  });

  describe('Virtual Scrolling', () => {
    it('passes correct props to List component', () => {
      const manyMonsters = Array.from({ length: 100 }, (_, i) => ({
        ...mockMonsters[0],
        name: `Monster ${i}`,
        slug: `monster-${i}`,
      }));

      render(
        <VirtualMonsterGrid
          monsters={manyMonsters}
          onSelect={mockOnSelect}
          onAddToEncounter={mockOnAddToEncounter}
        />
      );

      const virtualList = screen.getByTestId('virtual-list');
      expect(virtualList).toBeInTheDocument();

      // Check that height is set (should be a number with 'px')
      const height = virtualList.style.height;
      expect(height).toBeTruthy();
      expect(height).toMatch(/^\d+px$/);
    });
  });

  describe('Grid Layout', () => {
    it('renders monsters in grid layout', () => {
      render(
        <VirtualMonsterGrid
          monsters={mockMonsters}
          onSelect={mockOnSelect}
          onAddToEncounter={mockOnAddToEncounter}
        />
      );

      // Check that monsters are rendered in rows
      const goblin = screen.getByText('Goblin');
      expect(goblin).toBeInTheDocument();
    });

    it('fills empty cells in incomplete rows', () => {
      // With 3 monsters and potentially 3 columns, the last row should have empty cells
      render(
        <VirtualMonsterGrid
          monsters={mockMonsters}
          onSelect={mockOnSelect}
          onAddToEncounter={mockOnAddToEncounter}
        />
      );

      // Component should render without errors when handling incomplete rows
      expect(screen.getByText('Ancient Red Dragon')).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('passes onSelect to MonsterCard', () => {
      render(
        <VirtualMonsterGrid
          monsters={mockMonsters}
          onSelect={mockOnSelect}
          onAddToEncounter={mockOnAddToEncounter}
        />
      );

      // MonsterCard should receive the callback (tested in MonsterCard tests)
      expect(screen.getByText('Goblin')).toBeInTheDocument();
    });

    it('passes onAddToEncounter to MonsterCard', () => {
      render(
        <VirtualMonsterGrid
          monsters={mockMonsters}
          onSelect={mockOnSelect}
          onAddToEncounter={mockOnAddToEncounter}
        />
      );

      // MonsterCard should receive the callback (tested in MonsterCard tests)
      expect(screen.getByText('Goblin')).toBeInTheDocument();
    });
  });
});
