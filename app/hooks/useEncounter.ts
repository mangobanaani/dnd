"use client";

import { useState, useMemo } from 'react';
import { Monster, calculateAdjustedXP, crToXP } from '@/app/types/monster';
import { getXPThreshold } from '@/app/lib/xp-thresholds';

export interface EncounterMonster extends Monster {
  quantity: number;
  instanceId: string;
}

export function useEncounter(initialPartySize: number = 4, initialPartyLevel: number = 5) {
  const [encounterMonsters, setEncounterMonsters] = useState<EncounterMonster[]>([]);
  const [partySize, setPartySize] = useState(initialPartySize);
  const [partyLevel, setPartyLevel] = useState(initialPartyLevel);

  // Add monster to encounter
  const addMonster = (monster: Monster, quantity: number = 1) => {
    const instanceId = `${monster.name}-${Date.now()}`;
    const encounterMonster: EncounterMonster = {
      ...monster,
      quantity,
      instanceId,
    };

    setEncounterMonsters((prev) => {
      // Check if monster already exists
      const existing = prev.find((m) => m.name === monster.name);
      if (existing) {
        return prev.map((m) =>
          m.name === monster.name
            ? { ...m, quantity: m.quantity + quantity }
            : m
        );
      }
      return [...prev, encounterMonster];
    });
  };

  // Remove monster from encounter
  const removeMonster = (instanceId: string) => {
    setEncounterMonsters((prev) => prev.filter((m) => m.instanceId !== instanceId));
  };

  // Update monster quantity
  const updateQuantity = (instanceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeMonster(instanceId);
      return;
    }

    setEncounterMonsters((prev) =>
      prev.map((m) => (m.instanceId === instanceId ? { ...m, quantity } : m))
    );
  };

  // Clear all monsters
  const clearEncounter = () => {
    setEncounterMonsters([]);
  };

  // Calculate encounter difficulty
  const encounterStats = useMemo(() => {
    // Expand monsters by quantity
    const allMonsters: Monster[] = [];
    encounterMonsters.forEach((em) => {
      for (let i = 0; i < em.quantity; i++) {
        allMonsters.push(em);
      }
    });

    const totalMonsters = allMonsters.length;
    const totalXP = allMonsters.reduce((sum, m) => sum + crToXP(m.cr), 0);
    const adjustedXP = calculateAdjustedXP(allMonsters, partySize);

    const thresholds = getXPThreshold(partyLevel, 5);
    const partyEasy = thresholds.easy * partySize;
    const partyMedium = thresholds.medium * partySize;
    const partyHard = thresholds.hard * partySize;
    const partyDeadly = thresholds.deadly * partySize;

    let difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly' = 'trivial';
    if (adjustedXP >= partyDeadly) {
      difficulty = 'deadly';
    } else if (adjustedXP >= partyHard) {
      difficulty = 'hard';
    } else if (adjustedXP >= partyMedium) {
      difficulty = 'medium';
    } else if (adjustedXP >= partyEasy) {
      difficulty = 'easy';
    }

    return {
      totalMonsters,
      uniqueMonsters: encounterMonsters.length,
      totalXP,
      adjustedXP,
      difficulty,
      thresholds: {
        easy: partyEasy,
        medium: partyMedium,
        hard: partyHard,
        deadly: partyDeadly,
      },
    };
  }, [encounterMonsters, partySize, partyLevel]);

  return {
    encounterMonsters,
    partySize,
    partyLevel,
    setPartySize,
    setPartyLevel,
    addMonster,
    removeMonster,
    updateQuantity,
    clearEncounter,
    encounterStats,
  };
}
