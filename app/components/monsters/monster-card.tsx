"use client";

import { Monster } from '@/app/types/monster';
import { Button } from '@/app/components/ui/button';
import { Star } from 'lucide-react';

interface MonsterCardProps {
  monster: Monster;
  onSelect?: (monster: Monster) => void;
  onAddToEncounter?: (monster: Monster) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (monster: Monster) => void;
}

export function MonsterCard({
  monster,
  onSelect,
  onAddToEncounter,
  isFavorite = false,
  onToggleFavorite,
}: MonsterCardProps) {
  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      'Aberration': 'bg-purple-500/20 text-purple-300',
      'Beast': 'bg-green-500/20 text-green-300',
      'Celestial': 'bg-yellow-500/20 text-yellow-300',
      'Construct': 'bg-gray-500/20 text-gray-300',
      'Dragon': 'bg-red-500/20 text-red-300',
      'Elemental': 'bg-blue-500/20 text-blue-300',
      'Fey': 'bg-pink-500/20 text-pink-300',
      'Fiend': 'bg-orange-500/20 text-orange-300',
      'Giant': 'bg-stone-500/20 text-stone-300',
      'Humanoid': 'bg-slate-500/20 text-slate-300',
      'Monstrosity': 'bg-violet-500/20 text-violet-300',
      'Ooze': 'bg-lime-500/20 text-lime-300',
      'Plant': 'bg-emerald-500/20 text-emerald-300',
      'Undead': 'bg-indigo-500/20 text-indigo-300',
    };

    const baseType = type.split('(')[0].trim();
    return typeColors[baseType] || 'bg-gray-500/20 text-gray-300';
  };

  const getCRColor = (cr: string) => {
    const crNum = parseFloat(cr);
    if (isNaN(crNum)) return 'text-gray-400';
    if (crNum < 1) return 'text-green-400';
    if (crNum < 5) return 'text-blue-400';
    if (crNum < 10) return 'text-yellow-400';
    if (crNum < 15) return 'text-orange-400';
    if (crNum < 20) return 'text-red-400';
    return 'text-purple-400';
  };

  const activeEnvironments = Object.entries(monster.environments)
    .filter(([_, active]) => active)
    .map(([env]) => env)
    .slice(0, 3); // Show only first 3

  return (
    <div
      className="glass rounded-lg p-4 hover:bg-[#1a1a22]/80 transition-all cursor-pointer border border-[#27272a] hover:border-[#8b5cf6]/50"
      onClick={() => onSelect?.(monster)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#fafafa] mb-1">
            {monster.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded ${getTypeColor(monster.type)}`}>
              {monster.type}
            </span>
            <span className="text-xs text-[#a1a1aa]">
              {monster.size}
            </span>
            {monster.tag && (
              <span className="text-xs text-[#a1a1aa] italic">
                {monster.tag}
              </span>
            )}
          </div>
        </div>

        {/* Favorite toggle */}
        {onToggleFavorite && (
          <button
            aria-label={
              isFavorite
                ? `Remove ${monster.name} from favorites`
                : `Add ${monster.name} to favorites`
            }
            aria-pressed={isFavorite}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(monster);
            }}
            className={`p-1.5 rounded transition-colors flex-shrink-0 ${
              isFavorite
                ? 'text-[#fbbf24] hover:text-[#f59e0b]'
                : 'text-[#52525b] hover:text-[#fbbf24]'
            }`}
          >
            <Star
              size={15}
              fill={isFavorite ? 'currentColor' : 'none'}
              strokeWidth={2}
            />
          </button>
        )}

        <div className="text-right ml-2">
          <div className="text-xs text-[#a1a1aa] mb-1">CR</div>
          <div className={`text-xl font-bold ${getCRColor(monster.cr)}`}>
            {monster.cr}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div>
          <span className="text-[#a1a1aa]">Alignment:</span>
          <span className="text-[#fafafa] ml-2">{monster.alignment || 'Unaligned'}</span>
        </div>
        {monster.movement && (
          <div>
            <span className="text-[#a1a1aa]">Movement:</span>
            <span className="text-[#fafafa] ml-2">{monster.movement}</span>
          </div>
        )}
      </div>

      {/* Special Traits */}
      {(monster.legendaryActions || monster.lairActions || monster.spellUser) && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {monster.legendaryActions && (
            <span className="text-xs px-2 py-1 rounded bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/30">
              ⚔️ Legendary
            </span>
          )}
          {monster.lairActions && (
            <span className="text-xs px-2 py-1 rounded bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30">
              🏰 Lair
            </span>
          )}
          {monster.spellUser && (
            <span className="text-xs px-2 py-1 rounded bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30">
              ✨ Spellcaster
            </span>
          )}
        </div>
      )}

      {/* Environments */}
      {activeEnvironments.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-[#a1a1aa] mb-1">Environments:</div>
          <div className="flex gap-1 flex-wrap">
            {activeEnvironments.map((env) => (
              <span
                key={env}
                className="text-xs px-2 py-0.5 rounded bg-[#27272a] text-[#a1a1aa] capitalize"
              >
                {env}
              </span>
            ))}
            {Object.values(monster.environments).filter(Boolean).length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded bg-[#27272a] text-[#a1a1aa]">
                +{Object.values(monster.environments).filter(Boolean).length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Source */}
      <div className="flex items-center justify-between pt-3 border-t border-[#27272a]">
        <span className="text-xs text-[#a1a1aa]">
          {monster.sourceBook} {monster.sourcePage && `p.${monster.sourcePage}`}
        </span>
        {onAddToEncounter && (
          <Button
            size="sm"
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              onAddToEncounter(monster);
            }}
          >
            + Add
          </Button>
        )}
      </div>
    </div>
  );
}
