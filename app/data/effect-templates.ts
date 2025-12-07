/**
 * Effect Templates Library
 * Pre-configured templates for common D&D 5e spells and conditions
 */

import { Effect, createEffect } from '@/app/types/effects';

/**
 * Partial effect template (missing appliedBy, appliedTo which are runtime values)
 */
export type EffectTemplate = Omit<Partial<Effect>, 'id' | 'createdAt' | 'appliedBy' | 'appliedTo'> & {
  name: string;
  durationType: Effect['durationType'];
};

/**
 * Common spell templates
 */
export const SPELL_TEMPLATES: Record<string, EffectTemplate> = {
  'Bless': {
    name: 'Bless',
    icon: '✨',
    description: 'Add 1d4 to attack rolls and saving throws',
    durationType: 'rounds',
    roundsRemaining: 10,
    mechanics: {
      requiresConcentration: true,
      bonuses: [
        { type: 'attack', value: '+1d4' },
        { type: 'save', value: '+1d4' },
      ],
    },
  },
  'Bane': {
    name: 'Bane',
    icon: '💀',
    description: 'Subtract 1d4 from attack rolls and saving throws',
    durationType: 'rounds',
    roundsRemaining: 10,
    mechanics: {
      requiresConcentration: true,
      bonuses: [
        { type: 'attack', value: '-1d4' },
        { type: 'save', value: '-1d4' },
      ],
    },
  },
  'Haste': {
    name: 'Haste',
    icon: '⚡',
    description: 'Doubled speed, +2 AC, advantage on DEX saves, extra action',
    durationType: 'rounds',
    roundsRemaining: 10,
    mechanics: {
      requiresConcentration: true,
      bonuses: [
        { type: 'ac', value: '+2' },
        { type: 'speed', value: 'x2' },
      ],
      advantageOn: ['dex-saves'],
    },
  },
  'Hex': {
    name: 'Hex',
    icon: '🔮',
    description: 'Extra 1d6 necrotic damage, disadvantage on ability checks',
    durationType: 'rounds',
    roundsRemaining: 10,
    mechanics: {
      requiresConcentration: true,
      bonuses: [
        { type: 'damage', value: '+1d6 necrotic' },
      ],
    },
  },
  'Hunter\'s Mark': {
    name: 'Hunter\'s Mark',
    icon: '🎯',
    description: 'Extra 1d6 damage to marked target',
    durationType: 'rounds',
    roundsRemaining: 10,
    mechanics: {
      requiresConcentration: true,
      bonuses: [
        { type: 'damage', value: '+1d6' },
      ],
    },
  },
  'Shield of Faith': {
    name: 'Shield of Faith',
    icon: '🛡️',
    description: '+2 bonus to AC',
    durationType: 'rounds',
    roundsRemaining: 10,
    mechanics: {
      requiresConcentration: true,
      bonuses: [
        { type: 'ac', value: '+2' },
      ],
    },
  },
  'Guidance': {
    name: 'Guidance',
    icon: '🌟',
    description: 'Add 1d4 to one ability check',
    durationType: 'rounds',
    roundsRemaining: 1,
    mechanics: {
      requiresConcentration: true,
      bonuses: [
        { type: 'ability-check', value: '+1d4' },
      ],
    },
  },
  'Bardic Inspiration': {
    name: 'Bardic Inspiration',
    icon: '🎵',
    description: 'Add inspiration die to ability check, attack, or save',
    durationType: 'rounds',
    roundsRemaining: 10,
    mechanics: {
      bonuses: [
        { type: 'inspiration', value: '+1d6' },
      ],
    },
  },
  'Shield': {
    name: 'Shield',
    icon: '🛡️',
    description: '+5 AC until start of your next turn',
    durationType: 'rounds',
    roundsRemaining: 1,
    mechanics: {
      bonuses: [
        { type: 'ac', value: '+5' },
      ],
    },
  },
  'Aid': {
    name: 'Aid',
    icon: '❤️',
    description: '+5 maximum and current hit points for 8 hours',
    durationType: 'rounds',
    roundsRemaining: 4800,
    mechanics: {
      bonuses: [
        { type: 'hp', value: '+5' },
      ],
    },
  },
};

/**
 * D&D 5e SRD condition templates (all 14 conditions)
 */
