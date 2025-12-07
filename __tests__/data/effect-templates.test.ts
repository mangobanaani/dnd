/**
 * Effect Templates Tests
 * Tests for D&D 5e spell and condition templates
 */

import {
  SPELL_TEMPLATES,
  CONDITION_TEMPLATES,
  applyEffectTemplate,
  getTemplateByName,
  getAllSpellNames,
  getAllConditionNames,
} from '@/app/data/effect-templates';
import { createEffect } from '@/app/types/effects';

describe('Effect Templates', () => {
  describe('SPELL_TEMPLATES', () => {
    it('should include Bless template', () => {
      expect(SPELL_TEMPLATES.Bless).toBeDefined();
      expect(SPELL_TEMPLATES.Bless.name).toBe('Bless');
      expect(SPELL_TEMPLATES.Bless.durationType).toBe('rounds');
      expect(SPELL_TEMPLATES.Bless.mechanics?.requiresConcentration).toBe(true);
      expect(SPELL_TEMPLATES.Bless.mechanics?.bonuses).toHaveLength(2);
    });

    it('should include Haste template', () => {
      expect(SPELL_TEMPLATES.Haste).toBeDefined();
      expect(SPELL_TEMPLATES.Haste.name).toBe('Haste');
      expect(SPELL_TEMPLATES.Haste.durationType).toBe('rounds');
      expect(SPELL_TEMPLATES.Haste.mechanics?.requiresConcentration).toBe(true);
    });

    it('should include Hex template', () => {
      expect(SPELL_TEMPLATES.Hex).toBeDefined();
      expect(SPELL_TEMPLATES.Hex.name).toBe('Hex');
      expect(SPELL_TEMPLATES.Hex.durationType).toBe('rounds');
      expect(SPELL_TEMPLATES.Hex.mechanics?.requiresConcentration).toBe(true);
    });

    it('should include Shield of Faith template', () => {
      expect(SPELL_TEMPLATES['Shield of Faith']).toBeDefined();
      expect(SPELL_TEMPLATES['Shield of Faith'].mechanics?.bonuses).toBeDefined();
    });

    it('should include Bane template', () => {
      expect(SPELL_TEMPLATES.Bane).toBeDefined();
      expect(SPELL_TEMPLATES.Bane.mechanics?.bonuses).toBeDefined();
    });

    it('should include Hunter\'s Mark template', () => {
      expect(SPELL_TEMPLATES['Hunter\'s Mark']).toBeDefined();
      expect(SPELL_TEMPLATES['Hunter\'s Mark'].mechanics?.bonuses).toBeDefined();
    });
  });

  describe('CONDITION_TEMPLATES', () => {
    it('should include Poisoned template', () => {
      expect(CONDITION_TEMPLATES.Poisoned).toBeDefined();
      expect(CONDITION_TEMPLATES.Poisoned.name).toBe('Poisoned');
      expect(CONDITION_TEMPLATES.Poisoned.icon).toBe('🤢');
      expect(CONDITION_TEMPLATES.Poisoned.mechanics?.disadvantageOn).toContain('attacks');
      expect(CONDITION_TEMPLATES.Poisoned.mechanics?.disadvantageOn).toContain('ability-checks');
    });

    it('should include Paralyzed template', () => {
      expect(CONDITION_TEMPLATES.Paralyzed).toBeDefined();
      expect(CONDITION_TEMPLATES.Paralyzed.name).toBe('Paralyzed');
      expect(CONDITION_TEMPLATES.Paralyzed.icon).toBe('🥶');
    });

    it('should include Stunned template', () => {
      expect(CONDITION_TEMPLATES.Stunned).toBeDefined();
      expect(CONDITION_TEMPLATES.Stunned.name).toBe('Stunned');
      expect(CONDITION_TEMPLATES.Stunned.icon).toBe('😵');
    });

    it('should include Frightened template', () => {
      expect(CONDITION_TEMPLATES.Frightened).toBeDefined();
      expect(CONDITION_TEMPLATES.Frightened.icon).toBe('😨');
    });

    it('should include Blinded template', () => {
      expect(CONDITION_TEMPLATES.Blinded).toBeDefined();
      expect(CONDITION_TEMPLATES.Blinded.icon).toBe('👁️');
    });

    it('should include Prone template', () => {
      expect(CONDITION_TEMPLATES.Prone).toBeDefined();
      expect(CONDITION_TEMPLATES.Prone.icon).toBe('🤕');
    });

    it('should include Grappled template', () => {
      expect(CONDITION_TEMPLATES.Grappled).toBeDefined();
      expect(CONDITION_TEMPLATES.Grappled.icon).toBe('🤼');
    });

    it('should include Restrained template', () => {
      expect(CONDITION_TEMPLATES.Restrained).toBeDefined();
      expect(CONDITION_TEMPLATES.Restrained.icon).toBe('⛓️');
    });

    it('should include Invisible template', () => {
      expect(CONDITION_TEMPLATES.Invisible).toBeDefined();
      expect(CONDITION_TEMPLATES.Invisible.icon).toBe('👻');
    });

    it('should include Incapacitated template', () => {
      expect(CONDITION_TEMPLATES.Incapacitated).toBeDefined();
      expect(CONDITION_TEMPLATES.Incapacitated.icon).toBe('😴');
    });

    it('should include Unconscious template', () => {
      expect(CONDITION_TEMPLATES.Unconscious).toBeDefined();
      expect(CONDITION_TEMPLATES.Unconscious.icon).toBe('💀');
    });
  });

  describe('applyEffectTemplate', () => {
    it('should apply Bless template with user data', () => {
      const effect = applyEffectTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        roundsRemaining: 10,
      });

      expect(effect.name).toBe('Bless');
      expect(effect.appliedBy).toBe('user-1');
      expect(effect.appliedTo).toBe('char-1');
      expect(effect.roundsRemaining).toBe(10);
      expect(effect.mechanics.requiresConcentration).toBe(true);
    });

    it('should apply Poisoned template with DM source', () => {
      const effect = applyEffectTemplate('Poisoned', {
        appliedBy: 'dm-1',
        appliedTo: 'char-1',
        source: 'dm',
        saveRequired: {
          ability: 'CON',
          dc: 12,
          timing: 'end',
        },
      });

      expect(effect.name).toBe('Poisoned');
      expect(effect.source).toBe('dm');
      expect(effect.icon).toBe('🤢');
      expect(effect.saveRequired).toBeDefined();
    });

    it('should throw error for unknown template', () => {
      expect(() => {
        applyEffectTemplate('Unknown Spell', {
          appliedBy: 'user-1',
          appliedTo: 'char-1',
        });
      }).toThrow('Template not found: Unknown Spell');
    });

    it('should allow overriding template fields', () => {
      const effect = applyEffectTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        roundsRemaining: 5, // Override default
        description: 'Custom description', // Override default
      });

      expect(effect.roundsRemaining).toBe(5);
      expect(effect.description).toBe('Custom description');
    });

    it('should merge mechanics from template and overrides', () => {
      const effect = applyEffectTemplate('Bless', {
        appliedBy: 'user-1',
        appliedTo: 'char-1',
        roundsRemaining: 10,
        mechanics: {
          bonuses: [{ type: 'custom', value: '+2' }],
        },
      });

      // Should use override mechanics, not merge
      expect(effect.mechanics.bonuses).toHaveLength(1);
      expect(effect.mechanics.bonuses?.[0].type).toBe('custom');
    });
  });

  describe('getTemplateByName', () => {
    it('should get spell template by name', () => {
      const template = getTemplateByName('Bless');
      expect(template).toBeDefined();
      expect(template?.name).toBe('Bless');
    });

    it('should get condition template by name', () => {
      const template = getTemplateByName('Poisoned');
      expect(template).toBeDefined();
      expect(template?.name).toBe('Poisoned');
    });

    it('should return undefined for unknown template', () => {
      const template = getTemplateByName('Unknown');
      expect(template).toBeUndefined();
    });

    it('should be case-sensitive', () => {
      const template = getTemplateByName('bless');
      expect(template).toBeUndefined();
    });
  });

  describe('getAllSpellNames', () => {
    it('should return array of all spell names', () => {
      const names = getAllSpellNames();

      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
      expect(names).toContain('Bless');
      expect(names).toContain('Haste');
      expect(names).toContain('Hex');
    });

    it('should return names in alphabetical order', () => {
      const names = getAllSpellNames();
      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });
  });

  describe('getAllConditionNames', () => {
    it('should return array of all condition names', () => {
      const names = getAllConditionNames();

      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
      expect(names).toContain('Poisoned');
      expect(names).toContain('Paralyzed');
      expect(names).toContain('Stunned');
    });

    it('should return names in alphabetical order', () => {
      const names = getAllConditionNames();
      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });

    it('should include all D&D 5e SRD conditions', () => {
      const names = getAllConditionNames();

      // D&D 5e has 14 conditions in SRD
      const requiredConditions = [
        'Blinded',
        'Charmed',
        'Deafened',
        'Frightened',
        'Grappled',
        'Incapacitated',
        'Invisible',
        'Paralyzed',
        'Petrified',
        'Poisoned',
        'Prone',
        'Restrained',
        'Stunned',
        'Unconscious',
      ];

      requiredConditions.forEach(condition => {
        expect(names).toContain(condition);
      });
    });
  });

  describe('Template Validation', () => {
    it('should have valid duration types for all spell templates', () => {
      Object.values(SPELL_TEMPLATES).forEach(template => {
        expect(['rounds', 'saves', 'time', 'permanent']).toContain(template.durationType);
      });
    });

    it('should have valid duration types for all condition templates', () => {
      Object.values(CONDITION_TEMPLATES).forEach(template => {
        expect(['rounds', 'saves', 'time', 'permanent']).toContain(template.durationType);
      });
    });

    it('should have icons for all condition templates', () => {
      Object.values(CONDITION_TEMPLATES).forEach(template => {
        expect(template.icon).toBeDefined();
        expect(template.icon!.length).toBeGreaterThan(0);
      });
    });

    it('should have descriptions for all templates', () => {
      const allTemplates = { ...SPELL_TEMPLATES, ...CONDITION_TEMPLATES };
      Object.values(allTemplates).forEach(template => {
        expect(template.description).toBeDefined();
        expect(template.description!.length).toBeGreaterThan(0);
      });
    });
  });
});
