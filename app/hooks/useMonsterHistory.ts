"use client";

import { useState, useEffect, useCallback } from 'react';
import { MonsterHistoryService, MonsterHistoryEntry } from '@/app/lib/services/monster-history.service';

const RECENT_LIMIT = 5;

export interface UseMonsterHistoryReturn {
  recentHistory: MonsterHistoryEntry[];
  recordView: (monsterName: string) => void;
}

export function useMonsterHistory(): UseMonsterHistoryReturn {
  const [recentHistory, setRecentHistory] = useState<MonsterHistoryEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    MonsterHistoryService.getRecent(RECENT_LIMIT)
      .then((entries) => {
        if (!cancelled) setRecentHistory(entries);
      })
      .catch((err) => {
        console.error('[useMonsterHistory] Failed to load recent history:', err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Stable reference — optimistically updates local list, then persists in background
  const recordView = useCallback((monsterName: string): void => {
    setRecentHistory((prev) => {
      const existing = prev.find((e) => e.monsterName === monsterName);
      const entry: MonsterHistoryEntry = {
        monsterName,
        viewCount: (existing?.viewCount ?? 0) + 1,
        lastViewed: new Date().toISOString(),
      };
      const filtered = prev.filter((e) => e.monsterName !== monsterName);
      return [entry, ...filtered].slice(0, RECENT_LIMIT);
    });

    MonsterHistoryService.recordView(monsterName).catch((err) => {
      console.error('[useMonsterHistory] Failed to record view:', err);
    });
  }, []);

  return { recentHistory, recordView };
}
