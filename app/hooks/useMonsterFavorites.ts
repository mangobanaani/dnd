"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Monster } from '@/app/types/monster';
import { MonsterFavoritesService } from '@/app/lib/services/monster-favorites.service';

export interface UseMonsterFavoritesReturn {
  favoriteNames: string[];
  loading: boolean;
  isFavorite: (name: string) => boolean;
  toggleFavorite: (monster: Monster) => Promise<void>;
}

export function useMonsterFavorites(): UseMonsterFavoritesReturn {
  const [favoriteNames, setFavoriteNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Keep a ref so toggleFavorite stays stable across favoriteNames changes
  const favoriteNamesRef = useRef<string[]>(favoriteNames);
  favoriteNamesRef.current = favoriteNames;

  useEffect(() => {
    let cancelled = false;
    MonsterFavoritesService.getAll()
      .then((names) => {
        if (!cancelled) {
          setFavoriteNames(names);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('[useMonsterFavorites] Failed to load favorites:', err);
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Recreated only when favoriteNames changes — callers get updated results reactively
  const isFavorite = useCallback(
    (name: string): boolean => favoriteNames.includes(name),
    [favoriteNames]
  );

  // Stable reference — reads current state from ref, not closure
  const toggleFavorite = useCallback(async (monster: Monster): Promise<void> => {
    const name = monster.name;
    const wasAlreadyFavorite = favoriteNamesRef.current.includes(name);

    // Optimistic update
    setFavoriteNames((prev) =>
      wasAlreadyFavorite ? prev.filter((n) => n !== name) : [...prev, name]
    );

    try {
      await MonsterFavoritesService.toggle(name);
    } catch (err) {
      console.error('[useMonsterFavorites] Failed to toggle favorite:', err);
      // Revert optimistic update on failure
      setFavoriteNames((prev) =>
        wasAlreadyFavorite ? [...prev, name] : prev.filter((n) => n !== name)
      );
    }
  }, []); // intentionally empty — uses ref for current state

  return { favoriteNames, loading, isFavorite, toggleFavorite };
}
