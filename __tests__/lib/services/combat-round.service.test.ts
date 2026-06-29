/**
 * Combat Round Manager Tests
 * Tests for turn progression, round advancement, and effect ticking
 */

import {
  CombatRoundService,
  CombatState,
  TurnAdvanceResult,
  SavePrompt,
} from '@/app/lib/services/combat-round.service';
import { Combatant } from '@/app/types/combat';
import { createEffect } from '@/app/types/effects';

describe('CombatRoundService', () => {
  let service: CombatRoundService;
  let mockCombatants: Combatant[];

  beforeEach(() => {
    service = new CombatRoundService();

    mockCombatants = [
      {
        id: 'combat-1',
        name: 'Fighter',
        type: 'player',
        initiative: 20,
        initiativeModifier: 2,
        maxHitPoints: 50,
        currentHitPoints: 50,
        temporaryHitPoints: 0,
        ac: 18,
        isActive: true,
        conditions: [],
        effects: [],
        exhaustionLevel: 0,
        addedAt: new Date().toISOString(),
      },
      {
        id: 'combat-2',
        name: 'Wizard',
        type: 'player',
        initiative: 15,
        initiativeModifier: 3,
        maxHitPoints: 30,
        currentHitPoints: 30,
        temporaryHitPoints: 0,
        ac: 14,
        isActive: true,
        conditions: [],
        effects: [],
        exhaustionLevel: 0,
        addedAt: new Date().toISOString(),
      },
      {
        id: 'combat-3',
        name: 'Goblin',
        type: 'monster',
        initiative: 12,
        initiativeModifier: 2,
        maxHitPoints: 15,
        currentHitPoints: 15,
        temporaryHitPoints: 0,
        ac: 13,
        isActive: true,
        conditions: [],
        effects: [],
        exhaustionLevel: 0,
        addedAt: new Date().toISOString(),
      },
    ];
  });

  describe('advanceTurn', () => {
    it('should advance to next combatant', () => {
      const state: CombatState = {
        combatants: mockCombatants,
        currentRound: 1,
        currentTurnIndex: 0,
      };

      const result = service.advanceTurn(state);

      expect(result.currentTurnIndex).toBe(1);
      expect(result.currentRound).toBe(1);
      expect(result.currentCombatant.name).toBe('Wizard');
    });

    it('should wrap to beginning and increment round', () => {
      const state: CombatState = {
        combatants: mockCombatants,
        currentRound: 1,
        currentTurnIndex: 2, // Last combatant
      };

      const result = service.advanceTurn(state);

      expect(result.currentTurnIndex).toBe(0);
      expect(result.currentRound).toBe(2);
      expect(result.currentCombatant.name).toBe('Fighter');
    });

    it('should skip inactive combatants', () => {
      mockCombatants[1].isActive = false; // Disable Wizard

      const state: CombatState = {
        combatants: mockCombatants,
        currentRound: 1,
        currentTurnIndex: 0,
      };

      const result = service.advanceTurn(state);

      expect(result.currentTurnIndex).toBe(2);
      expect(result.currentCombatant.name).toBe('Goblin');
    });

    it('should tick effects when advancing to new round', () => {
      const blessEffect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'combat-1',
        durationType: 'rounds',
        roundsRemaining: 3,
      });

      mockCombatants[0].effects = [blessEffect];

      const state: CombatState = {
        combatants: mockCombatants,
        currentRound: 1,
        currentTurnIndex: 2, // Last combatant
      };

      const result = service.advanceTurn(state);

      expect(result.currentRound).toBe(2);
      expect(result.combatants[0].effects[0].roundsRemaining).toBe(2);
    });

    it('should remove expired effects', () => {
      const blessEffect = createEffect({
        name: 'Bless',
        appliedBy: 'user-1',
        appliedTo: 'combat-1',
        durationType: 'rounds',
        roundsRemaining: 1,
      });

      mockCombatants[0].effects = [blessEffect];

      const state: CombatState = {
        combatants: mockCombatants,
        currentRound: 1,
        currentTurnIndex: 2,
      };

      const result = service.advanceTurn(state);

      expect(result.combatants[0].effects).toHaveLength(0);
    });
  });

  describe('getRequiredSaves', () => {
    it('should identify end-of-turn saves', () => {
      const poisonEffect = createEffect({
        name: 'Poisoned',
        appliedBy: 'dm-1',
        appliedTo: 'combat-1',
        durationType: 'saves',
        source: 'dm',
        saveRequired: {
          ability: 'CON',
          dc: 12,
          timing: 'end',
        },
      });

      mockCombatants[0].effects = [poisonEffect];

      const state: CombatState = {
        combatants: mockCombatants,
        currentRound: 1,
        currentTurnIndex: 0,
      };

      const saves = service.getRequiredSaves(state, 'end');

      expect(saves).toHaveLength(1);
      expect(saves[0].combatantId).toBe('combat-1');
      expect(saves[0].ability).toBe('CON');
      expect(saves[0].dc).toBe(12);
      expect(saves[0].effectName).toBe('Poisoned');
    });

    it('should identify start-of-turn saves', () => {
      const stunnedEffect = createEffect({
        name: 'Stunned',
        appliedBy: 'dm-1',
        appliedTo: 'combat-2',
        durationType: 'saves',
        source: 'dm',
        saveRequired: {
          ability: 'CON',
          dc: 14,
          timing: 'start',
        },
      });

      mockCombatants[1].effects = [stunnedEffect];

      const state: CombatState = {
        combatants: mockCombatants,
        currentRound: 1,
        currentTurnIndex: 1,
      };

      const saves = service.getRequiredSaves(state, 'start');

      expect(saves).toHaveLength(1);
      expect(saves[0].combatantId).toBe('combat-2');
      expect(saves[0].effectName).toBe('Stunned');
    });

    it('should return empty array when no saves needed', () => {
      const state: CombatState = {
        combatants: mockCombatants,
        currentRound: 1,
        currentTurnIndex: 0,
      };

      const saves = service.getRequiredSaves(state, 'end');

      expect(saves).toHaveLength(0);
    });

    it('should only return saves for current combatant', () => {
      const effect1 = createEffect({
        name: 'Poisoned',
        appliedBy: 'dm-1',
        appliedTo: 'combat-1',
        durationType: 'saves',
        source: 'dm',
        saveRequired: {
          ability: 'CON',
          dc: 12,
          timing: 'end',
        },
      });

      const effect2 = createEffect({
        name: 'Frightened',
        appliedBy: 'dm-1',
        appliedTo: 'combat-2',
        durationType: 'saves',
        source: 'dm',
        saveRequired: {
          ability: 'WIS',
          dc: 13,
          timing: 'end',
        },
      });

      mockCombatants[0].effects = [effect1];
      mockCombatants[1].effects = [effect2];

      const state: CombatState = {
        combatants: mockCombatants,
        currentRound: 1,
        currentTurnIndex: 0, // Fighter's turn
      };

      const saves = service.getRequiredSaves(state, 'end');

      expect(saves).toHaveLength(1);
      expect(saves[0].combatantId).toBe('combat-1');
    });
  });

  describe('processSaveResult', () => {
    it('should remove effect on successful save', () => {
      const poisonEffect = createEffect({
        name: 'Poisoned',
        appliedBy: 'dm-1',
        appliedTo: 'combat-1',
        durationType: 'saves',
        source: 'dm',
        saveRequired: {
          ability: 'CON',
          dc: 12,
          timing: 'end',
        },
      });

      mockCombatants[0].effects = [poisonEffect];

      const state: CombatState = {
        combatants: mockCombatants,
        currentRound: 1,
        currentTurnIndex: 0,
      };

      const result = service.processSaveResult(state, poisonEffect.id, true);

      expect(result.combatants[0].effects).toHaveLength(0);
    });

    it('should keep effect on failed save', () => {
      const poisonEffect = createEffect({
        name: 'Poisoned',
        appliedBy: 'dm-1',
        appliedTo: 'combat-1',
        durationType: 'saves',
        source: 'dm',
        saveRequired: {
          ability: 'CON',
          dc: 12,
          timing: 'end',
        },
      });

      mockCombatants[0].effects = [poisonEffect];

      const state: CombatState = {
        combatants: mockCombatants,
        currentRound: 1,
        currentTurnIndex: 0,
      };

      const result = service.processSaveResult(state, poisonEffect.id, false);

      expect(result.combatants[0].effects).toHaveLength(1);
    });
  });

  describe('applyStartOfTurnEffects', () => {
    it('should apply damage-per-round effects', () => {
      const burningEffect = createEffect({
        name: 'Burning',
        appliedBy: 'dm-1',
        appliedTo: 'combat-1',
        durationType: 'rounds',
        source: 'dm',
        roundsRemaining: 3,
        mechanics: {
          damagePerRound: { amount: 5, type: 'fire' },
        },
      });

      mockCombatants[0].effects = [burningEffect];
      mockCombatants[0].currentHitPoints = 50;

      const state: CombatState = {
        combatants: mockCombatants,
        currentRound: 1,
        currentTurnIndex: 0,
      };

      const result = service.applyStartOfTurnEffects(state);

      expect(result.combatants[0].currentHitPoints).toBe(45);
      expect(result.damageApplied).toHaveLength(1);
      expect(result.damageApplied[0].amount).toBe(5);
      expect(result.damageApplied[0].type).toBe('fire');
    });

    it('should apply temp HP before real HP', () => {
      const burningEffect = createEffect({
        name: 'Burning',
        appliedBy: 'dm-1',
        appliedTo: 'combat-1',
        durationType: 'rounds',
        source: 'dm',
        roundsRemaining: 3,
        mechanics: {
          damagePerRound: { amount: 5, type: 'fire' },
        },
      });

      mockCombatants[0].effects = [burningEffect];
      mockCombatants[0].currentHitPoints = 50;
      mockCombatants[0].temporaryHitPoints = 10;

      const state: CombatState = {
        combatants: mockCombatants,
        currentRound: 1,
        currentTurnIndex: 0,
      };

      const result = service.applyStartOfTurnEffects(state);

      expect(result.combatants[0].currentHitPoints).toBe(50);
      expect(result.combatants[0].temporaryHitPoints).toBe(5);
    });

    it('should handle multiple damage effects', () => {
      const burningEffect = createEffect({
        name: 'Burning',
        appliedBy: 'dm-1',
        appliedTo: 'combat-1',
        durationType: 'rounds',
        source: 'dm',
        roundsRemaining: 3,
        mechanics: {
          damagePerRound: { amount: 5, type: 'fire' },
        },
      });

      const poisonEffect = createEffect({
        name: 'Poison',
        appliedBy: 'dm-1',
        appliedTo: 'combat-1',
        durationType: 'rounds',
        source: 'dm',
        roundsRemaining: 2,
        mechanics: {
          damagePerRound: { amount: 3, type: 'poison' },
        },
      });

      mockCombatants[0].effects = [burningEffect, poisonEffect];
      mockCombatants[0].currentHitPoints = 50;

      const state: CombatState = {
        combatants: mockCombatants,
        currentRound: 1,
        currentTurnIndex: 0,
      };

      const result = service.applyStartOfTurnEffects(state);

      expect(result.combatants[0].currentHitPoints).toBe(42); // 50 - 5 - 3
      expect(result.damageApplied).toHaveLength(2);
    });
  });

  describe('getCurrentCombatant', () => {
    it('should return current combatant', () => {
      const state: CombatState = {
        combatants: mockCombatants,
        currentRound: 1,
        currentTurnIndex: 1,
      };

      const current = service.getCurrentCombatant(state);

      expect(current!.name).toBe('Wizard');
    });

    it('should handle invalid index', () => {
      const state: CombatState = {
        combatants: mockCombatants,
        currentRound: 1,
        currentTurnIndex: 10, // Out of bounds
      };

      const current = service.getCurrentCombatant(state);

      expect(current).toBeUndefined();
    });
  });

  describe('isRoundComplete', () => {
    it('should return true when at last combatant', () => {
      const state: CombatState = {
        combatants: mockCombatants,
        currentRound: 1,
        currentTurnIndex: 2,
      };

      const isComplete = service.isRoundComplete(state);
      expect(isComplete).toBe(true);
    });

    it('should return false when not at last combatant', () => {
      const state: CombatState = {
        combatants: mockCombatants,
        currentRound: 1,
        currentTurnIndex: 0,
      };

      const isComplete = service.isRoundComplete(state);
      expect(isComplete).toBe(false);
    });
  });
});
