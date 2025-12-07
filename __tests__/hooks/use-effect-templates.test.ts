/**
 * useEffectTemplates Hook Tests
 * Tests for accessing and applying effect templates
 */

import { renderHook } from '@testing-library/react';
import { useEffectTemplates } from '@/app/hooks/use-effect-templates';

describe('useEffectTemplates', () => {
  describe('Template Access', () => {
    it('should provide all spell templates', () => {
      const { result } = renderHook(() => useEffectTemplates());

      expect(result.current.spells).toBeDefined();
      expect(Object.keys(result.current.spells).length).toBeGreaterThan(0);
      expect(result.current.spells['Bless']).toBeDefined();
      expect(result.current.spells['Haste']).toBeDefined();
    });

    it('should provide all condition templates', () => {
      const { result } = renderHook(() => useEffectTemplates());

      expect(result.current.conditions).toBeDefined();
      expect(Object.keys(result.current.conditions).length).toBeGreaterThan(0);
      expect(result.current.conditions['Poisoned']).toBeDefined();
      expect(result.current.conditions['Stunned']).toBeDefined();
    });

    it('should provide all templates combined', () => {
      const { result } = renderHook(() => useEffectTemplates());

      expect(result.current.all).toBeDefined();
      const allKeys = Object.keys(result.current.all);
      expect(allKeys).toContain('Bless');
      expect(allKeys).toContain('Poisoned');
    });

    it('should provide template categories', () => {
      const { result } = renderHook(() => useEffectTemplates());

      expect(result.current.categories).toEqual(['spells', 'conditions']);
    });
  });

  describe('Searching Templates', () => {
    it('should search templates by name', () => {
      const { result } = renderHook(() => useEffectTemplates());

      const results = result.current.search('bless');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Bless');
    });

    it('should search templates case-insensitively', () => {
      const { result } = renderHook(() => useEffectTemplates());

      const results = result.current.search('HASTE');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('Haste');
    });

    it('should search templates by description', () => {
      const { result } = renderHook(() => useEffectTemplates());

      const results = result.current.search('attack rolls');

      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', () => {
      const { result } = renderHook(() => useEffectTemplates());

      const results = result.current.search('nonexistent');

      expect(results).toEqual([]);
    });

    it('should return all templates for empty search', () => {
      const { result } = renderHook(() => useEffectTemplates());

      const results = result.current.search('');

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Getting Single Template', () => {
    it('should get template by name', () => {
      const { result } = renderHook(() => useEffectTemplates());

      const template = result.current.getTemplate('Bless');

      expect(template).toBeDefined();
      expect(template?.name).toBe('Bless');
    });

    it('should return undefined for non-existent template', () => {
      const { result } = renderHook(() => useEffectTemplates());

      const template = result.current.getTemplate('Nonexistent');

      expect(template).toBeUndefined();
    });

    it('should get template case-insensitively', () => {
      const { result } = renderHook(() => useEffectTemplates());

      const template = result.current.getTemplate('bless');

      expect(template).toBeDefined();
      expect(template?.name).toBe('Bless');
    });
  });

  describe('Applying Templates', () => {
    it('should apply template with required params', () => {
      const { result } = renderHook(() => useEffectTemplates());

      const effect = result.current.applyTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: 'char-1',
      });

      expect(effect).toBeDefined();
      expect(effect.name).toBe('Bless');
      expect(effect.appliedBy).toBe('user-1');
      expect(effect.appliedTo).toBe('char-1');
    });

    it('should apply template with custom duration', () => {
      const { result } = renderHook(() => useEffectTemplates());

      const effect = result.current.applyTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        roundsRemaining: 5,
      });

      expect(effect.roundsRemaining).toBe(5);
    });

    it('should apply template with custom DC', () => {
      const { result } = renderHook(() => useEffectTemplates());

      const effect = result.current.applyTemplate('Poisoned', {
        appliedBy: 'dm-1',
        appliedTo: 'char-1',
        saveRequired: {
          ability: 'CON',
          dc: 15,
          timing: 'end',
        },
      });

      expect(effect.saveRequired?.dc).toBe(15);
    });

    it('should throw error for non-existent template', () => {
      const { result } = renderHook(() => useEffectTemplates());

      expect(() => {
        result.current.applyTemplate('Nonexistent', {
          appliedBy: 'user-1',
          appliedTo: 'char-1',
        });
      }).toThrow();
    });
  });

  describe('Filtering Templates', () => {
    it('should filter by category', () => {
      const { result } = renderHook(() => useEffectTemplates());

      const spells = result.current.filterByCategory('spells');

      expect(spells.length).toBeGreaterThan(0);
      spells.forEach((template) => {
        expect(result.current.spells[template.name]).toBeDefined();
      });
    });

    it('should filter by concentration requirement', () => {
      const { result } = renderHook(() => useEffectTemplates());

      const concentration = result.current.filterByConcentration(true);

      expect(concentration.length).toBeGreaterThan(0);
      concentration.forEach((template) => {
        expect(template.mechanics.requiresConcentration).toBe(true);
      });
    });

    it('should filter non-concentration effects', () => {
      const { result } = renderHook(() => useEffectTemplates());

      const nonConcentration = result.current.filterByConcentration(false);

      expect(nonConcentration.length).toBeGreaterThan(0);
      nonConcentration.forEach((template) => {
        expect(template.mechanics.requiresConcentration).not.toBe(true);
      });
    });

    it('should filter by duration type', () => {
      const { result } = renderHook(() => useEffectTemplates());

      const roundBased = result.current.filterByDurationType('rounds');

      expect(roundBased.length).toBeGreaterThan(0);
      roundBased.forEach((template) => {
        expect(template.durationType).toBe('rounds');
      });
    });
  });

  describe('Template Statistics', () => {
    it('should count total templates', () => {
      const { result } = renderHook(() => useEffectTemplates());

      expect(result.current.count.total).toBeGreaterThan(0);
    });

    it('should count spell templates', () => {
      const { result } = renderHook(() => useEffectTemplates());

      expect(result.current.count.spells).toBeGreaterThan(0);
    });

    it('should count condition templates', () => {
      const { result } = renderHook(() => useEffectTemplates());

      expect(result.current.count.conditions).toBeGreaterThan(0);
    });

    it('should count concentration templates', () => {
      const { result } = renderHook(() => useEffectTemplates());

      expect(result.current.count.concentration).toBeGreaterThan(0);
    });
  });

  describe('Template Listing', () => {
    it('should list all template names', () => {
      const { result } = renderHook(() => useEffectTemplates());

      const names = result.current.listNames();

      expect(names).toContain('Bless');
      expect(names).toContain('Haste');
      expect(names).toContain('Poisoned');
    });

    it('should list templates sorted alphabetically by default', () => {
      const { result } = renderHook(() => useEffectTemplates());

      const names = result.current.listNames();

      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });

    it('should list spell names only', () => {
      const { result } = renderHook(() => useEffectTemplates());

      const spellNames = result.current.listNames('spells');

      expect(spellNames).toContain('Bless');
      expect(spellNames).not.toContain('Poisoned');
    });

    it('should list condition names only', () => {
      const { result } = renderHook(() => useEffectTemplates());

      const conditionNames = result.current.listNames('conditions');

      expect(conditionNames).toContain('Poisoned');
      expect(conditionNames).not.toContain('Bless');
    });
  });
});
