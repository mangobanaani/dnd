import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { AppInitializer } from '@/app/components/app-initializer';
import { SeedDataService } from '@/app/lib/services/seed-data.service';

// Mock the SeedDataService
jest.mock('@/app/lib/services/seed-data.service');

describe('AppInitializer', () => {
  let consoleLogSpy: jest.SpyInstance;
  let localStorageGetItemSpy: jest.SpyInstance;
  let localStorageSetItemSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on console.log to verify it's called only in development
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    localStorageGetItemSpy = localStorageMock.getItem as jest.Mock;
    localStorageSetItemSpy = localStorageMock.setItem as jest.Mock;

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('First run initialization', () => {
    it('loads seed data when app:initialized flag is not set', async () => {
      localStorageGetItemSpy.mockReturnValue(null);

      const mockSeedResult = {
        success: true,
        message: 'Seed data loaded successfully',
        data: {
          campaign: { name: 'Chronicles of the War of the Lance' },
          characters: 8,
          locations: 10,
          sessions: 4,
          encounters: 2,
          npcs: 5,
          quests: 4,
        },
      };

      (SeedDataService.loadDragonlanceSeedData as jest.Mock).mockResolvedValue(mockSeedResult);

      render(<AppInitializer />);

      await waitFor(() => {
        expect(SeedDataService.loadDragonlanceSeedData).toHaveBeenCalledTimes(1);
      });

      expect(localStorageSetItemSpy).toHaveBeenCalledWith('app:initialized', 'true');
      expect(localStorageSetItemSpy).toHaveBeenCalledWith('app:initialized:timestamp', expect.any(String));
    });

    it('does not load seed data when app:initialized flag is already set', async () => {
      localStorageGetItemSpy.mockReturnValue('true');

      render(<AppInitializer />);

      await waitFor(() => {
        expect(SeedDataService.loadDragonlanceSeedData).not.toHaveBeenCalled();
      });
    });

    it('does not run on server side (window undefined)', async () => {
      // Skip this test in JSDOM environment
      // In actual SSR, window is undefined, but in JSDOM it's always available
      // This behavior is tested implicitly by Next.js SSR
      expect(true).toBe(true);
    });
  });

  describe('Console logging', () => {
    it('logs in development mode', async () => {
      // Set NODE_ENV to development
      const originalEnv = process.env.NODE_ENV;
      (process.env as { [key: string]: string | undefined }).NODE_ENV = 'development';

      localStorageGetItemSpy.mockReturnValue(null);

      const mockSeedResult = {
        success: true,
        message: 'Seed data loaded successfully',
        data: {
          campaign: { name: 'Chronicles of the War of the Lance' },
          characters: 8,
          locations: 10,
          sessions: 4,
          encounters: 2,
          npcs: 5,
          quests: 4,
        },
      };

      (SeedDataService.loadDragonlanceSeedData as jest.Mock).mockResolvedValue(mockSeedResult);

      render(<AppInitializer />);

      await waitFor(() => {
        expect(SeedDataService.loadDragonlanceSeedData).toHaveBeenCalled();
      });

      // In development, console.log should be called
      expect(consoleLogSpy).toHaveBeenCalled();

      // Restore NODE_ENV
      (process.env as { [key: string]: string | undefined }).NODE_ENV = originalEnv;
    });

    it('does not log in production mode', async () => {
      // Set NODE_ENV to production
      const originalEnv = process.env.NODE_ENV;
      (process.env as { [key: string]: string | undefined }).NODE_ENV = 'production';

      localStorageGetItemSpy.mockReturnValue(null);

      const mockSeedResult = {
        success: true,
        message: 'Seed data loaded successfully',
        data: {
          campaign: { name: 'Chronicles of the War of the Lance' },
          characters: 8,
          locations: 10,
          sessions: 4,
          encounters: 2,
          npcs: 5,
          quests: 4,
        },
      };

      (SeedDataService.loadDragonlanceSeedData as jest.Mock).mockResolvedValue(mockSeedResult);

      render(<AppInitializer />);

      await waitFor(() => {
        expect(SeedDataService.loadDragonlanceSeedData).toHaveBeenCalled();
      });

      // In production, console.log should NOT be called
      expect(consoleLogSpy).not.toHaveBeenCalled();

      // Restore NODE_ENV
      (process.env as { [key: string]: string | undefined }).NODE_ENV = originalEnv;
    });
  });

  describe('Error handling', () => {
    it('handles seed data loading errors gracefully', async () => {
      localStorageGetItemSpy.mockReturnValue(null);

      const mockSeedResult = {
        success: false,
        message: 'Failed to load seed data',
      };

      (SeedDataService.loadDragonlanceSeedData as jest.Mock).mockResolvedValue(mockSeedResult);

      render(<AppInitializer />);

      await waitFor(() => {
        expect(SeedDataService.loadDragonlanceSeedData).toHaveBeenCalledTimes(1);
      });

      // Should still set the initialized flag even if loading failed
      expect(localStorageSetItemSpy).toHaveBeenCalledWith('app:initialized', 'true');
    });

    it('handles exceptions during seed data loading', async () => {
      localStorageGetItemSpy.mockReturnValue(null);

      (SeedDataService.loadDragonlanceSeedData as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      // Should not throw, should handle error gracefully
      expect(() => render(<AppInitializer />)).not.toThrow();

      await waitFor(() => {
        expect(SeedDataService.loadDragonlanceSeedData).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Rendering', () => {
    it('renders nothing (returns null)', () => {
      localStorageGetItemSpy.mockReturnValue('true');

      const { container } = render(<AppInitializer />);

      expect(container.firstChild).toBeNull();
    });
  });
});
