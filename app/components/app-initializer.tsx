'use client';

import { useEffect } from 'react';
import { migrateLocalStorage } from '@/app/lib/migrations/effects-migration';
import { SeedDataService } from '@/app/lib/services/seed-data.service';
import { importLocalStorageToSupabase } from '@/app/lib/migrations/localstorage-import';

/**
 * Component to initialize the app with default data on first run
 */
export function AppInitializer() {
  useEffect(() => {
    const initApp = async () => {
      if (typeof window === 'undefined') return;

      try {
        migrateLocalStorage();
      } catch (error) {
        console.error('Failed to migrate localStorage:', error);
      }

      // One-time localStorage → Supabase import (runs once per signed-in user).
      try {
        await importLocalStorageToSupabase();
      } catch (error) {
        console.error('Failed to import localStorage to Supabase:', error);
      }

      // Check if app has been initialized before
      const hasInitialized = localStorage.getItem('app:initialized');

      if (!hasInitialized) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🎲 First run detected - loading Dragonlance seed data...');
        }

        try {
          // Load Dragonlance seed data
          const result = await SeedDataService.loadDragonlanceSeedData();

          if (result.success && result.data) {
            if (process.env.NODE_ENV === 'development') {
              console.log('✓ Dragonlance campaign loaded successfully!');
              console.log(`  📖 1 campaign: ${result.data.campaign.name}`);
              console.log(`  ⚔️  ${result.data.characters} characters (Heroes of the Lance)`);
              console.log(`  🏰 ${result.data.locations} locations`);
              console.log(`  📅 ${result.data.sessions} sessions`);
              console.log(`  ⚡ ${result.data.encounters} encounters`);
              console.log(`  👥 ${result.data.npcs} NPCs`);
              console.log(`  📜 ${result.data.quests} quests`);
              console.log('');
              console.log('Navigate to /campaigns or /characters to explore!');
            }
          } else {
            console.error('❌ Failed to load seed data:', result.message);
          }

          // Mark as initialized
          localStorage.setItem('app:initialized', 'true');
          localStorage.setItem('app:initialized:timestamp', new Date().toISOString());
        } catch (error) {
          console.error('❌ Error initializing app:', error);
        }
      }
    };

    initApp();
  }, []);

  return null; // This component doesn't render anything
}
