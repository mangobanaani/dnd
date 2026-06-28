"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Monster, MonsterFilters, MonsterSort, crToNumber } from '@/app/types/monster';

export function useMonsterSearch(monsters: Monster[], favoriteNames: string[] = []) {
  const [filters, setFilters] = useState<MonsterFilters>({
    name: '',
    size: [],
    type: [],
    crMin: 0,
    crMax: 30,
    environment: [],
    legendary: undefined,
    spellcaster: undefined,
    sourceBook: [],
    customOnly: undefined,
    officialOnly: undefined,
    favoriteOnly: undefined,
  });

  const [sort, setSort] = useState<MonsterSort>({
    field: 'name',
    direction: 'asc',
  });

  // Debounced name search
  const [nameInput, setNameInput] = useState('');
  const [debouncedName, setDebouncedName] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedName(nameInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [nameInput]);

  const filteredMonsters = useMemo(() => {
    return monsters.filter((monster) => {
      // Name search (debounced) - also search in abilities, actions, reaction
      if (debouncedName) {
        const searchLower = debouncedName.toLowerCase();
        const nameMatch = monster.name.toLowerCase().includes(searchLower);
        const typeMatch = monster.type.toLowerCase().includes(searchLower);
        const abilitiesMatch = monster.abilities?.toLowerCase().includes(searchLower);
        const actionsMatch = monster.actions?.toLowerCase().includes(searchLower);
        const reactionMatch = monster.reaction?.toLowerCase().includes(searchLower);

        if (!nameMatch && !typeMatch && !abilitiesMatch && !actionsMatch && !reactionMatch) {
          return false;
        }
      }

      // Size filter
      if (filters.size && filters.size.length > 0 && !filters.size.includes(monster.size)) {
        return false;
      }

      // Type filter
      if (filters.type && filters.type.length > 0) {
        const monsterBaseType = monster.type.split('(')[0].trim();
        if (!filters.type.includes(monsterBaseType)) {
          return false;
        }
      }

      // CR range filter
      const monsterCR = crToNumber(monster.cr);
      if (filters.crMin !== undefined && monsterCR < filters.crMin) {
        return false;
      }
      if (filters.crMax !== undefined && monsterCR > filters.crMax) {
        return false;
      }

      // Environment filter
      if (filters.environment && filters.environment.length > 0) {
        const hasMatchingEnvironment = filters.environment.some(
          (env) => monster.environments[env as keyof typeof monster.environments]
        );
        if (!hasMatchingEnvironment) {
          return false;
        }
      }

      // Legendary filter
      if (filters.legendary !== undefined && monster.legendaryActions !== filters.legendary) {
        return false;
      }

      // Spellcaster filter
      if (filters.spellcaster !== undefined && monster.spellUser !== filters.spellcaster) {
        return false;
      }

      // Source book filter
      if (filters.sourceBook && filters.sourceBook.length > 0 && !filters.sourceBook.includes(monster.sourceBook)) {
        return false;
      }

      // Custom monster filter
      if (filters.customOnly && !monster.isCustom) {
        return false;
      }

      // Official monster filter
      if (filters.officialOnly && monster.isCustom) {
        return false;
      }

      // Favorite filter
      if (filters.favoriteOnly && !favoriteNames.includes(monster.name)) {
        return false;
      }

      return true;
    });
  }, [monsters, debouncedName, filters, favoriteNames]);

  const updateFilter = useCallback(<K extends keyof MonsterFilters>(
    key: K,
    value: MonsterFilters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Sorted monsters
  const sortedMonsters = useMemo(() => {
    const sorted = [...filteredMonsters];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'cr':
          comparison = crToNumber(a.cr) - crToNumber(b.cr);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'size':
          const sizeOrder = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal'];
          comparison = sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size);
          break;
        case 'ac':
          const aAC = a.ac ?? a.armor_class ?? 0;
          const bAC = b.ac ?? b.armor_class ?? 0;
          comparison = aAC - bAC;
          break;
        case 'hp':
          const aHP = a.hp ?? a.hit_points ?? 0;
          const bHP = b.hp ?? b.hit_points ?? 0;
          comparison = aHP - bHP;
          break;
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredMonsters, sort]);

  const resetFilters = useCallback(() => {
    setFilters({
      name: '',
      size: [],
      type: [],
      crMin: 0,
      crMax: 30,
      environment: [],
      legendary: undefined,
      spellcaster: undefined,
      sourceBook: [],
      customOnly: undefined,
      officialOnly: undefined,
      favoriteOnly: undefined,
    });
    setNameInput('');
    setDebouncedName('');
  }, []);

  const updateSort = useCallback((field: MonsterSort['field']) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const setSortDirection = useCallback((direction: MonsterSort['direction']) => {
    setSort((prev) => ({ ...prev, direction }));
  }, []);

  const stats = useMemo(() => {
    return {
      total: monsters.length,
      filtered: filteredMonsters.length,
      legendary: filteredMonsters.filter((m) => m.legendaryActions).length,
      spellcasters: filteredMonsters.filter((m) => m.spellUser).length,
      withLairActions: filteredMonsters.filter((m) => m.lairActions).length,
    };
  }, [monsters, filteredMonsters]);

  return {
    monsters: filteredMonsters,
    sortedMonsters,
    filters,
    updateFilter,
    resetFilters,
    stats,
    sort,
    updateSort,
    setSortDirection,
    nameInput,
    setNameInput,
  };
}
