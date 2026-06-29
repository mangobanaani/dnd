"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Monster } from '@/app/types/monster';
import { useMonsterSearch } from '@/app/hooks/useMonsterSearch';
import { useMonsterFavorites } from '@/app/hooks/useMonsterFavorites';
import { useMonsterHistory } from '@/app/hooks/useMonsterHistory';
import { MonsterDetail } from '@/app/components/monsters/monster-detail';
import { VirtualMonsterGrid } from '@/app/components/monsters/virtual-monster-grid';
import { MonsterCardSkeleton } from '@/app/components/monsters/monster-card-skeleton';
import { Modal } from '@/app/components/ui/modal';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Star } from 'lucide-react';

export default function MonstersPage() {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);

  // Supabase-backed favorites
  const {
    favoriteNames,
    loading: favoritesLoading,
    isFavorite,
    toggleFavorite,
  } = useMonsterFavorites();

  // View history — records are fire-and-forget; recentHistory surfaces the sidebar affordance
  const { recentHistory, recordView } = useMonsterHistory();

  const {
    monsters: filteredMonsters,
    filters,
    updateFilter,
    resetFilters,
    stats,
  } = useMonsterSearch(monsters, favoriteNames);

  // Quick name-lookup map so "recently viewed" entries can open the detail panel
  const monsterByName = useMemo(
    () => new Map(monsters.map((m) => [m.name, m])),
    [monsters]
  );

  useEffect(() => {
    // Load monster data
    fetch('/data/monsters.json')
      .then((res) => res.json())
      .then((data: Monster[]) => {
        setMonsters(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleSelectMonster = useCallback(
    (monster: Monster) => {
      setSelectedMonster(monster);
      recordView(monster.name);
    },
    [recordView]
  );

  const handleSelectFromHistory = useCallback(
    (name: string) => {
      const monster = monsterByName.get(name);
      if (monster) handleSelectMonster(monster);
    },
    [monsterByName, handleSelectMonster]
  );

  const sizes = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
  const types = [
    'Aberration',
    'Beast',
    'Celestial',
    'Construct',
    'Dragon',
    'Elemental',
    'Fey',
    'Fiend',
    'Giant',
    'Humanoid',
    'Monstrosity',
    'Ooze',
    'Plant',
    'Undead',
  ];
  const environments = [
    'arctic',
    'coastal',
    'desert',
    'forest',
    'grassland',
    'hill',
    'mountain',
    'swamp',
    'underdark',
    'underwater',
    'urban',
    'other',
  ];

  const toggleArrayFilter = (
    key: 'size' | 'type' | 'environment',
    value: string
  ) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#fafafa] mb-2">
            Monster Compendium
          </h1>
          <p className="text-[#a1a1aa]">
            Browse {stats.total.toLocaleString()} creatures from D&D 5e
          </p>
        </div>

        {/* Stats Bar */}
        <div className="glass rounded-lg p-4 mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <div className="text-2xl font-bold text-[#8b5cf6]">
              {stats.filtered.toLocaleString()}
            </div>
            <div className="text-xs text-[#a1a1aa]">Total Results</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#fbbf24]">
              {stats.legendary}
            </div>
            <div className="text-xs text-[#a1a1aa]">Legendary</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#8b5cf6]">
              {stats.spellcasters}
            </div>
            <div className="text-xs text-[#a1a1aa]">Spellcasters</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#ef4444]">
              {stats.withLairActions}
            </div>
            <div className="text-xs text-[#a1a1aa]">Lair Actions</div>
          </div>
          <div className="col-span-2 md:col-span-1 flex items-center justify-end">
            <Button variant="secondary" size="sm" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-lg p-4 sticky top-4 space-y-6">
              <h2 className="text-xl font-bold text-[#fafafa] mb-4">Filters</h2>

              {/* Name Search */}
              <div>
                <label className="block text-sm font-medium text-[#fafafa] mb-2">
                  Name
                </label>
                <Input
                  type="text"
                  placeholder="Search monsters..."
                  value={filters.name || ''}
                  onChange={(e) => updateFilter('name', e.target.value)}
                />
              </div>

              {/* CR Range */}
              <div>
                <label className="block text-sm font-medium text-[#fafafa] mb-2">
                  Challenge Rating
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    min={0}
                    max={30}
                    value={filters.crMin ?? 0}
                    onChange={(e) =>
                      updateFilter('crMin', parseFloat(e.target.value) || 0)
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    min={0}
                    max={30}
                    value={filters.crMax ?? 30}
                    onChange={(e) =>
                      updateFilter('crMax', parseFloat(e.target.value) || 30)
                    }
                  />
                </div>
              </div>

              {/* Size Filter */}
              <div>
                <label className="block text-sm font-medium text-[#fafafa] mb-2">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleArrayFilter('size', size)}
                      className={`text-xs px-3 py-1 rounded transition-all ${
                        filters.size?.includes(size)
                          ? 'bg-[#8b5cf6] text-white'
                          : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-[#fafafa] mb-2">
                  Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {types.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleArrayFilter('type', type)}
                      className={`text-xs px-3 py-1 rounded transition-all ${
                        filters.type?.includes(type)
                          ? 'bg-[#8b5cf6] text-white'
                          : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Environment Filter */}
              <div>
                <label className="block text-sm font-medium text-[#fafafa] mb-2">
                  Environment
                </label>
                <div className="flex flex-wrap gap-2">
                  {environments.map((env) => (
                    <button
                      key={env}
                      onClick={() => toggleArrayFilter('environment', env)}
                      className={`text-xs px-3 py-1 rounded capitalize transition-all ${
                        filters.environment?.includes(env)
                          ? 'bg-[#10b981] text-white'
                          : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Traits */}
              <div>
                <label className="block text-sm font-medium text-[#fafafa] mb-2">
                  Special Traits
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() =>
                      updateFilter(
                        'legendary',
                        filters.legendary === true ? undefined : true
                      )
                    }
                    className={`w-full text-sm px-3 py-2 rounded transition-all text-left ${
                      filters.legendary === true
                        ? 'bg-[#fbbf24] text-[#0a0a0f] font-medium'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                    }`}
                  >
                    ⚔️ Legendary Actions
                  </button>
                  <button
                    onClick={() =>
                      updateFilter(
                        'spellcaster',
                        filters.spellcaster === true ? undefined : true
                      )
                    }
                    className={`w-full text-sm px-3 py-2 rounded transition-all text-left ${
                      filters.spellcaster === true
                        ? 'bg-[#8b5cf6] text-white font-medium'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                    }`}
                  >
                    ✨ Spellcaster
                  </button>

                  {/* Favorites-only toggle */}
                  <button
                    onClick={() =>
                      updateFilter(
                        'favoriteOnly',
                        filters.favoriteOnly === true ? undefined : true
                      )
                    }
                    disabled={favoritesLoading}
                    className={`w-full text-sm px-3 py-2 rounded transition-all text-left flex items-center gap-2 ${
                      filters.favoriteOnly === true
                        ? 'bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/50 font-medium'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Star
                      size={13}
                      fill={filters.favoriteOnly === true ? 'currentColor' : 'none'}
                      strokeWidth={2}
                    />
                    Favorites Only
                    {!favoritesLoading && favoriteNames.length > 0 && (
                      <span className="ml-auto text-xs opacity-70">
                        {favoriteNames.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Recently Viewed */}
              {recentHistory.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-[#fafafa] mb-2">
                    Recently Viewed
                  </label>
                  <div className="space-y-1">
                    {recentHistory.map((entry) => (
                      <button
                        key={entry.monsterName}
                        onClick={() => handleSelectFromHistory(entry.monsterName)}
                        className="w-full text-left text-xs px-3 py-1.5 rounded bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46] hover:text-[#fafafa] transition-colors truncate"
                        title={entry.monsterName}
                      >
                        {entry.monsterName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Monster Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <MonsterCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredMonsters.length === 0 ? (
              <div className="glass rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">🐉</div>
                <h3 className="text-xl font-semibold text-[#fafafa] mb-2">
                  No monsters found
                </h3>
                <p className="text-[#a1a1aa] mb-4">
                  Try adjusting your filters
                </p>
                <Button variant="primary" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              <VirtualMonsterGrid
                monsters={filteredMonsters}
                onSelect={handleSelectMonster}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />
            )}
          </div>
        </div>

        {/* Monster Detail Modal */}
        <Modal
          isOpen={!!selectedMonster}
          onClose={() => setSelectedMonster(null)}
          size="xl"
        >
          {selectedMonster && (
            <MonsterDetail
              monster={selectedMonster}
              isFavorite={isFavorite(selectedMonster.name)}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </Modal>
      </div>
    </div>
  );
}
