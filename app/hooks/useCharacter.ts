"use client";

import { useState, useCallback, useMemo } from 'react';
import {
  Character,
  AbilityScores,
  Skill,
  createDefaultCharacter,
  calculateModifier,
  calculateProficiencyBonus,
  calculateSkillModifier,
  calculateSavingThrow,
  getTotalLevel,
} from '@/app/types/character';
import { MINIMUM_HIT_POINTS } from '@/app/lib/constants/dnd-rules';

export function useCharacter(initialCharacter?: Character) {
  const [character, setCharacter] = useState<Character | null>(
    initialCharacter || null
  );

  // Create new character
  const createCharacter = useCallback((playerId: string) => {
    const newCharacter: Character = {
      id: crypto.randomUUID(),
      ...createDefaultCharacter(playerId),
    };
    setCharacter(newCharacter);
    return newCharacter;
  }, []);

  // Update character fields
  const updateCharacter = useCallback(
    (updates: Partial<Character>) => {
      setCharacter((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      });
    },
    []
  );

  // Update ability scores
  const updateAbilityScore = useCallback(
    (ability: keyof AbilityScores, value: number) => {
      setCharacter((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          abilityScores: {
            ...prev.abilityScores,
            [ability]: value,
          },
          updatedAt: new Date().toISOString(),
        };
      });
    },
    []
  );

  // Update skill proficiency
  const updateSkillProficiency = useCallback(
    (skillName: string, proficient: boolean, expertise: boolean = false) => {
      setCharacter((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          skills: prev.skills.map((skill) =>
            skill.name === skillName
              ? { ...skill, proficient, expertise }
              : skill
          ),
          updatedAt: new Date().toISOString(),
        };
      });
    },
    []
  );

  // Update HP
  const updateHitPoints = useCallback(
    (current: number, max?: number, temp?: number) => {
      setCharacter((prev) => {
        if (!prev) return null;
        const updates: Partial<Character> = {
          currentHitPoints: Math.max(MINIMUM_HIT_POINTS, current),
          updatedAt: new Date().toISOString(),
        };
        if (max !== undefined) {
          updates.maxHitPoints = max;
        }
        if (temp !== undefined) {
          updates.temporaryHitPoints = temp;
        }
        return { ...prev, ...updates };
      });
    },
    []
  );

  // Apply damage
  const takeDamage = useCallback((damage: number) => {
    setCharacter((prev) => {
      if (!prev) return null;

      let remainingDamage = damage;
      let newTempHP = prev.temporaryHitPoints;
      let newCurrentHP = prev.currentHitPoints;

      // First, apply to temp HP
      if (newTempHP > 0) {
        if (newTempHP >= remainingDamage) {
          newTempHP -= remainingDamage;
          remainingDamage = 0;
        } else {
          remainingDamage -= newTempHP;
          newTempHP = 0;
        }
      }

      // Then apply to current HP
      if (remainingDamage > 0) {
        newCurrentHP = Math.max(MINIMUM_HIT_POINTS, newCurrentHP - remainingDamage);
      }

      return {
        ...prev,
        currentHitPoints: newCurrentHP,
        temporaryHitPoints: newTempHP,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  // Heal
  const heal = useCallback((amount: number) => {
    setCharacter((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        currentHitPoints: Math.min(
          prev.maxHitPoints,
          prev.currentHitPoints + amount
        ),
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  // Computed values
  const computed = useMemo(() => {
    if (!character) {
      return null;
    }

    const level = getTotalLevel(character.classes);
    const proficiencyBonus = calculateProficiencyBonus(level);

    // Ability modifiers
    const modifiers = {
      strength: calculateModifier(character.abilityScores.strength),
      dexterity: calculateModifier(character.abilityScores.dexterity),
      constitution: calculateModifier(character.abilityScores.constitution),
      intelligence: calculateModifier(character.abilityScores.intelligence),
      wisdom: calculateModifier(character.abilityScores.wisdom),
      charisma: calculateModifier(character.abilityScores.charisma),
    };

    // Initiative
    const initiative = modifiers.dexterity;

    // Saving throws
    const savingThrows = {
      strength: calculateSavingThrow(
        'strength',
        character.abilityScores,
        character.savingThrows,
        proficiencyBonus
      ),
      dexterity: calculateSavingThrow(
        'dexterity',
        character.abilityScores,
        character.savingThrows,
        proficiencyBonus
      ),
      constitution: calculateSavingThrow(
        'constitution',
        character.abilityScores,
        character.savingThrows,
        proficiencyBonus
      ),
      intelligence: calculateSavingThrow(
        'intelligence',
        character.abilityScores,
        character.savingThrows,
        proficiencyBonus
      ),
      wisdom: calculateSavingThrow(
        'wisdom',
        character.abilityScores,
        character.savingThrows,
        proficiencyBonus
      ),
      charisma: calculateSavingThrow(
        'charisma',
        character.abilityScores,
        character.savingThrows,
        proficiencyBonus
      ),
    };

    // Skill modifiers
    const skillModifiers = character.skills.map((skill) => ({
      ...skill,
      modifier: calculateSkillModifier(
        skill,
        character.abilityScores,
        proficiencyBonus
      ),
    }));

    // Passive Perception
    const perceptionSkill = character.skills.find((s) => s.name === 'Perception');
    const passivePerception = perceptionSkill
      ? 10 +
        calculateSkillModifier(perceptionSkill, character.abilityScores, proficiencyBonus)
      : 10 + modifiers.wisdom;

    return {
      level,
      proficiencyBonus,
      modifiers,
      initiative,
      savingThrows,
      skillModifiers,
      passivePerception,
    };
  }, [character]);

  return {
    character,
    computed,
    createCharacter,
    updateCharacter,
    updateAbilityScore,
    updateSkillProficiency,
    updateHitPoints,
    takeDamage,
    heal,
  };
}
