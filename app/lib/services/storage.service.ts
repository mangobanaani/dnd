/**
 * Storage Service Error
 * Thrown when localStorage operations fail
 */
export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Generic localStorage service for managing entities with IDs
 * Provides CRUD operations with error handling
 *
 * @template T - Entity type that must have an id property
 */
export class StorageService<T extends { id: string }> {
  constructor(private key: string) {}

  /**
   * Get all items from localStorage
   *
   * @returns Array of items, or empty array if none exist or on error
   */
  getAll(): T[] {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Failed to load ${this.key}:`, error);
      return [];
    }
  }

  /**
   * Save items to localStorage
   *
   * @param items - Array of items to save
   * @throws {StorageError} If localStorage write fails
   */
  save(items: T[]): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(items));
    } catch (error) {
      console.error(`Failed to save ${this.key}:`, error);
      throw new StorageError('Failed to save data');
    }
  }

  /**
   * Get a single item by ID
   *
   * @param id - Unique identifier of the item
   * @returns The item if found, undefined otherwise
   */
  getById(id: string): T | undefined {
    const items = this.getAll();
    return items.find(item => item.id === id);
  }

  /**
   * Update an existing item
   *
   * @param id - ID of the item to update
   * @param item - New item data
   * @throws {Error} If item with given ID is not found
   */
  update(id: string, item: T): void {
    const items = this.getAll();
    const index = items.findIndex(i => i.id === id);

    if (index === -1) {
      throw new Error(`Item with id ${id} not found`);
    }

    items[index] = item;
    this.save(items);
  }

  /**
   * Add a new item
   *
   * @param item - Item to add (must have unique ID)
   */
  add(item: T): void {
    const items = this.getAll();
    items.push(item);
    this.save(items);
  }

  /**
   * Remove an item by ID
   *
   * @param id - ID of the item to remove
   */
  remove(id: string): void {
    const items = this.getAll();
    const filtered = items.filter(item => item.id !== id);
    this.save(filtered);
  }

  /**
   * Clear all items from localStorage
   *
   * @throws {StorageError} If localStorage removal fails
   */
  clear(): void {
    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      console.error(`Failed to clear ${this.key}:`, error);
      throw new StorageError('Failed to clear data');
    }
  }
}
