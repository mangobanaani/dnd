# D&D 5e Effects System

Complete implementation of D&D 5e spell effects, conditions, and active mechanical states.

## Overview

The effects system provides:
- **24 Pre-configured Templates** (10 spells + 14 D&D 5e SRD conditions)
- **Full D&D 5e Mechanics** (concentration, advantage/disadvantage, bonuses, saves)
- **Combat Integration** (turn/round management, automatic ticking)
- **React Components** (UI for managing effects)
- **React Hooks** (state management)
- **Data Migration** (backward compatibility)

## Quick Start

### Basic Usage

```typescript
import {
  useEffectManager,
  useEffectTemplates,
  AddEffectModal,
  EffectsList,
} from '@/app/lib/effects';

function CharacterSheet({ character }) {
  const effectManager = useEffectManager(character);
  const templates = useEffectTemplates();

  return (
    <div>
      <EffectsList
        effects={effectManager.effects}
        onEffectClick={(effect) => console.log(effect)}
        removable
        onRemoveEffect={effectManager.removeEffect}
      />

      <AddEffectModal
        isOpen={showModal}
        targetId={character.id}
        appliedBy={userId}
        onAdd={effectManager.addEffect}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
```

### Applying Effects from Templates

```typescript
import { useEffectTemplates } from '@/app/lib/effects';

const templates = useEffectTemplates();

// Apply Bless spell
const blessEffect = templates.applyTemplate('Bless', {
  appliedBy: 'user-1',
  appliedTo: 'char-1',
  roundsRemaining: 5, // Custom duration
});

// Apply Poisoned condition
const poisonEffect = templates.applyTemplate('Poisoned', {
  appliedBy: 'dm-1',
  appliedTo: 'char-1',
  saveRequired: {
    ability: 'CON',
    dc: 15, // Custom DC
    timing: 'end',
  },
});
```

### Managing Effects

```typescript
import { useEffectManager } from '@/app/lib/effects';

const effectManager = useEffectManager(character, {
  onChange: (updated) => {
    // Persist to database/storage
    saveCharacter(updated);
  },
});

// Add effect
effectManager.addEffect(effect);

// Remove effect
effectManager.removeEffect(effectId);

// Update effect
effectManager.updateEffect({ ...effect, roundsRemaining: 5 });

// Tick round (decrement durations)
effectManager.tickRound();

// Break concentration
effectManager.breakConcentration();

// Check if concentrating
if (effectManager.isConcentrating) {
  console.log('Concentrating on:', effectManager.concentration.spell);
}
```

### Combat Integration

```typescript
import {
  applyStartOfTurnEffects,
  getRequiredSavingThrows,
  checkConcentrationDamage,
} from '@/app/lib/effects';

// Start of turn
const { currentHp, temporaryHp, damageLog } = applyStartOfTurnEffects(combatant);

// Get required saves
const saves = getRequiredSavingThrows(combatant, 'start');
saves.forEach((save) => {
  console.log(`Roll ${save.ability} save DC ${save.dc} for ${save.effectName}`);
});

// Concentration check after damage
const check = checkConcentrationDamage(combatant, 25);
if (check) {
  console.log(`Roll CON save DC ${check.dc} or lose concentration on ${check.spell}`);
}
```

### Effect Stacking Rules

```typescript
import { useEffectManager } from '@/app/lib/effects';

const effectManager = useEffectManager(character);

// Check if effect can be applied (D&D 5e stacking rules)
const newEffect = templates.applyTemplate('Bless', { ... });
const stackingResult = effectManager.checkStacking(newEffect);

if (!stackingResult.canApply) {
  console.log('Cannot apply effect:');
  stackingResult.violations.forEach(violation => {
    console.log(`- ${violation.rule}: ${violation.message}`);
  });

  if (stackingResult.suggestion === 'replace') {
    // Remove old effect and add new one
  }
}

// Get advantage/disadvantage state for a check type
const advantageState = effectManager.getAdvantageState('attacks');
console.log(`Net effect: ${advantageState.netEffect}`); // 'advantage' | 'disadvantage' | 'normal'
```

