import { StorageService } from './storage.service';
import { Monster } from '@/app/types/monster';

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
 * Service for managing custom (user-created) monsters
 * Extends StorageService to provide CRUD operations
 */
class CustomMonsterServiceClass extends StorageService<CustomMonster> {
  constructor() {
    super('dnd-custom-monsters');
  }

  /**
   * Create a new custom monster
   *
   * @param monster - Monster data (without id, isCustom, timestamps)
   * @returns The created monster with generated ID and metadata
   */
  create(monster: Omit<Monster, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>): CustomMonster {
    const now = new Date().toISOString();
    const customMonster: CustomMonster = {
      ...monster,
      id: crypto.randomUUID(),
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    } as CustomMonster;

    this.add(customMonster);
    return customMonster;
  }

  /**
   * Update an existing custom monster
   *
   * @param id - ID of the monster to update
   * @param updates - Partial monster data to update
   * @returns The updated monster
   * @throws {Error} If monster with given ID is not found
   */
  updateMonster(id: string, updates: Partial<Monster>): CustomMonster {
    const existing = this.getById(id);
    if (!existing) {
      throw new Error(`Custom monster with id ${id} not found`);
    }

    const updated: CustomMonster = {
      ...existing,
      ...updates,
      id, // Ensure id cannot be changed
      isCustom: true, // Ensure isCustom flag persists
      createdAt: existing.createdAt, // Preserve creation timestamp
      updatedAt: new Date().toISOString(), // Update modification timestamp
    };

    this.update(id, updated);
    return updated;
  }

  /**
   * Get all custom monsters
   *
   * @returns Array of custom monsters, sorted by creation date (newest first)
   */
  getAllCustomMonsters(): CustomMonster[] {
    const monsters = this.getAll();
    return monsters.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Delete a custom monster by ID
   *
   * @param id - ID of the monster to delete
   */
  deleteMonster(id: string): void {
    this.remove(id);
  }

  /**
   * Check if a monster name already exists (case-insensitive)
   *
   * @param name - Monster name to check
   * @param excludeId - Optional ID to exclude from check (for updates)
   * @returns True if name exists, false otherwise
   */
  nameExists(name: string, excludeId?: string): boolean {
    const monsters = this.getAll();
    return monsters.some(
      m => m.name.toLowerCase() === name.toLowerCase() && m.id !== excludeId
    );
  }
}

// Export singleton instance
export const CustomMonsterService = new CustomMonsterServiceClass();