export const CONDITION_TEMPLATES: Record<string, EffectTemplate> = {
  'Blinded': {
    name: 'Blinded',
    icon: '👁️',
    description: 'Cannot see, auto-fail checks requiring sight, attacks have disadvantage, attacks against you have advantage',
    durationType: 'saves',
    saveRequired: {
      ability: 'CON',
      dc: 10,
      timing: 'end',
    },
    mechanics: {
      disadvantageOn: ['attacks', 'sight-checks'],
    },
  },
  'Charmed': {
    name: 'Charmed',
    icon: '💖',
    description: 'Cannot attack charmer or target with harmful abilities/effects, charmer has advantage on social checks',
    durationType: 'saves',
    saveRequired: {
      ability: 'WIS',
      dc: 10,
      timing: 'end',
    },
    mechanics: {},
  },
  'Deafened': {
    name: 'Deafened',
    icon: '🔇',
    description: 'Cannot hear, auto-fail checks requiring hearing',
    durationType: 'saves',
    saveRequired: {
      ability: 'CON',
      dc: 10,
      timing: 'end',
    },
    mechanics: {},
  },
  'Frightened': {
    name: 'Frightened',
    icon: '😨',
    description: 'Disadvantage on ability checks and attacks while source is in sight, cannot move closer to source',
    durationType: 'saves',
    saveRequired: {
      ability: 'WIS',
      dc: 10,
      timing: 'end',
    },
    mechanics: {
      disadvantageOn: ['attacks', 'ability-checks'],
    },
  },
  'Grappled': {
    name: 'Grappled',
    icon: '🤼',
    description: 'Speed is 0, cannot benefit from speed bonuses',
    durationType: 'permanent',
    mechanics: {},
  },
  'Incapacitated': {
    name: 'Incapacitated',
    icon: '😴',
    description: 'Cannot take actions or reactions',
    durationType: 'saves',
    saveRequired: {
      ability: 'CON',
      dc: 10,
      timing: 'end',
    },
    mechanics: {},
  },
  'Invisible': {
    name: 'Invisible',
    icon: '👻',
    description: 'Impossible to see without magic, attacks have advantage, attacks against you have disadvantage',
    durationType: 'rounds',
    roundsRemaining: 10,
    mechanics: {
      advantageOn: ['attacks'],
    },
  },
  'Paralyzed': {
    name: 'Paralyzed',
    icon: '🥶',
    description: 'Incapacitated, cannot move or speak, auto-fail STR and DEX saves, attacks have advantage, hits within 5ft are crits',
    durationType: 'saves',
    saveRequired: {
      ability: 'CON',
      dc: 10,
      timing: 'end',
    },
    mechanics: {
      disadvantageOn: ['str-saves', 'dex-saves'],
    },
  },
  'Petrified': {
    name: 'Petrified',
    icon: '🗿',
    description: 'Transformed into stone, incapacitated, cannot move or speak, unaware of surroundings, auto-fail STR and DEX saves, resistance to all damage, immune to poison and disease',
    durationType: 'permanent',
    mechanics: {},
  },
  'Poisoned': {
    name: 'Poisoned',
    icon: '🤢',
    description: 'Disadvantage on attack rolls and ability checks',
    durationType: 'saves',
    saveRequired: {
      ability: 'CON',
      dc: 10,
      timing: 'end',
    },
    mechanics: {
      disadvantageOn: ['attacks', 'ability-checks'],
    },
  },
  'Prone': {
    name: 'Prone',
    icon: '🤕',
    description: 'Disadvantage on attacks, attacks within 5ft have advantage, ranged attacks have disadvantage, costs half movement to stand',
    durationType: 'permanent',
    mechanics: {
      disadvantageOn: ['attacks'],
    },
  },
  'Restrained': {
    name: 'Restrained',
    icon: '⛓️',
    description: 'Speed is 0, attacks have disadvantage, DEX saves have disadvantage, attacks against you have advantage',
    durationType: 'permanent',
    mechanics: {
      disadvantageOn: ['attacks', 'dex-saves'],
    },
  },
  'Stunned': {
    name: 'Stunned',
    icon: '😵',
    description: 'Incapacitated, cannot move, can only speak falteringly, auto-fail STR and DEX saves, attacks have advantage',
    durationType: 'saves',
    saveRequired: {
      ability: 'CON',
      dc: 10,
      timing: 'end',
    },
    mechanics: {
      disadvantageOn: ['str-saves', 'dex-saves'],
    },
  },
  'Unconscious': {
    name: 'Unconscious',
    icon: '💀',
    description: 'Incapacitated, cannot move or speak, unaware of surroundings, drop held items, fall prone, auto-fail STR and DEX saves, attacks have advantage, hits within 5ft are crits',
    durationType: 'permanent',
    mechanics: {
      disadvantageOn: ['str-saves', 'dex-saves'],
    },
  },
};

/**
 * Apply a template to create a full effect
 */
export interface ApplyTemplateParams {
  appliedBy: string;
  appliedTo: string;
  source?: Effect['source'];
  roundsRemaining?: number;
  saveRequired?: Effect['saveRequired'];
  timeExpiry?: string;
  description?: string;
  mechanics?: Effect['mechanics'];
}

export function applyEffectTemplate(
  templateName: string,
  params: ApplyTemplateParams
): Effect {
  const template = getTemplateByName(templateName);

  if (!template) {
    throw new Error(`Template not found: ${templateName}`);
  }

  // Merge template with params, params override template
  return createEffect({
    name: template.name,
    icon: template.icon,
    description: params.description || template.description,
    source: params.source,
    appliedBy: params.appliedBy,
    appliedTo: params.appliedTo,
    durationType: template.durationType,
    roundsRemaining: params.roundsRemaining ?? template.roundsRemaining,
    saveRequired: params.saveRequired ?? template.saveRequired,
    timeExpiry: params.timeExpiry ?? template.timeExpiry,
    mechanics: params.mechanics ?? template.mechanics,
  });
}

/**
 * Get a template by name (searches both spells and conditions)
 */
export function getTemplateByName(name: string): EffectTemplate | undefined {
  return SPELL_TEMPLATES[name] || CONDITION_TEMPLATES[name];
}

/**
 * Get all spell template names
 */
export function getAllSpellNames(): string[] {
  return Object.keys(SPELL_TEMPLATES).sort();
}

/**
 * Get all condition template names
 */
export function getAllConditionNames(): string[] {
  return Object.keys(CONDITION_TEMPLATES).sort();
}
