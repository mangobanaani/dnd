import { monsterFavoriteRepository } from '@/app/lib/repositories/monster-favorite.repository';

/**
 * Service for managing monster favorites.
 * Delegates persistence to monsterFavoriteRepository (Supabase).
 * The monster's name is used as its stable identifier in the `monster_id` column.
 */
class MonsterFavoritesServiceClass {
  /**
   * Get all favorited monster names.
   *
   * @returns Array of monster names
   */
  async getAll(): Promise<string[]> {
    return monsterFavoriteRepository.listMonsterIds();
  }

  /**
   * Toggle favorite status for a monster.
   *
   * @param monsterName - Name of the monster
   * @returns True if monster is now favorited, false if unfavorited
   */
  async toggle(monsterName: string): Promise<boolean> {
    const already = await monsterFavoriteRepository.existsByMonsterId(monsterName);

    if (already) {
      await monsterFavoriteRepository.removeByMonsterId(monsterName);
      return false;
    } else {
      await monsterFavoriteRepository.addMonster(monsterName);
      return true;
    }
  }

  /**
   * Add a monster to favorites.
   *
   * @param monsterName - Name of the monster
   */
  async add(monsterName: string): Promise<void> {
    return monsterFavoriteRepository.addMonster(monsterName);
  }

  /**
   * Remove a monster from favorites.
   *
   * @param monsterName - Name of the monster
   */
  async remove(monsterName: string): Promise<void> {
    return monsterFavoriteRepository.removeByMonsterId(monsterName);
  }

  /**
   * Check if a monster is favorited.
   *
   * @param monsterName - Name of the monster
   * @returns True if favorited, false otherwise
   */
  async isFavorite(monsterName: string): Promise<boolean> {
    return monsterFavoriteRepository.existsByMonsterId(monsterName);
  }

  /**
   * Get count of favorited monsters.
   *
   * @returns Number of favorites
   */
  async getCount(): Promise<number> {
    const ids = await monsterFavoriteRepository.listMonsterIds();
    return ids.length;
  }

  /**
   * Clear all favorites.
   */
  async clear(): Promise<void> {
    return monsterFavoriteRepository.clearAll();
  }
}

// Export singleton instance
export const MonsterFavoritesService = new MonsterFavoritesServiceClass();