**D&D 5e Stacking Rules Implemented:**
- Same-name effects don't stack (e.g., can't have two Bless effects)
- Temporary HP doesn't stack, keep highest value
- Multiple sources of advantage = single advantage
- Advantage + disadvantage = normal (cancel out)

## Architecture

### Type System

```
Effect
├── id: string
├── name: string
├── icon: string
├── description: string
├── source: EffectSource
├── appliedBy: string
├── appliedTo: string
├── durationType: 'rounds' | 'saves' | 'time' | 'permanent'
├── roundsRemaining?: number
├── saveRequired?: SaveRequirement
├── timeExpiry?: string
└── mechanics: EffectMechanics
    ├── requiresConcentration?: boolean
    ├── bonuses?: Bonus[]
    ├── advantageOn?: string[]
    ├── disadvantageOn?: string[]
    ├── damagePerRound?: DamagePerRound
    └── temporaryHitPoints?: number
```

### Services

- **EffectService** - Core effect management (add, remove, tick, concentration)
- **EffectStackingService** - D&D 5e stacking rules (same-name, advantage/disadvantage, temp HP)
- **ExhaustionService** - D&D 5e exhaustion levels (6 levels with cumulative penalties)
- **CombatRoundService** - Turn/round progression with effects

### Components

- **EffectBadge** - Display single effect (compact badge)
- **EffectsList** - Display/filter/sort effect lists
- **AddEffectModal** - Add effects from templates or custom
- **EffectDetailsModal** - View/edit effect details

### Hooks

- **useEffectManager** - Manage effects with React state
- **useEffectTemplates** - Access/search/apply templates

## Available Templates

### Spells (10)
- Bless - +1d4 to attacks and saves
- Bane - -1d4 to attacks and saves
- Haste - +2 AC, advantage on DEX saves, extra action
- Shield - +5 AC for 1 round
- Shield of Faith - +2 AC
- Guidance - +1d4 to one ability check
- Bardic Inspiration - +1d6 to one check/attack/save
- Aid - +5 max HP for 8 hours
- Hex - +1d6 damage to one target
- Hunter's Mark - +1d6 damage to one target

### Conditions (14 D&D 5e SRD)
- Blinded
- Charmed
- Deafened
- Frightened
- Grappled
- Incapacitated
- Invisible
- Paralyzed
- Petrified
- Poisoned
- Prone
- Restrained
- Stunned
- Unconscious

## Testing

All components are fully tested with 461 tests:
- 263 business logic tests (types, 4 services, factories, migrations, exhaustion)
- 81 UI component tests (4 React components)
- 70 hook and utility tests (2 hooks with stacking, combat integration)
- 47 integration tests (3 comprehensive workflow suites)

Run tests:
```bash
# All effects tests
npm test -- __tests__/components/effects __tests__/hooks __tests__/lib __tests__/integration

# Just integration tests
npm test -- __tests__/integration
```

## Data Migration

The system includes automatic migration from v1 (no effects) to v2 (with effects):

```typescript
import { migrateLocalStorage, needsMigration } from '@/app/lib/effects';

// Check if migration needed
if (needsMigration(character)) {
  character = migrateCharacter(character);
}

// Migrate all localStorage data
const { charactersUpdated } = migrateLocalStorage();
```

## Performance

- All hooks use `useMemo` for expensive computations
- Effect filtering/searching is O(n) with template count
- No unnecessary re-renders
- Optimized for 50+ active effects per character

## Future Enhancements

Potential additions:
- [x] Effect stacking rules (D&D 5e same-name, advantage/disadvantage, temp HP)
- [x] Exhaustion levels (6 levels with cumulative penalties, long rest recovery)
- [ ] Custom effect builder UI
- [ ] Effect import/export
- [ ] More spell templates
- [ ] Legendary resistance tracking
- [ ] Custom conditions
