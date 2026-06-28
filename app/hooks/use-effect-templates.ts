"use client";

/**
 * useEffectTemplates Hook
 * Provides easy access to effect templates
 */

import { useMemo, useCallback } from 'react';
import {
  SPELL_TEMPLATES,
  CONDITION_TEMPLATES,
  EffectTemplate,
  applyEffectTemplate,
  ApplyTemplateParams,
} from '@/app/data/effect-templates';
import { Effect } from '@/app/types/effects';

export interface UseEffectTemplatesResult {
  // Template collections
  spells: Record<string, EffectTemplate>;
  conditions: Record<string, EffectTemplate>;
  all: Record<string, EffectTemplate>;
  categories: string[];

  // Template operations
  search: (query: string) => EffectTemplate[];
  getTemplate: (name: string) => EffectTemplate | undefined;
  applyTemplate: (name: string, params: ApplyTemplateParams) => Effect;

  // Filtering
  filterByCategory: (category: 'spells' | 'conditions') => EffectTemplate[];
  filterByConcentration: (requiresConcentration: boolean) => EffectTemplate[];
  filterByDurationType: (durationType: Effect['durationType']) => EffectTemplate[];

  // Statistics
  count: {
    total: number;
    spells: number;
    conditions: number;
    concentration: number;
  };

  // Listing
  listNames: (category?: 'spells' | 'conditions') => string[];
}

export function useEffectTemplates(): UseEffectTemplatesResult {
  const spells = SPELL_TEMPLATES;
  const conditions = CONDITION_TEMPLATES;

  const all = useMemo(() => {
    return { ...spells, ...conditions };
  }, [spells, conditions]);

  const categories = useMemo(() => {
    return ['spells', 'conditions'];
  }, []);

  const search = useCallback((query: string): EffectTemplate[] => {
    if (!query) {
      return Object.values(all);
    }

    const lowerQuery = query.toLowerCase();
    return Object.values(all).filter(
      (template) =>
        template.name.toLowerCase().includes(lowerQuery) ||
        template.description?.toLowerCase().includes(lowerQuery)
    );
  }, [all]);

  const getTemplate = useCallback((name: string): EffectTemplate | undefined => {
    // Try exact match first
    if (all[name]) {
      return all[name];
    }

    // Try case-insensitive match
    const lowerName = name.toLowerCase();
    const entry = Object.entries(all).find(
      ([key]) => key.toLowerCase() === lowerName
    );

    return entry ? entry[1] : undefined;
  }, [all]);

  const applyTemplate = useCallback((name: string, params: ApplyTemplateParams): Effect => {
    return applyEffectTemplate(name, params);
  }, []);

  const filterByCategory = useCallback((category: 'spells' | 'conditions'): EffectTemplate[] => {
    const source = category === 'spells' ? spells : conditions;
    return Object.values(source);
  }, [spells, conditions]);

  const filterByConcentration = useCallback((requiresConcentration: boolean): EffectTemplate[] => {
    return Object.values(all).filter((template) => {
      if (requiresConcentration) {
        return template.mechanics?.requiresConcentration === true;
      } else {
        return template.mechanics?.requiresConcentration !== true;
      }
    });
  }, [all]);

  const filterByDurationType = useCallback((durationType: Effect['durationType']): EffectTemplate[] => {
    return Object.values(all).filter(
      (template) => template.durationType === durationType
    );
  }, [all]);

  const count = useMemo(() => {
    const allTemplates = Object.values(all);
    return {
      total: allTemplates.length,
      spells: Object.keys(spells).length,
      conditions: Object.keys(conditions).length,
      concentration: allTemplates.filter(
        (t) => t.mechanics?.requiresConcentration === true
      ).length,
    };
  }, [all, spells, conditions]);

  const listNames = useCallback((category?: 'spells' | 'conditions'): string[] => {
    let source: Record<string, EffectTemplate>;

    if (category === 'spells') {
      source = spells;
    } else if (category === 'conditions') {
      source = conditions;
    } else {
      source = all;
    }

    return Object.keys(source).sort();
  }, [spells, conditions, all]);

  return {
    spells,
    conditions,
    all,
    categories,
    search,
    getTemplate,
    applyTemplate,
    filterByCategory,
    filterByConcentration,
    filterByDurationType,
    count,
    listNames,
  };
}
