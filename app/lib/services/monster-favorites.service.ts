/**
 * Service for managing monster favorites
 * Stores monster names (not full objects) to keep storage lightweight
 */
class MonsterFavoritesServiceClass {
  private readonly key = 'dnd-monster-favorites';

  /**
   * Get all favorited monster names
   *
   * @returns Array of monster names
   */
  getAll(): string[] {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load favorites:', error);
      return [];
    }
  }

  /**
   * Save favorites to localStorage
   *
   * @param favorites - Array of monster names
   */
  private save(favorites: string[]): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to save favorites:', error);
      throw error;
    }
  }

  /**
   * Toggle favorite status for a monster
   *
   * @param monsterName - Name of the monster
   * @returns True if monster is now favorited, false if unfavorited
   */
  toggle(monsterName: string): boolean {
    const favorites = this.getAll();
    const index = favorites.indexOf(monsterName);

    if (index === -1) {
      favorites.push(monsterName);
      this.save(favorites);
      return true;
    } else {
      favorites.splice(index, 1);
      this.save(favorites);
      return false;
    }
  }

  /**
   * Add a monster to favorites
   *
   * @param monsterName - Name of the monster
   */
  add(monsterName: string): void {
    const favorites = this.getAll();
    if (!favorites.includes(monsterName)) {
      favorites.push(monsterName);
      this.save(favorites);
    }
  }

  /**
   * Remove a monster from favorites
   *
   * @param monsterName - Name of the monster
   */
  remove(monsterName: string): void {
    const favorites = this.getAll();
    const filtered = favorites.filter(name => name !== monsterName);
    this.save(filtered);
  }

  /**
   * Check if a monster is favorited
   *
   * @param monsterName - Name of the monster
   * @returns True if favorited, false otherwise
   */
  isFavorite(monsterName: string): boolean {
    const favorites = this.getAll();
    return favorites.includes(monsterName);
  }

  /**
   * Get count of favorited monsters
   *
   * @returns Number of favorites
   */
  getCount(): number {
    return this.getAll().length;
  }

  /**
   * Clear all favorites
   */
  clear(): void {
    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      console.error('Failed to clear favorites:', error);
    }
  }
}

// Export singleton instance
export const MonsterFavoritesService = new MonsterFavoritesServiceClass();
