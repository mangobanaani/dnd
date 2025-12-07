/**
 * Monster view history entry
 */
export interface MonsterHistoryEntry {
  monsterName: string;
  viewCount: number;
  lastViewed: string; // ISO timestamp
}

/**
 * Service for tracking monster view history
 * Maintains recently viewed monsters with view counts
 */
class MonsterHistoryServiceClass {
  private readonly key = 'dnd-monster-history';
  private readonly maxEntries = 50; // Maximum history entries to keep

  /**
   * Get all history entries
   *
   * @returns Array of history entries, sorted by most recent first
   */
  getAll(): MonsterHistoryEntry[] {
    try {
      const data = localStorage.getItem(this.key);
      const entries: MonsterHistoryEntry[] = data ? JSON.parse(data) : [];
      return entries.sort((a, b) =>
        new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime()
      );
    } catch (error) {
      console.error('Failed to load monster history:', error);
      return [];
    }
  }

  /**
   * Save history entries to localStorage
   *
   * @param entries - Array of history entries
   */
  private save(entries: MonsterHistoryEntry[]): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to save monster history:', error);
    }
  }

  /**
   * Record a monster view
   * Increments view count and updates timestamp
   *
   * @param monsterName - Name of the monster viewed
   */
  recordView(monsterName: string): void {
    const entries = this.getAll();
    const existingIndex = entries.findIndex(e => e.monsterName === monsterName);

    if (existingIndex !== -1) {
      // Update existing entry
      entries[existingIndex].viewCount++;
      entries[existingIndex].lastViewed = new Date().toISOString();
    } else {
      // Add new entry
      entries.push({
        monsterName,
        viewCount: 1,
        lastViewed: new Date().toISOString(),
      });
    }

    // Prune to max entries (keep most recently viewed)
    if (entries.length > this.maxEntries) {
      const sorted = entries.sort((a, b) =>
        new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime()
      );
      this.save(sorted.slice(0, this.maxEntries));
    } else {
      this.save(entries);
    }
  }

  /**
   * Get recently viewed monsters (top N)
   *
   * @param limit - Maximum number of entries to return (default: 5)
   * @returns Array of history entries, sorted by most recent first
   */
  getRecent(limit: number = 5): MonsterHistoryEntry[] {
    const entries = this.getAll();
    return entries.slice(0, limit);
  }

  /**
   * Get most frequently viewed monsters (top N)
   *
   * @param limit - Maximum number of entries to return (default: 5)
   * @returns Array of history entries, sorted by view count descending
   */
  getMostViewed(limit: number = 5): MonsterHistoryEntry[] {
    const entries = this.getAll();
    return entries
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  }

  /**
   * Get view count for a specific monster
   *
   * @param monsterName - Name of the monster
   * @returns View count, or 0 if never viewed
   */
  getViewCount(monsterName: string): number {
    const entries = this.getAll();
    const entry = entries.find(e => e.monsterName === monsterName);
    return entry?.viewCount || 0;
  }

  /**
   * Clear all history
   */
  clear(): void {
    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      console.error('Failed to clear monster history:', error);
    }
  }

  /**
   * Remove a specific monster from history
   *
   * @param monsterName - Name of the monster to remove
   */
  remove(monsterName: string): void {
    const entries = this.getAll();
    const filtered = entries.filter(e => e.monsterName !== monsterName);
    this.save(filtered);
  }
}

// Export singleton instance
export const MonsterHistoryService = new MonsterHistoryServiceClass();
