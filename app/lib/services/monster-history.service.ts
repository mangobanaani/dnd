import { monsterHistoryRepository } from '@/app/lib/repositories/monster-history.repository';

/**
 * Monster view history entry (public API shape — preserved from original).
 */
export interface MonsterHistoryEntry {
  monsterName: string;
  viewCount: number;
  lastViewed: string; // ISO timestamp
}

/**
 * Service for tracking monster view history.
 * Delegates persistence to monsterHistoryRepository (Supabase).
 * The monster's name is used as its identifier in the `monster_id` column.
 *
 * Note: The original localStorage implementation pruned to 50 entries on each
 * write.  With per-user Supabase rows (unique on owner_id + monster_id) there
 * is at most one row per unique monster viewed, so pruning is not needed; the
 * maxEntries limit is still applied client-side when reading.
 */
class MonsterHistoryServiceClass {
  private readonly maxEntries = 50;

  /** Map a repository entity to the public MonsterHistoryEntry shape. */
  private toEntry(entity: { monsterId: string; viewCount: number; viewedAt: string }): MonsterHistoryEntry {
    return {
      monsterName: entity.monsterId,
      viewCount: entity.viewCount,
      lastViewed: entity.viewedAt,
    };
  }

  /**
   * Get all history entries, sorted by most recent first.
   *
   * @returns Array of history entries
   */
  async getAll(): Promise<MonsterHistoryEntry[]> {
    const entities = await monsterHistoryRepository.list(); // already ordered DESC by viewed_at
    return entities.map((e) => this.toEntry(e));
  }

  /**
   * Record a monster view.
   * Increments the view count and updates the timestamp for returning viewers;
   * inserts a new entry for first-time views.
   *
   * @param monsterName - Name of the monster viewed
   */
  async recordView(monsterName: string): Promise<void> {
    return monsterHistoryRepository.upsertView(monsterName);
  }

  /**
   * Get recently viewed monsters (top N).
   *
   * @param limit - Maximum number of entries to return (default: 5)
   * @returns Array of history entries, sorted by most recent first
   */
  async getRecent(limit: number = 5): Promise<MonsterHistoryEntry[]> {
    const entries = await this.getAll();
    return entries.slice(0, Math.min(limit, this.maxEntries));
  }

  /**
   * Get most frequently viewed monsters (top N).
   *
   * @param limit - Maximum number of entries to return (default: 5)
   * @returns Array of history entries, sorted by view count descending
   */
  async getMostViewed(limit: number = 5): Promise<MonsterHistoryEntry[]> {
    const entries = await this.getAll();
    return entries
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  }

  /**
   * Get the view count for a specific monster.
   *
   * @param monsterName - Name of the monster
   * @returns View count, or 0 if never viewed
   */
  async getViewCount(monsterName: string): Promise<number> {
    const entity = await monsterHistoryRepository.findByMonsterId(monsterName);
    return entity?.viewCount ?? 0;
  }

  /**
   * Clear all history.
   */
  async clear(): Promise<void> {
    return monsterHistoryRepository.clearAll();
  }

  /**
   * Remove a specific monster from history.
   *
   * @param monsterName - Name of the monster to remove
   */
  async remove(monsterName: string): Promise<void> {
    return monsterHistoryRepository.removeByMonsterId(monsterName);
  }
}

// Export singleton instance
export const MonsterHistoryService = new MonsterHistoryServiceClass();
