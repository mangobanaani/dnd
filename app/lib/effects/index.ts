/**
 * Effects System
 * Barrel export for the complete D&D 5e effects system
 */

// Types
export type {
  Effect,
  EffectSource,
  EffectMechanics,
  DurationType,
  SaveRequirement,
  Concentration,
  EffectType,
} from '@/app/types/effects';

export {
  createEffect,
  createConcentration,
  validateEffect,
  isRoundBasedEffect,
  isSaveBasedEffect,
  isTimeBasedEffect,
} from '@/app/types/effects';

// Services
export { EffectService } from '@/app/lib/services/effect.service';
export type { EffectTarget, ConcentrationCheckResult } from '@/app/lib/services/effect.service';

export { EffectStackingService } from '@/app/lib/services/effect-stacking.service';
export type {
  StackingCheckResult,
  AdvantageDisadvantageResult,
  StackingViolation,
  AllStackingRulesResult,
} from '@/app/lib/services/effect-stacking.service';

export { CombatRoundService } from '@/app/lib/services/combat-round.service';
export type {
  CombatState,
  TurnAdvanceResult,
  SavePrompt,
  StartOfTurnResult as CombatStartOfTurnResult,
} from '@/app/lib/services/combat-round.service';

// Templates
export {
  SPELL_TEMPLATES,
  CONDITION_TEMPLATES,
  applyEffectTemplate,
  getTemplateByName,
  getAllSpellNames,
  getAllConditionNames,
} from '@/app/data/effect-templates';
export type { EffectTemplate, ApplyTemplateParams } from '@/app/data/effect-templates';

// Factories
export {
  createDefaultCharacter,
  createCharacterFromTemplate,
  initializeCharacterEffects,
  addEffectToCharacter,
} from '@/app/lib/factories/character.factory';

export {
  createCombatantFromCharacter,
  createCombatantFromMonster,
  initializeCombatantEffects,
  addEffectToCombatant,
} from '@/app/lib/factories/combatant.factory';

// Migration
export {
  CURRENT_VERSION,
  needsMigration,
  getDataVersion,
  migrateCharacter,
  migrateCombatant,
  migrateAllCharacters,
  migrateAllCombatants,
  migrateLocalStorage,
} from '@/app/lib/migrations/effects-migration';

// Combat Integration
export {
  applyStartOfTurnEffects,
  getRequiredSavingThrows,
  checkConcentrationDamage,
  syncCombatantToCharacter,
  syncCharacterToCombatant,
} from '@/app/lib/utils/combat-effects';
export type {
  DamageLog,
  StartOfTurnResult,
  ConcentrationCheck,
} from '@/app/lib/utils/combat-effects';

// Permissions
export {
  getUserRole,
  isDM,
  isPlayer,
  canApplyEffects,
  canManageCampaign,
} from '@/app/lib/helpers/campaign-role';
export type { Campaign } from '@/app/lib/helpers/campaign-role';

// Components (re-export from components/effects)
export {
  EffectBadge,
  EffectsList,
  AddEffectModal,
  EffectDetailsModal,
} from '@/app/components/effects';
export type {
  EffectBadgeProps,
  EffectsListProps,
  AddEffectModalProps,
  EffectDetailsModalProps,
} from '@/app/components/effects';

// Hooks (re-export from hooks/effects)
export {
  useEffectManager,
  useEffectTemplates,
} from '@/app/hooks/effects';
export type {
  UseEffectManagerOptions,
  UseEffectManagerResult,
  UseEffectTemplatesResult,
} from '@/app/hooks/effects';
