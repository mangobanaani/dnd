# Comprehensive Playwright Test Suite for D&D Campaign Manager

This directory contains comprehensive Playwright tests for the entire D&D Campaign Manager application, covering campaigns, characters, combat, monsters, encounters, and their cross-interactions.

## Test Coverage Summary

**Total: 223 tests - All passing (1.2s execution time)**

### Test Suites

1. **Campaign Tests** (`campaigns.spec.ts`) - 43 tests
2. **Character Tests** (`characters.spec.ts`) - 38 tests
3. **Combat Tests** (`combat.spec.ts`) - 36 tests
4. **Monster & Encounter Tests** (`monsters-encounters.spec.ts`) - 43 tests
5. **CSV Parsing Tests** (`parse-monsters-full.spec.ts`) - 40 tests
6. **Integration Tests** (`integration.spec.ts`) - 23 tests

---

## 1. Campaign Management Tests (43 tests)

### Campaign Type & Structure
- Campaign structure validation
- Valid campaign statuses (planning, active, on-hold, completed)
- Valid difficulty levels (easy, normal, hard, deadly)
- Valid D&D editions (5e, 2024)

### Campaign Creation & Defaults
- Default campaign creation with correct structure
- ISO timestamp validation
- Default values for new campaigns

### Campaign Validation
- Name requirement and length validation
- Description length validation
- Input sanitization

### Campaign Status & Difficulty Functions
- Status color coding (text and background)
- Status labels
- Difficulty color coding
- Difficulty labels

### Campaign Date Functions
- Campaign date formatting
- Duration calculation
- Future date handling

### Campaign Sessions
- Session structure validation
- XP tracking
- Treasure tracking
- Duration tracking in minutes

### Campaign Quests
- Quest structure and status validation
- Objective tracking (completed/incomplete)
- Optional vs required objectives
- Quest rewards and quest givers

### Campaign Integration
- Linking campaigns to sessions and quests
- Session count tracking
- Party level progression
- Player and character list management
- Next session scheduling

### Campaign Metadata
- Tag support
- Public/private visibility
- Image URLs
- Homebrew flags

### Campaign Lifecycle
- Status transitions
- Creation and update timestamps
- Completed campaign validation

---

## 2. Character Management Tests (38 tests)

### Character Structure
- Complete character data validation
- All six ability scores (STR, DEX, CON, INT, WIS, CHA)
- Class information with hit dice

### Ability Score Calculations
- Ability modifier calculations
- Modifier formatting with signs (+/-)
- Proficiency bonus by level

### Skill Calculations
- Skill modifiers with proficiency
- Skill modifiers with expertise (double proficiency)
- Non-proficient skill calculations

### Saving Throw Calculations
- Saving throws with proficiency
- Saving throws without proficiency

### Experience & Leveling
- XP requirements per level
- Level calculation from XP
- Multiclassing total level calculation
- Character XP validation

### Hit Points
- Current HP vs Max HP validation
- Temporary HP tracking
- Hit dice tracking

### Inventory & Equipment
- Inventory item tracking
- Weight calculations
- Value calculations
- Max carry weight (Strength × 15)
- Currency tracking (copper, silver, gold, platinum)
- Equipped and attuned item tracking

### Spellcasting
- Spell slot tracking and usage
- Known and prepared spells
- Spellcasting ability
- Non-spellcasters validation

### Character Creation
- Default character generation
- Default ability scores (all 10s)

### Character Integration
- Campaign linking
- Class-specific ability validation (Fighter/STR, Wizard/INT, Rogue/DEX)
- Expertise validation for Rogues

### Features & Traits
- Class features
- Racial traits
- Class-specific feature validation

---

## 3. Combat System Tests (36 tests)

### Combat Structure
- Combatant structure validation
- Encounter structure validation

### Initiative System
- Initiative roll validation (d20)
- Initiative modifier application
- Sorting combatants by initiative
- Tiebreaker using initiative modifier

### Hit Points
- HP percentage calculations
- HP color coding (green/yellow/red/gray)
- HP text color
- Dead combatant detection
- Bloodied combatant detection (≤50% HP)

