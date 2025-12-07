"use client";

import { Character, getTotalLevel, calculateModifier, formatModifier } from '@/app/types/character';
import {
  ScrollText,
  Shield,
  Zap,
  Gauge,
  Heart,
  ChevronRight,
  X,
  TrendingUp,
} from 'lucide-react';

interface CharacterCardProps {
  character: Character;
  onDelete: (id: string) => void;
  onClick?: () => void;
}

export function CharacterCard({ character, onDelete, onClick }: CharacterCardProps) {
  const level = getTotalLevel(character.classes);
  const hpPercentage = (character.currentHitPoints / character.maxHitPoints) * 100;

  const getHpGradient = () => {
    if (hpPercentage > 66) {
      return 'from-[#10b981] to-[#059669]'; // Green
    }
    if (hpPercentage > 33) {
      return 'from-[#f59e0b] to-[#d97706]'; // Yellow/Orange
    }
    return 'from-[#ef4444] to-[#dc2626]'; // Red
  };

  return (
    <div
      className="glass-card rounded-xl p-6 cursor-pointer group transition-all duration-350 hover:border-[#9d6fff]/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:translate-y-[1px]"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <ScrollText size={24} className="text-[#9d6fff] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-2xl text-[#f5f5f5] [text-shadow:0_0_16px_rgba(157,111,255,0.4),0_2px_6px_rgba(0,0,0,0.7)] line-clamp-1">
              {character.name}
            </h3>
            <p className="text-sm text-[#a1a1aa] mt-1">
              {character.race} • {character.classes.map((c) => c.name).join('/')}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(character.id);
          }}
          aria-label="Delete character"
          className="text-[#a1a1aa] hover:text-red-400 transition-colors p-1"
        >
          <X size={20} />
        </button>
      </div>

      {/* Level Badge */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#9d6fff]/20 text-[#9d6fff] border border-[#9d6fff]/30">
          <TrendingUp size={14} />
          <span className="text-xs font-medium">Level {level}</span>
        </div>
      </div>

      {/* HP Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-[#ef4444]" />
            <span className="text-[#a1a1aa]">Hit Points</span>
          </div>
          <span className="text-[#f5f5f5] font-medium">
            {character.currentHitPoints}/{character.maxHitPoints}
          </span>
        </div>
        <div className="h-2.5 bg-black/40 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getHpGradient()} transition-all duration-350`}
            style={{ width: `${Math.max(0, Math.min(100, hpPercentage))}%` }}
          />
        </div>
      </div>

      <div className="border-t border-[#1a1a1f] pt-4 mb-4" />

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* AC */}
        <div className="flex flex-col items-center gap-1">
          <Shield size={16} className="text-[#9d6fff]" />
          <div className="text-xs text-[#a1a1aa]">AC</div>
          <div className="text-lg font-bold text-[#f5f5f5]">
            {character.armorClass}
          </div>
        </div>

        {/* Initiative */}
        <div className="flex flex-col items-center gap-1">
          <Zap size={16} className="text-[#9d6fff]" />
          <div className="text-xs text-[#a1a1aa]">Initiative</div>
          <div className="text-lg font-bold text-[#f5f5f5]">
            {formatModifier(calculateModifier(character.abilityScores.dexterity))}
          </div>
        </div>

        {/* Speed */}
        <div className="flex flex-col items-center gap-1">
          <Gauge size={16} className="text-[#9d6fff]" />
          <div className="text-xs text-[#a1a1aa]">Speed</div>
          <div className="text-lg font-bold text-[#f5f5f5]">
            {character.speed}
          </div>
        </div>
      </div>

      {/* Class Details */}
      <div className="text-xs text-[#a1a1aa] mb-4">
        {character.classes.map((c, idx) => (
          <span key={idx}>
            {c.name} {c.level}
            {idx < character.classes.length - 1 ? ' • ' : ''}
          </span>
        ))}
      </div>

      {/* Footer with Chevron */}
      <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1f]">
        <span className="text-sm text-[#a1a1aa]">
          Background: <span className="font-medium text-[#f5f5f5]">{character.background}</span>
        </span>
        <ChevronRight
          className="w-5 h-5 text-[#9d6fff] opacity-0 group-hover:opacity-100 transition-opacity duration-350"
        />
      </div>
    </div>
  );
}
