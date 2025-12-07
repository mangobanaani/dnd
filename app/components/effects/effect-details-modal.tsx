/**
 * EffectDetailsModal Component
 * Modal for viewing and managing effect details
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Effect } from '@/app/types/effects';
import './effect-details-modal.css';

export interface EffectDetailsModalProps {
  isOpen: boolean;
  effect: Effect | null;
  editable?: boolean;
  removable?: boolean;
  onUpdate: (effect: Effect) => void;
  onRemove: (effect: Effect) => void;
  onClose: () => void;
}

export function EffectDetailsModal({
  isOpen,
  effect,
  editable = false,
  removable = false,
  onUpdate,
  onRemove,
  onClose,
}: EffectDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRounds, setEditedRounds] = useState<number | null>(null);

  // Reset editing state when modal opens/closes
  useEffect(() => {
    if (isOpen && effect) {
      setIsEditing(false);
      setEditedRounds(
        effect.durationType === 'rounds' && effect.roundsRemaining !== undefined
          ? effect.roundsRemaining
          : null
      );
    }
  }, [isOpen, effect]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !effect) {
    return null;
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedRounds(
      effect.durationType === 'rounds' && effect.roundsRemaining !== undefined
        ? effect.roundsRemaining
        : null
    );
  };

  const handleSave = () => {
    if (editedRounds !== null && effect.durationType === 'rounds') {
      const updatedEffect: Effect = {
        ...effect,
        roundsRemaining: editedRounds,
      };
      onUpdate(updatedEffect);
    }
    setIsEditing(false);
  };

  const handleRemove = () => {
    onRemove(effect);
    onClose();
  };

  const formatDuration = () => {
    if (effect.durationType === 'rounds' && effect.roundsRemaining !== undefined) {
      return `${effect.roundsRemaining} rounds remaining`;
    }
    if (effect.durationType === 'time' && effect.timeExpiry) {
      const expiry = new Date(effect.timeExpiry);
      return `Until ${expiry.toLocaleTimeString()}`;
    }
    if (effect.durationType === 'saves' && effect.saveRequired) {
      return `Until saved (${effect.saveRequired.timing} of turn)`;
    }
    return 'Permanent';
  };

  const formatBonus = (bonus: { type: string; value: string }) => {
    const typeLabels: Record<string, string> = {
      attack: 'Attack rolls',
      damage: 'Damage',
      save: 'Saving throws',
      ac: 'AC',
      'ability-check': 'Ability checks',
      initiative: 'Initiative',
    };

    const value = bonus.value.startsWith('+') || bonus.value.startsWith('-')
      ? bonus.value
      : `+${bonus.value}`;

    return `${value} to ${typeLabels[bonus.type] || bonus.type}`;
  };

  const formatAdvantageType = (type: string) => {
    const labels: Record<string, string> = {
      attacks: 'Attacks',
      saves: 'Saving throws',
      'ability-checks': 'Ability checks',
      'death-saves': 'Death saves',
      initiative: 'Initiative',
    };

    return labels[type] || type;
  };

  return (
    <div className="modal-backdrop" data-testid="modal-backdrop" onClick={onClose}>
      <div className="modal-content effect-details" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="effect-header-content">
            <span className="effect-icon-large">{effect.icon}</span>
            <h2>{effect.name}</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Description */}
          {effect.description && (
            <div className="effect-section">
              <p className="effect-description">{effect.description}</p>
            </div>
          )}

          {/* Duration */}
          <div className="effect-section">
            <h3>Duration</h3>
            {isEditing && effect.durationType === 'rounds' ? (
              <div className="form-group">
                <label htmlFor="rounds-input">Rounds Remaining</label>
                <input
                  id="rounds-input"
                  type="number"
                  min="0"
                  value={editedRounds ?? ''}
                  onChange={(e) => setEditedRounds(parseInt(e.target.value) || 0)}
                />
              </div>
            ) : (
              <p>{formatDuration()}</p>
            )}
          </div>

          {/* Concentration */}
          {effect.mechanics.requiresConcentration && (
            <div className="effect-section">
              <p className="concentration-note">⚠️ Requires concentration</p>
            </div>
          )}

          {/* Save Requirement */}
          {effect.saveRequired && (
            <div className="effect-section">
              <h3>Save Requirement</h3>
              <p>
                DC {effect.saveRequired.dc} {effect.saveRequired.ability} save at {effect.saveRequired.timing} of turn
              </p>
            </div>
          )}

          {/* Mechanics */}
          {(effect.mechanics.bonuses ||
            effect.mechanics.advantageOn ||
            effect.mechanics.disadvantageOn ||
            effect.mechanics.damagePerRound ||
            effect.mechanics.temporaryHitPoints) && (
            <div className="effect-section">
              <h3>Effects</h3>
              <ul className="mechanics-list">
                {effect.mechanics.bonuses?.map((bonus, i) => (
                  <li key={`bonus-${i}`} className="mechanic-item bonus">
                    {formatBonus(bonus)}
                  </li>
                ))}

                {effect.mechanics.advantageOn?.map((type, i) => (
                  <li key={`adv-${i}`} className="mechanic-item advantage">
                    Advantage on {formatAdvantageType(type)}
                  </li>
                ))}

                {effect.mechanics.disadvantageOn?.map((type, i) => (
                  <li key={`disadv-${i}`} className="mechanic-item disadvantage">
                    Disadvantage on {formatAdvantageType(type)}
                  </li>
                ))}

                {effect.mechanics.damagePerRound && (
                  <li className="mechanic-item damage">
                    {effect.mechanics.damagePerRound.amount} {effect.mechanics.damagePerRound.type} damage
                  </li>
                )}

                {effect.mechanics.temporaryHitPoints && (
                  <li className="mechanic-item temp-hp">
                    {effect.mechanics.temporaryHitPoints} temporary HP
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {removable && (
            <button className="button-danger" onClick={handleRemove}>
              Remove Effect
            </button>
          )}

          <div className="footer-right">
            {isEditing ? (
              <>
                <button className="button-secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
                <button className="button-primary" onClick={handleSave}>
                  Save
                </button>
              </>
            ) : (
              <>
                {editable && (
                  <button className="button-secondary" onClick={handleEdit}>
                    Edit
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
