import { StorageService, StorageError } from '@/app/lib/services/storage.service';

describe('StorageService', () => {
  let storage: StorageService<{ id: string; name: string }>;
  const TEST_KEY = 'test-storage-key';

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageService(TEST_KEY);
  });

  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  describe('getAll', () => {
    it('should return empty array when no data exists', () => {
      const result = storage.getAll();
      expect(result).toEqual([]);
    });

    it('should return parsed data when data exists', () => {
      const testData = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];
      localStorage.setItem(TEST_KEY, JSON.stringify(testData));

      const result = storage.getAll();
      expect(result).toEqual(testData);
    });

    it('should return empty array when localStorage has invalid JSON', () => {
      localStorage.setItem(TEST_KEY, 'invalid json{');

      const result = storage.getAll();
      expect(result).toEqual([]);
    });

    it('should handle localStorage being unavailable', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      const result = storage.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('save', () => {
    it('should save data to localStorage', () => {
      const testData = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];

      storage.save(testData);

      const stored = localStorage.getItem(TEST_KEY);
      expect(stored).toBe(JSON.stringify(testData));
    });

    it('should throw StorageError when localStorage is unavailable', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      const testData = [{ id: '1', name: 'Item 1' }];

      expect(() => storage.save(testData)).toThrow(StorageError);
    });

    it('should overwrite existing data', () => {
      const oldData = [{ id: '1', name: 'Old' }];
      const newData = [{ id: '2', name: 'New' }];

      storage.save(oldData);
      storage.save(newData);

      const result = storage.getAll();
      expect(result).toEqual(newData);
    });
  });

  describe('getById', () => {
    it('should return item by id', () => {
      const testData = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];
      storage.save(testData);

      const result = storage.getById('2');
      expect(result).toEqual({ id: '2', name: 'Item 2' });
    });

    it('should return undefined when item not found', () => {
      const testData = [{ id: '1', name: 'Item 1' }];
      storage.save(testData);

      const result = storage.getById('999');
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update existing item', () => {
      const testData = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];
      storage.save(testData);

      storage.update('2', { id: '2', name: 'Updated Item' });

      const result = storage.getById('2');
      expect(result).toEqual({ id: '2', name: 'Updated Item' });
    });

    it('should throw error when updating non-existent item', () => {
      expect(() => {
        storage.update('999', { id: '999', name: 'New' });
      }).toThrow('Item with id 999 not found');
    });
  });

  describe('add', () => {
    it('should add new item', () => {
      const testData = [{ id: '1', name: 'Item 1' }];
      storage.save(testData);

      storage.add({ id: '2', name: 'Item 2' });

      const result = storage.getAll();
      expect(result).toHaveLength(2);
      expect(result[1]).toEqual({ id: '2', name: 'Item 2' });
    });

    it('should add to empty storage', () => {
      storage.add({ id: '1', name: 'First Item' });

      const result = storage.getAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ id: '1', name: 'First Item' });
    });
  });

  describe('remove', () => {
    it('should remove item by id', () => {
      const testData = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' },
      ];
      storage.save(testData);

      storage.remove('2');

      const result = storage.getAll();
      expect(result).toHaveLength(2);
      expect(result.find(item => item.id === '2')).toBeUndefined();
    });

    it('should do nothing when removing non-existent item', () => {
      const testData = [{ id: '1', name: 'Item 1' }];
      storage.save(testData);

      storage.remove('999');

      const result = storage.getAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('clear', () => {
    it('should remove all items', () => {
      const testData = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];
      storage.save(testData);

      storage.clear();

      const result = storage.getAll();
      expect(result).toEqual([]);
    });
  });
});
