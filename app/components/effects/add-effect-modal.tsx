/**
 * AddEffectModal Component
 * Modal for adding new effects from templates or custom
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Effect, createEffect } from '@/app/types/effects';
import {
  SPELL_TEMPLATES,
  CONDITION_TEMPLATES,
  EffectTemplate,
  applyEffectTemplate,
  ApplyTemplateParams,
} from '@/app/data/effect-templates';
import { validateDC, validateRounds } from '@/app/lib/validators/dnd-values';
import './add-effect-modal.css';

export interface AddEffectModalProps {
  isOpen: boolean;
  targetId: string;
  appliedBy: string;
  onAdd: (effect: Effect) => void;
  onClose: () => void;
}

type TabType = 'spells' | 'conditions' | 'custom';

interface CustomEffectForm {
  name: string;
  description: string;
  icon: string;
  durationType: 'rounds' | 'permanent';
  roundsRemaining: number;
}

interface ModalState {
  activeTab: TabType;
  selectedTemplate: string | null;
  searchQuery: string;
  customDuration: number | null;
  customDC: number | null;
  customForm: CustomEffectForm;
}

const INITIAL_STATE: ModalState = {
  activeTab: 'spells',
  selectedTemplate: null,
  searchQuery: '',
  customDuration: null,
  customDC: null,
  customForm: {
    name: '',
    description: '',
    icon: '✨',
    durationType: 'rounds',
    roundsRemaining: 10,
  },
};

export function AddEffectModal({
  isOpen,
  targetId,
  appliedBy,
  onAdd,
  onClose,
}: AddEffectModalProps) {
  const [state, setState] = useState<ModalState>(INITIAL_STATE);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setState(INITIAL_STATE);
    }
  }, [isOpen]);

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

  if (!isOpen) {
    return null;
  }

  const allTemplates = {
    spells: SPELL_TEMPLATES,
    conditions: CONDITION_TEMPLATES,
  };

  const getCurrentTemplates = (): Record<string, EffectTemplate> => {
    if (state.activeTab === 'custom') {
      return {};
    }
    return allTemplates[state.activeTab];
  };

  const filterTemplates = (templates: Record<string, EffectTemplate>) => {
    if (!state.searchQuery) {
      return templates;
    }

    const query = state.searchQuery.toLowerCase();
    const filtered: Record<string, EffectTemplate> = {};

    Object.entries(templates).forEach(([key, template]) => {
      if (
        template.name.toLowerCase().includes(query) ||
        template.description?.toLowerCase().includes(query)
      ) {
        filtered[key] = template;
      }
    });

    return filtered;
  };

  const searchAllTemplates = () => {
    if (!state.searchQuery) {
      return getCurrentTemplates();
    }

    // Search across all templates
    const allCombined = { ...SPELL_TEMPLATES, ...CONDITION_TEMPLATES };
    return filterTemplates(allCombined);
  };

  const displayedTemplates = state.activeTab === 'custom'
    ? {}
    : state.searchQuery
    ? searchAllTemplates()
    : filterTemplates(getCurrentTemplates());

  const handleTemplateSelect = (templateName: string) => {
    setState({
      ...state,
      selectedTemplate: templateName,
      customDuration: null,
      customDC: null,
    });
  };

  const handleAddEffect = () => {
    if (state.activeTab === 'custom') {
      if (!state.customForm.name) {
        return;
      }

      const customEffect = createEffect({
        name: state.customForm.name,
        icon: state.customForm.icon,
        description: state.customForm.description,
        appliedBy,
        appliedTo: targetId,
        durationType: state.customForm.durationType,
        roundsRemaining: state.customForm.durationType === 'rounds' ? state.customForm.roundsRemaining : undefined,
      });

      onAdd(customEffect);
      onClose();
      return;
    }

    if (!state.selectedTemplate) {
      return;
    }

    // Find template across all categories
    const allTemplates = { ...SPELL_TEMPLATES, ...CONDITION_TEMPLATES };
    const template = allTemplates[state.selectedTemplate];

    if (!template) {
      return;
    }

    // Apply template with custom overrides
    const params: ApplyTemplateParams = {
      appliedBy,
      appliedTo: targetId,
      ...(state.customDuration !== null && template.roundsRemaining !== undefined && {
        roundsRemaining: state.customDuration,
      }),
      ...(state.customDC !== null && template.saveRequired && {
        saveRequired: {
          ...template.saveRequired,
          dc: state.customDC,
        },
      }),
    };

    const effect = applyEffectTemplate(state.selectedTemplate, params);
    onAdd(effect);
    onClose();
  };

  const getSelectedTemplate = (): EffectTemplate | null => {
    if (!state.selectedTemplate) {
      return null;
    }

    const allTemplates = { ...SPELL_TEMPLATES, ...CONDITION_TEMPLATES };
    return allTemplates[state.selectedTemplate] || null;
  };

  const selectedTemplateData = getSelectedTemplate();

  return (
    <div className="modal-backdrop" data-testid="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Effect</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Search */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search effects..."
              value={state.searchQuery}
              onChange={(e) => setState({ ...state, searchQuery: e.target.value })}
              className="search-input"
            />
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${state.activeTab === 'spells' ? 'active' : ''}`}
              onClick={() => setState({ ...state, activeTab: 'spells', selectedTemplate: null })}
            >
              Spells
            </button>
            <button
              className={`tab ${state.activeTab === 'conditions' ? 'active' : ''}`}
              onClick={() => setState({ ...state, activeTab: 'conditions', selectedTemplate: null })}
            >
              Conditions
            </button>
            <button
              className={`tab ${state.activeTab === 'custom' ? 'active' : ''}`}
              onClick={() => setState({ ...state, activeTab: 'custom', selectedTemplate: null })}
            >
              Custom
            </button>
          </div>

          {/* Template List */}
          {state.activeTab !== 'custom' && (
            <div className="template-list">
              {Object.entries(displayedTemplates).map(([key, template]) => (
                <button
                  key={key}
                  className={`template-item ${state.selectedTemplate === key ? 'selected' : ''}`}
                  onClick={() => handleTemplateSelect(key)}
                >
                  <span className="template-icon">{template.icon}</span>
                  <div className="template-info">
                    <div className="template-name">{template.name}</div>
                    <div className="template-description">{template.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Custom Form */}
          {state.activeTab === 'custom' && (
            <div className="custom-form">
              <div className="form-group">
                <label htmlFor="effect-name">Effect Name</label>
                <input
                  id="effect-name"
                  type="text"
                  value={state.customForm.name}
                  onChange={(e) => setState({ ...state, customForm: { ...state.customForm, name: e.target.value } })}
                  placeholder="Enter effect name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="effect-description">Description</label>
                <textarea
                  id="effect-description"
                  value={state.customForm.description}
                  onChange={(e) => setState({ ...state, customForm: { ...state.customForm, description: e.target.value } })}
                  placeholder="Describe what the effect does"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="effect-icon">Icon</label>
                <input
                  id="effect-icon"
                  type="text"
                  value={state.customForm.icon}
                  onChange={(e) => setState({ ...state, customForm: { ...state.customForm, icon: e.target.value } })}
                  placeholder="✨"
                  maxLength={2}
                />
              </div>

              <div className="form-group">
                <label htmlFor="effect-duration-type">Duration Type</label>
                <select
                  id="effect-duration-type"
                  value={state.customForm.durationType}
                  onChange={(e) =>
                    setState({ ...state, customForm: { ...state.customForm, durationType: e.target.value as 'rounds' | 'permanent' } })
                  }
                >
                  <option value="rounds">Rounds</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>

              {state.customForm.durationType === 'rounds' && (
                <div className="form-group">
                  <label htmlFor="effect-rounds">Rounds</label>
                  <input
                    id="effect-rounds"
                    type="number"
                    min="1"
                    value={state.customForm.roundsRemaining}
                    onChange={(e) => {
                      const result = validateRounds(e.target.value);
                      if (result.valid) {
                        setState({ ...state, customForm: { ...state.customForm, roundsRemaining: result.value } });
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Selected Template Details */}
          {selectedTemplateData && state.activeTab !== 'custom' && (
            <div className="selected-template-details">
              <h3>{selectedTemplateData.name}</h3>
              <p>{selectedTemplateData.description}</p>

              {selectedTemplateData.roundsRemaining !== undefined && (
                <div className="form-group">
                  <label htmlFor="duration-input">Rounds</label>
                  <input
                    id="duration-input"
                    type="number"
                    min="1"
                    placeholder={String(selectedTemplateData.roundsRemaining)}
                    value={state.customDuration ?? ''}
                    onChange={(e) => {
                      const result = validateRounds(e.target.value);
                      setState({ ...state, customDuration: result.valid ? result.value : null });
                    }}
                  />
                </div>
              )}

              {selectedTemplateData.saveRequired && (
                <div className="form-group">
                  <label htmlFor="dc-input">DC</label>
                  <input
                    id="dc-input"
                    type="number"
                    min="1"
                    max="30"
                    placeholder={String(selectedTemplateData.saveRequired.dc)}
                    value={state.customDC ?? ''}
                    onChange={(e) => {
                      const result = validateDC(e.target.value);
                      setState({ ...state, customDC: result.valid ? result.value : null });
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="button-primary"
            onClick={handleAddEffect}
            disabled={!state.selectedTemplate && state.activeTab !== 'custom'}
          >
            Add Effect
          </button>
        </div>
      </div>
    </div>
  );
}
