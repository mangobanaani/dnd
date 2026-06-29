"use client";

import { Monster, crToXP } from '@/app/types/monster';
import { Button } from '@/app/components/ui/button';
import { Star } from 'lucide-react';

interface MonsterDetailProps {
  monster: Monster;
  onAddToEncounter?: (monster: Monster) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (monster: Monster) => void;
}

export function MonsterDetail({
  monster,
  onAddToEncounter,
  isFavorite = false,
  onToggleFavorite,
}: MonsterDetailProps) {
  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      'Aberration': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Beast': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Celestial': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'Construct': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      'Dragon': 'bg-red-500/20 text-red-300 border-red-500/30',
      'Elemental': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Fey': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'Fiend': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'Giant': 'bg-stone-500/20 text-stone-300 border-stone-500/30',
      'Humanoid': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      'Monstrosity': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      'Ooze': 'bg-lime-500/20 text-lime-300 border-lime-500/30',
      'Plant': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'Undead': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    };

    const baseType = type.split('(')[0].trim();
    return typeColors[baseType] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const activeEnvironments = Object.entries(monster.environments)
    .filter(([_, active]) => active)
    .map(([env]) => env);

  const xpReward = crToXP(monster.cr);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-[#fafafa]">
                {monster.name}
              </h1>
              {/* Favorite toggle */}
              {onToggleFavorite && (
                <button
                  aria-label={
                    isFavorite
                      ? `Remove ${monster.name} from favorites`
                      : `Add ${monster.name} to favorites`
                  }
                  aria-pressed={isFavorite}
                  onClick={() => onToggleFavorite(monster)}
                  className={`p-2 rounded-lg border transition-all flex-shrink-0 ${
                    isFavorite
                      ? 'border-[#fbbf24]/50 bg-[#fbbf24]/10 text-[#fbbf24] hover:bg-[#fbbf24]/20'
                      : 'border-[#27272a] bg-transparent text-[#52525b] hover:border-[#fbbf24]/30 hover:text-[#fbbf24]'
                  }`}
                >
                  <Star
                    size={18}
                    fill={isFavorite ? 'currentColor' : 'none'}
                    strokeWidth={2}
                  />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm px-3 py-1 rounded border ${getTypeColor(monster.type)}`}>
                {monster.type}
              </span>
              <span className="text-sm text-[#a1a1aa]">
                {monster.size}
              </span>
              {monster.tag && (
                <span className="text-sm text-[#a1a1aa] italic">
                  • {monster.tag}
                </span>
              )}
            </div>
          </div>

          {onAddToEncounter && (
            <Button
              variant="primary"
              size="lg"
              onClick={() => onAddToEncounter(monster)}
            >
              + Add to Encounter
            </Button>
          )}
        </div>

        {/* Special Traits Badges */}
        {(monster.legendaryActions || monster.lairActions || monster.spellUser) && (
          <div className="flex gap-2 flex-wrap">
            {monster.legendaryActions && (
              <span className="text-sm px-3 py-1 rounded bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/30 font-medium">
                ⚔️ Legendary Actions
              </span>
            )}
            {monster.lairActions && (
              <span className="text-sm px-3 py-1 rounded bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30 font-medium">
                🏰 Lair Actions
              </span>
            )}
            {monster.spellUser && (
              <span className="text-sm px-3 py-1 rounded bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30 font-medium">
                ✨ Spellcaster
              </span>
            )}
          </div>
        )}
      </div>

      <hr className="border-[#27272a]" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="glass rounded-lg p-4">
          <div className="text-xs text-[#a1a1aa] mb-1">Challenge Rating</div>
          <div className="text-2xl font-bold text-[#8b5cf6]">{monster.cr}</div>
          <div className="text-xs text-[#a1a1aa] mt-1">
            {xpReward.toLocaleString()} XP
          </div>
        </div>

        <div className="glass rounded-lg p-4">
          <div className="text-xs text-[#a1a1aa] mb-1">Alignment</div>
          <div className="text-lg font-semibold text-[#fafafa]">
            {monster.alignment || 'Unaligned'}
          </div>
        </div>

        {monster.movement && (
          <div className="glass rounded-lg p-4">
            <div className="text-xs text-[#a1a1aa] mb-1">Movement</div>
            <div className="text-lg font-semibold text-[#fafafa] capitalize">
              {monster.movement}
            </div>
          </div>
        )}
      </div>

      {/* Abilities Section */}
      {monster.abilities && (
        <div className="glass rounded-lg p-4">
          <h3 className="text-lg font-bold text-[#fafafa] mb-3 flex items-center gap-2">
            <span className="text-[#8b5cf6]">⚡</span>
            Special Abilities
          </h3>
          <div className="text-[#d4d4d8] whitespace-pre-wrap">
            {monster.abilities}
          </div>
        </div>
      )}

      {/* Actions Section */}
      {monster.actions && (
        <div className="glass rounded-lg p-4">
          <h3 className="text-lg font-bold text-[#fafafa] mb-3 flex items-center gap-2">
            <span className="text-[#ef4444]">⚔️</span>
            Actions
          </h3>
          <div className="text-[#d4d4d8] whitespace-pre-wrap">
            {monster.actions}
          </div>
        </div>
      )}

      {/* Reactions Section */}
      {monster.reaction && (
        <div className="glass rounded-lg p-4">
          <h3 className="text-lg font-bold text-[#fafafa] mb-3 flex items-center gap-2">
            <span className="text-[#10b981]">↩️</span>
            Reactions
          </h3>
          <div className="text-[#d4d4d8] whitespace-pre-wrap">
            {monster.reaction}
          </div>
        </div>
      )}

      {/* Environments Section */}
      {activeEnvironments.length > 0 && (
        <div className="glass rounded-lg p-4">
          <h3 className="text-lg font-bold text-[#fafafa] mb-3 flex items-center gap-2">
            <span className="text-[#10b981]">🌍</span>
            Environments
          </h3>
          <div className="flex gap-2 flex-wrap">
            {activeEnvironments.map((env) => (
              <span
                key={env}
                className="text-sm px-3 py-1 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 capitalize"
              >
                {env}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Source Information */}
      <div className="glass rounded-lg p-4">
        <h3 className="text-lg font-bold text-[#fafafa] mb-3 flex items-center gap-2">
          <span className="text-[#a1a1aa]">📚</span>
          Source
        </h3>
        <div className="space-y-2">
          <div>
            <span className="text-[#a1a1aa]">Book:</span>
            <span className="text-[#fafafa] ml-2 font-medium">
              {monster.sourceBook}
            </span>
            {monster.sourcePage && (
              <span className="text-[#a1a1aa] ml-1">
                (Page {monster.sourcePage})
              </span>
            )}
          </div>
          {monster.credits && (
            <div>
              <span className="text-[#a1a1aa]">Credits:</span>
              <a
                href={monster.credits}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8b5cf6] hover:text-[#7c3aed] ml-2 text-sm underline"
              >
                View Source
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="glass-subtle rounded-lg p-4 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20">
        <div className="text-xs text-[#a1a1aa] mb-2">Quick Reference</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-[#a1a1aa]">Size:</span>
            <span className="text-[#fafafa] ml-2">{monster.size}</span>
          </div>
          <div>
            <span className="text-[#a1a1aa]">Type:</span>
            <span className="text-[#fafafa] ml-2">{monster.type.split('(')[0].trim()}</span>
          </div>
          <div>
            <span className="text-[#a1a1aa]">CR:</span>
            <span className="text-[#fafafa] ml-2">{monster.cr}</span>
          </div>
          <div>
            <span className="text-[#a1a1aa]">XP:</span>
            <span className="text-[#fafafa] ml-2">{xpReward.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
