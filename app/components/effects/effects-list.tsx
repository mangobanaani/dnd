/**
 * EffectsList Component
 * Displays a list of effects with optional filtering, sorting, and grouping
 */

'use client';

import React from 'react';
import { Effect } from '@/app/types/effects';
import { categorizeEffect, groupEffectsByCategory } from '@/app/lib/utils/effect-categorization';
import { EffectBadge } from './effect-badge';
import './effects-list.css';

export interface EffectsListProps {
  effects: Effect[] | undefined;
  size?: 'compact' | 'default';
  removable?: boolean;
  groupByType?: boolean;
  showConcentrationOnly?: boolean;
  sortBy?: 'duration' | 'name' | 'none';
  filter?: (effect: Effect) => boolean;
  emptyMessage?: string;
  onEffectClick?: (effect: Effect) => void;
  onRemoveEffect?: (effect: Effect) => void;
}

/**
 * Get duration for sorting (null for permanent or time-based)
 */
function getDurationForSorting(effect: Effect): number {
  if (effect.durationType === 'rounds' && effect.roundsRemaining !== undefined) {
    return effect.roundsRemaining;
  }
  return Infinity; // Permanent/time-based effects go to the end
}

/**
 * Sort effects based on sortBy option
 */
function sortEffects(effects: Effect[], sortBy: 'duration' | 'name' | 'none'): Effect[] {
  if (sortBy === 'none') {
    return effects;
  }

  const sorted = [...effects];

  if (sortBy === 'duration') {
    sorted.sort((a, b) => getDurationForSorting(a) - getDurationForSorting(b));
  } else if (sortBy === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  }

  return sorted;
}

export function EffectsList({
  effects,
  size = 'default',
  removable = false,
  groupByType = false,
  showConcentrationOnly = false,
  sortBy = 'none',
  filter,
  emptyMessage = 'No active effects',
  onEffectClick,
  onRemoveEffect,
}: EffectsListProps) {
  // Handle undefined or empty effects
  if (!effects || effects.length === 0) {
    return (
      <div className="effects-list-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  // Apply filters
  let filteredEffects = effects;

  if (showConcentrationOnly) {
    filteredEffects = filteredEffects.filter(
      (e) => e.mechanics.requiresConcentration === true
    );
  }

  if (filter) {
    filteredEffects = filteredEffects.filter(filter);
  }

  // Check if filtered list is empty
  if (filteredEffects.length === 0) {
    return (
      <div className="effects-list-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  // Apply sorting
  const sortedEffects = sortEffects(filteredEffects, sortBy);

  // Render grouped or ungrouped
  if (groupByType) {
    const grouped = groupEffectsByCategory(sortedEffects);

    return (
      <div className="effects-list">
        {grouped.buff.length > 0 && (
          <div className="effects-group">
            <h4 className="effects-group-title">Buffs</h4>
            <div className="effects-grid">
              {grouped.buff.map((effect) => (
                <EffectBadge
                  key={effect.id}
                  effect={effect}
                  size={size}
                  removable={removable}
                  onClick={onEffectClick}
                  onRemove={onRemoveEffect}
                />
              ))}
            </div>
          </div>
        )}

        {grouped.debuff.length > 0 && (
          <div className="effects-group">
            <h4 className="effects-group-title">Debuffs</h4>
            <div className="effects-grid">
              {grouped.debuff.map((effect) => (
                <EffectBadge
                  key={effect.id}
                  effect={effect}
                  size={size}
                  removable={removable}
                  onClick={onEffectClick}
                  onRemove={onRemoveEffect}
                />
              ))}
            </div>
          </div>
        )}

        {grouped.neutral.length > 0 && (
          <div className="effects-group">
            <h4 className="effects-group-title">Other Effects</h4>
            <div className="effects-grid">
              {grouped.neutral.map((effect) => (
                <EffectBadge
                  key={effect.id}
                  effect={effect}
                  size={size}
                  removable={removable}
                  onClick={onEffectClick}
                  onRemove={onRemoveEffect}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Ungrouped rendering
  return (
    <div className="effects-list">
      <div className="effects-grid">
        {sortedEffects.map((effect) => (
          <EffectBadge
            key={effect.id}
            effect={effect}
            size={size}
            removable={removable}
            onClick={onEffectClick}
            onRemove={onRemoveEffect}
          />
        ))}
      </div>
    </div>
  );
}
