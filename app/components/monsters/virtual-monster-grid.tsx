"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { List } from 'react-window';
import { Monster } from '@/app/types/monster';
import { MonsterCard } from './monster-card';

interface VirtualMonsterGridProps {
  monsters: Monster[];
  onSelect?: (monster: Monster) => void;
  onAddToEncounter?: (monster: Monster) => void;
  isFavorite?: (name: string) => boolean;
  onToggleFavorite?: (monster: Monster) => void;
}

export function VirtualMonsterGrid({
  monsters,
  onSelect,
  onAddToEncounter,
  isFavorite,
  onToggleFavorite,
}: VirtualMonsterGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Responsive column calculation
  const columnCount = useMemo(() => {
    if (containerWidth < 768) return 1; // Mobile: 1 column
    if (containerWidth < 1024) return 2; // Tablet: 2 columns
    return 3; // Desktop: 3 columns
  }, [containerWidth]);

  // Grid dimensions
  const columnWidth = useMemo(() => {
    const gap = 24; // Gap between columns
    const totalGap = (columnCount - 1) * gap;
    return Math.floor((containerWidth - totalGap) / columnCount);
  }, [containerWidth, columnCount]);

  const rowHeight = 320; // Fixed row height for consistent scrolling
  const rowCount = Math.ceil(monsters.length / columnCount);

  // Measure container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Calculate grid height (max 800px or window height - 400px for header/footer)
  const gridHeight = useMemo(() => {
    const maxHeight = 800;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const availableHeight = windowHeight - 400; // Reserve space for header/footer
    return Math.min(maxHeight, availableHeight, rowCount * rowHeight);
  }, [rowCount, rowHeight]);

  // Row renderer - each row contains multiple columns
  // Wrapped in useCallback so react-window does not remount all rows on each parent render
  const Row = useCallback(({ index, style, ariaAttributes }: any) => {
    const startIndex = index * columnCount;
    const rowMonsters = monsters.slice(startIndex, startIndex + columnCount);

    return (
      <div style={style} className="flex gap-6 px-3" {...ariaAttributes}>
        {rowMonsters.map((monster, colIndex) => (
          <div
            key={`${monster.name}-${monster.sourceBook}-${startIndex + colIndex}`}
            style={{ width: columnWidth, flexShrink: 0 }}
          >
            <MonsterCard
              monster={monster}
              onSelect={onSelect}
              onAddToEncounter={onAddToEncounter}
              isFavorite={isFavorite ? isFavorite(monster.name) : false}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        ))}
        {/* Fill empty cells to maintain grid structure */}
        {rowMonsters.length < columnCount &&
          Array.from({ length: columnCount - rowMonsters.length }).map((_, i) => (
            <div key={`empty-${i}`} style={{ width: columnWidth, flexShrink: 0 }} />
          ))}
      </div>
    );
  }, [monsters, columnCount, columnWidth, onSelect, onAddToEncounter, isFavorite, onToggleFavorite]);

  // Show message if no monsters
  if (monsters.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[#a1a1aa]">
        No monsters found. Try adjusting your filters.
      </div>
    );
  }

  // Show loading state while measuring container
  if (containerWidth === 0) {
    return (
      <div ref={containerRef} className="w-full">
        <div className="flex items-center justify-center h-64 text-[#a1a1aa]">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      <List
        defaultHeight={gridHeight}
        rowCount={rowCount}
        rowHeight={rowHeight}
        rowComponent={Row}
        rowProps={{}}
        className="scrollbar-thin scrollbar-thumb-[#27272a] scrollbar-track-transparent"
      >
        {null}
      </List>
    </div>
  );
}
