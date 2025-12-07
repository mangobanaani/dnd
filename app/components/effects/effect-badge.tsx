/**
 * EffectBadge Component
 * Displays an individual effect as a compact badge
 */

'use client';

import React from 'react';
import { Effect } from '@/app/types/effects';
import { categorizeEffect } from '@/app/lib/utils/effect-categorization';
import './effect-badge.css';

export interface EffectBadgeProps {
  effect: Effect;
  size?: 'compact' | 'default';
  removable?: boolean;
  onClick?: (effect: Effect) => void;
  onRemove?: (effect: Effect) => void;
}

/**
 * Format time remaining for time-based effects
 */
function formatTimeRemaining(timeExpiry: string): string {
  const now = Date.now();
  const expiry = new Date(timeExpiry).getTime();
  const diff = expiry - now;

  if (diff <= 0) {
    return 'Expired';
  }

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  if (hours > 0) {
    return `${hours}h`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return '<1m';
}

export function EffectBadge({
  effect,
  size = 'default',
  removable = false,
  onClick,
  onRemove,
}: EffectBadgeProps) {
  const effectType = categorizeEffect(effect);
  const isConcentration = effect.mechanics.requiresConcentration === true;

  const handleClick = () => {
    if (onClick) {
      onClick(effect);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(effect);
    }
  };

  // Render duration indicator based on duration type
  const renderDuration = () => {
    if (effect.durationType === 'rounds' && effect.roundsRemaining !== undefined) {
      return <span className="duration">{effect.roundsRemaining}</span>;
    }

    if (effect.durationType === 'time' && effect.timeExpiry) {
      return <span className="duration">{formatTimeRemaining(effect.timeExpiry)}</span>;
    }

    if (effect.durationType === 'saves' && effect.saveRequired) {
      return <span className="save-indicator">{effect.saveRequired.ability}</span>;
    }

    return null;
  };

  const className = `effect-badge ${effectType} ${size}`;

  // Use div instead of button when removable to avoid nested buttons
  const Wrapper = removable ? 'div' : 'button';

  return (
    <Wrapper
      className={className}
      onClick={handleClick}
      {...(Wrapper === 'button' ? { type: 'button' as const } : {})}
      title={effect.description}
    >
      {effect.icon && <span className="icon">{effect.icon}</span>}
      <span className="name">{effect.name}</span>

      {isConcentration && <span className="concentration-badge">C</span>}

      {renderDuration()}

      {removable && (
        <button
          className="remove-button"
          onClick={handleRemove}
          aria-label={`Remove ${effect.name}`}
          type="button"
        >
          ×
        </button>
      )}
    </Wrapper>
  );
}