### Damage & Healing
- Damage application to current HP
- Temporary HP damage absorption
- Damage overflow from temp HP
- HP floor at 0
- Healing application
- Healing cap at max HP

### Conditions
- Condition structure validation
- Adding conditions to combatants
- Preventing duplicate conditions
- Removing conditions
- Duration decrement each turn
- Expired condition removal
- Permanent condition handling (duration: -1)
- D&D 5e condition descriptions

### Combat Encounter Management
- Round tracking
- Turn tracking
- Combat log maintenance
- Campaign linking

### Combatant Types
- Player, monster, and NPC differentiation
- Character ID linking for players
- Default combatant creation

### Combat Integration
- Character-to-combatant integration
- Stat synchronization (HP, AC)
- Initiative ordering
- Condition tracking in combat

---

## 4. Monster & Encounter Tests (43 tests)

### Monster Structure
- Monster data validation
- Environment flag validation (12 environments)
- Boolean ability flags (spellUser, legendary, lair)

### Challenge Rating
- CR string to number conversion
- CR to XP conversion
- XP validation for test monsters

### Encounter Building
- Encounter multiplier calculation by monster count
- Adjusted XP for single monsters
- Adjusted XP for multiple monsters
- Mixed encounter XP calculation

### Monster Types & Sizes
- Size validation (Tiny to Gargantuan)
- Type validation
- Specific monster size validation

### Monster Abilities
- Legendary action validation
- Lair action validation
- Spellcasting validation
- Non-legendary monster validation

### Monster Environments
- Environment-specific monster validation
- Multi-environment filtering

### Monster Actions & Abilities
- Action and ability text validation
- Special ability validation (Nimble Escape, Aggressive)
- Breath weapon validation

### Monster Movement
- Flying movement validation
- Swimming movement validation
- Ground movement (empty string)

### Monster Source Information
- Source book tracking
- Page number tracking
- Monster Manual references

### Encounter Difficulty
- Party level difficulty thresholds
- Deadly encounter validation
- Difficulty scaling with monster count

---

## 5. CSV Parsing Tests (40 tests)

Comprehensive tests for the monster CSV parser including:
- CSV parsing with quoted fields
- Boolean flag conversion
- Environment parsing
- Monster grouping by CR, type, and environment
- Statistics generation
- Edge cases and error handling

---

## 6. Integration Tests (23 tests)

### Campaign-Character Integration
- Character membership in campaigns
- Character levels matching campaign level
- XP requirements
- Balanced party composition

### Character-Combat Integration
- Combatant references to characters
- Stat synchronization
- Initiative modifier matching

### Monster-Encounter-Combat Integration
- Encounter balance against party
- Monster stats in combat
- Deadly encounter validation

### Campaign-Quest-Session Integration
- Quest belonging to campaigns
- Session XP tracking
- Quest objective progression
- Session count validation

### Full Combat Simulation
- Complete combat round simulation
- Combat statistics tracking
- Condition effects in combat

### Party vs Monster Balance
- Level-appropriate encounters
- CR-based difficulty validation
- Action economy effects

### Character Progression
- XP gain from encounters
- Proficiency bonus scaling
- Feature acquisition

### Campaign Milestones
- Quest completion tracking
- Session progress
- Campaign completion validation

### Cross-System Data Consistency
- ID uniqueness across entities
- Timestamp validation
- Reference integrity

---

## Running the Tests

```bash
# Run all tests
npm run test:e2e

# Run tests in UI mode
npm run test:e2e:ui

# View HTML report
npm run test:e2e:report
```

## Test Fixtures

Located in `tests/fixtures/`:
- `test-data.ts` - Comprehensive test data including:
  - 3 campaigns (active, planning, completed)
  - 3 characters (Fighter, Wizard, Rogue)
  - 4 monsters (Goblin, Orc, Dragon, Owlbear)
  - 5 combatants in a combat encounter
  - Sessions, quests, and conditions
- `test-monsters.csv` - CSV test data for parser tests

## Test Results

**223 passing (1.2s)**

All cross-interactions between campaigns, characters, monsters, encounters, and combat are validated, ensuring a robust and well-integrated D&D campaign management system.
