import { Monster } from '@/app/types/monster';
import { customMonsterRepository } from '@/app/lib/repositories/custom-monster.repository';

/**
 * Custom Monster with required ID field for storage
 */
export interface CustomMonster extends Monster {
  id: string;
  isCustom: true;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service for managing custom (user-created) monsters.
 * Delegates persistence to customMonsterRepository (Supabase).
 */
class CustomMonsterServiceClass {
  /**
   * Create a new custom monster.
   *
   * @param monster - Monster data (without id, isCustom, timestamps)
   * @returns The created monster with generated ID and metadata
   */
  async create(monster: Omit<Monster, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>): Promise<CustomMonster> {
    const now = new Date().toISOString();
    const customMonster: CustomMonster = {
      ...monster,
      id: crypto.randomUUID(),
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    } as CustomMonster;

    return customMonsterRepository.add(customMonster);
  }

  /**
   * Update an existing custom monster.
   *
   * @param id      - ID of the monster to update
   * @param updates - Partial monster data to update
   * @returns The updated monster
   * @throws {Error} If monster with given ID is not found
   */
  async updateMonster(id: string, updates: Partial<Monster>): Promise<CustomMonster> {
    const existing = await customMonsterRepository.getById(id);
    if (!existing) {
      throw new Error(`Custom monster with id ${id} not found`);
    }

    const updated: CustomMonster = {
      ...existing,
      ...updates,
      id,                              // id must not change
      isCustom: true,                  // flag must persist
      createdAt: existing.createdAt,   // preserve creation timestamp
      updatedAt: new Date().toISOString(),
    };

    return customMonsterRepository.update(id, updated);
  }

  /**
   * Get all custom monsters, sorted by creation date (newest first).
   *
   * @returns Array of custom monsters
   */
  async getAllCustomMonsters(): Promise<CustomMonster[]> {
    const monsters = await customMonsterRepository.list();
    return monsters.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Delete a custom monster by ID.
   *
   * @param id - ID of the monster to delete
   */
  async deleteMonster(id: string): Promise<void> {
    return customMonsterRepository.remove(id);
  }

  /**
   * Check if a monster name already exists (case-insensitive).
   *
   * @param name      - Monster name to check
   * @param excludeId - Optional ID to exclude from check (for updates)
   * @returns True if name exists, false otherwise
   */
  async nameExists(name: string, excludeId?: string): Promise<boolean> {
    return customMonsterRepository.nameExists(name, excludeId);
  }
}

// Export singleton instance
export const CustomMonsterService = new CustomMonsterServiceClass();
