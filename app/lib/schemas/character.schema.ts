/**
 * Character Zod Schema
 * Runtime validation for Character objects
 */

import { z } from 'zod';

/**
 * Ability Scores Schema (1-30 range for D&D 5e)
 */
const abilityScoresSchema = z.object({
  strength: z.number().int().min(1).max(30),
  dexterity: z.number().int().min(1).max(30),
  constitution: z.number().int().min(1).max(30),
  intelligence: z.number().int().min(1).max(30),
  wisdom: z.number().int().min(1).max(30),
  charisma: z.number().int().min(1).max(30),
});

/**
 * Skill Schema
 */
const skillSchema = z.object({
  name: z.string(),
  ability: z.enum(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']),
  proficient: z.boolean(),
  expertise: z.boolean(),
});

/**
 * Character Class Schema
 */
const characterClassSchema = z.object({
  name: z.string(),
  level: z.number().int().min(1).max(20),
  hitDie: z.string(),
  subclass: z.string().optional(),
});

/**
 * Hit Dice Schema
 */
const hitDiceSchema = z.object({
  total: z.number().int().min(0),
  current: z.number().int().min(0),
  die: z.string(),
});

/**
 * Inventory Item Schema
 */
const inventoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['weapon', 'armor', 'potion', 'scroll', 'wondrous', 'tool', 'gear', 'treasure', 'other']),
  quantity: z.number().int().min(0),
  weight: z.number().min(0),
  value: z.number().min(0),
  description: z.string().optional(),
  equipped: z.boolean(),
  attuned: z.boolean(),
  magical: z.boolean(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact']).optional(),
  properties: z.array(z.string()).optional(),
});

/**
 * Currency Schema
 */
const currencySchema = z.object({
  copper: z.number().int().min(0),
  silver: z.number().int().min(0),
  electrum: z.number().int().min(0),
  gold: z.number().int().min(0),
  platinum: z.number().int().min(0),
});

/**
 * Spell Slot Schema
 */
const spellSlotSchema = z.object({
  level: z.number().int().min(1).max(9),
  total: z.number().int().min(0),
  used: z.number().int().min(0),
});

/**
 * Concentration Schema
 */
const concentrationSchema = z.object({
  spell: z.string(),
  effectIds: z.array(z.string()),
});

/**
 * Effect Schema (simplified for Character validation)
 */
const effectSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  description: z.string(),
  source: z.enum(['player', 'dm', 'system']),
  appliedBy: z.string(),
  appliedTo: z.string(),
  effectType: z.enum(['spell', 'item', 'feature', 'condition']),
  durationType: z.enum(['rounds', 'saves', 'time', 'permanent']),
  roundsRemaining: z.number().int().min(0).optional(),
  saveRequired: z.object({
    ability: z.enum(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']),
    dc: z.number().int().min(1).max(30),
    timing: z.enum(['start', 'end']),
  }).optional(),
  timeExpiry: z.string().optional(),
  mechanics: z.object({
    advantageOn: z.array(z.string()).optional(),
    disadvantageOn: z.array(z.string()).optional(),
    bonuses: z.array(z.object({
      type: z.string(),
      value: z.string(),
    })).optional(),
    damagePerRound: z.object({
      amount: z.number(),
      type: z.string(),
      timing: z.enum(['start', 'end']).optional(),
    }).optional(),
    requiresConcentration: z.boolean().optional(),
    temporaryHitPoints: z.number().optional(),
  }),
  createdAt: z.string(),
});

/**
 * Main Character Schema
 */
export const characterSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  race: z.string(),
  classes: z.array(characterClassSchema),
  level: z.number().int().min(1).max(20),
  background: z.string(),
  alignment: z.string(),
  experiencePoints: z.number().int().min(0),

  abilityScores: abilityScoresSchema,

  maxHitPoints: z.number().int().min(1),
  currentHitPoints: z.number().int().min(0),
  temporaryHitPoints: z.number().int().min(0),
  hitDice: z.array(hitDiceSchema),

  armorClass: z.number().int().min(0),
  initiative: z.number(),
  speed: z.number().int().min(0),

  proficiencyBonus: z.number().int().min(0),
  savingThrows: z.array(z.enum(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'])),
  skills: z.array(skillSchema),

  features: z.array(z.string()),
  traits: z.array(z.string()),

  equipment: z.array(z.string()),
  inventory: z.array(inventoryItemSchema),
  currency: currencySchema,
  carriedWeight: z.number().min(0),
  maxCarryWeight: z.number().min(0),

  spellcastingAbility: z.enum(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']).optional(),
  spellSlots: z.array(spellSlotSchema).optional(),
  knownSpells: z.array(z.string()).optional(),
  preparedSpells: z.array(z.string()).optional(),

  effects: z.array(effectSchema),
  concentration: concentrationSchema.optional(),
  exhaustionLevel: z.number().int().min(0).max(6),

  campaignId: z.string().optional(),
  playerId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  avatarUrl: z.string().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => data.currentHitPoints <= data.maxHitPoints,
  {
    message: 'Current HP cannot exceed max HP',
    path: ['currentHitPoints'],
  }
);

export type Character = z.infer<typeof characterSchema>;

/**
 * Validation result type
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Validate a character object
 */
export function validateCharacter(data: unknown): ValidationResult<Character> {
  const result = characterSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const messages = result.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
  return { success: false, error: messages.join(', ') };
}

/**
 * Validate a character object partially (for updates)
 */
export function validatePartialCharacter(data: unknown): ValidationResult<Partial<Character>> {
  const result = characterSchema.partial().safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const messages = result.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
  return { success: false, error: messages.join(', ') };
}
