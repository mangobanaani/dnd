/**
 * One-time migration: reads legacy localStorage data and writes each item into
 * Supabase via the corresponding repository.
 *
 * Guards:
 *  - Only runs in the browser.
 *  - Only runs for a signed-in user.
 *  - Idempotent: sets `dnd-imported-${userId}` in localStorage after success so
 *    it never runs again for the same user.
 *  - Every repository call is individually try/catch'd; partial failures are
 *    logged but do not abort the rest of the import.
 */

import { createClient } from "@/app/lib/supabase/client";
import {
  Campaign,
  CampaignNote,
  CampaignNPC,
  CampaignLocation,
  CampaignQuest,
  CampaignSession,
  SavedEncounter,
} from "@/app/types/campaign";
import { Character } from "@/app/types/character";
import { CustomMonster } from "@/app/lib/services/custom-monster.service";
import { campaignRepository } from "@/app/lib/repositories/campaign.repository";
import { characterRepository } from "@/app/lib/repositories/character.repository";
import { sessionRepository } from "@/app/lib/repositories/session.repository";
import { npcRepository } from "@/app/lib/repositories/npc.repository";
import { locationRepository } from "@/app/lib/repositories/location.repository";
import { questRepository } from "@/app/lib/repositories/quest.repository";
import { noteRepository } from "@/app/lib/repositories/note.repository";
import { encounterRepository } from "@/app/lib/repositories/encounter.repository";
import { customMonsterRepository } from "@/app/lib/repositories/custom-monster.repository";
import { monsterFavoriteRepository } from "@/app/lib/repositories/monster-favorite.repository";
import { monsterHistoryRepository } from "@/app/lib/repositories/monster-history.repository";

/** Parse a raw JSON string, returning null on any error. */
function tryParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Import all legacy localStorage keys into Supabase for the current user.
 *
 * Call this once after the user signs in.  The function is a no-op if:
 *  - not running in the browser
 *  - no user is signed in
 *  - the import has already run for this user (`dnd-imported-${userId}` is set)
 */
export async function importLocalStorageToSupabase(): Promise<void> {
  if (typeof window === "undefined") return;

  // Resolve the authenticated user.
  let userId: string;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    userId = user.id;
  } catch {
    return;
  }

  // Idempotency check.
  const doneKey = `dnd-imported-${userId}`;
  if (localStorage.getItem(doneKey)) return;

  console.log("[ls-import] Starting localStorage → Supabase import");

  // ------------------------------------------------------------------
  // 1. Campaigns
  // ------------------------------------------------------------------
  const campaigns = tryParse<Campaign[]>(localStorage.getItem("dnd-campaigns"));
  if (campaigns && Array.isArray(campaigns)) {
    for (const campaign of campaigns) {
      try {
        await campaignRepository.add(campaign);
      } catch {
        // Row already exists or RLS blocked — skip.
      }
    }
  }

  // Collect campaign IDs for per-campaign key lookups below.
  const campaignIds: string[] =
    Array.isArray(campaigns) ? campaigns.map((c) => c.id) : [];

  // ------------------------------------------------------------------
  // 2. Characters
  // ------------------------------------------------------------------
  const characters = tryParse<Character[]>(localStorage.getItem("dnd-characters"));
  if (characters && Array.isArray(characters)) {
    for (const character of characters) {
      try {
        await characterRepository.add(character);
      } catch {
        // Skip.
      }
    }
  }

  // ------------------------------------------------------------------
  // 3. Per-campaign sub-collections
  // ------------------------------------------------------------------
  for (const campaignId of campaignIds) {
    // Sessions
    try {
      const sessions = tryParse<CampaignSession[]>(
        localStorage.getItem(`dnd-campaign-sessions-${campaignId}`)
      );
      if (sessions && Array.isArray(sessions)) {
        for (const session of sessions) {
          try {
            await sessionRepository.add(session);
          } catch {
            // Skip.
          }
        }
      }
    } catch (err) {
      console.error(`[ls-import] sessions[${campaignId}]:`, err);
    }

    // NPCs
    try {
      const npcs = tryParse<CampaignNPC[]>(
        localStorage.getItem(`dnd-campaign-npcs-${campaignId}`)
      );
      if (npcs && Array.isArray(npcs)) {
        for (const npc of npcs) {
          try {
            await npcRepository.add(npc);
          } catch {
            // Skip.
          }
        }
      }
    } catch (err) {
      console.error(`[ls-import] npcs[${campaignId}]:`, err);
    }

    // Locations
    try {
      const locations = tryParse<CampaignLocation[]>(
        localStorage.getItem(`dnd-campaign-locations-${campaignId}`)
      );
      if (locations && Array.isArray(locations)) {
        for (const location of locations) {
          try {
            await locationRepository.add(location);
          } catch {
            // Skip.
          }
        }
      }
    } catch (err) {
      console.error(`[ls-import] locations[${campaignId}]:`, err);
    }

    // Quests
    try {
      const quests = tryParse<CampaignQuest[]>(
        localStorage.getItem(`dnd-campaign-quests-${campaignId}`)
      );
      if (quests && Array.isArray(quests)) {
        for (const quest of quests) {
          try {
            await questRepository.add(quest);
          } catch {
            // Skip.
          }
        }
      }
    } catch (err) {
      console.error(`[ls-import] quests[${campaignId}]:`, err);
    }

    // Notes
    try {
      const notes = tryParse<CampaignNote[]>(
        localStorage.getItem(`dnd-campaign-notes-${campaignId}`)
      );
      if (notes && Array.isArray(notes)) {
        for (const note of notes) {
          try {
            await noteRepository.add(note);
          } catch {
            // Skip.
          }
        }
      }
    } catch (err) {
      console.error(`[ls-import] notes[${campaignId}]:`, err);
    }
  }

  // ------------------------------------------------------------------
  // 4. Custom monsters
  // ------------------------------------------------------------------
  try {
    const monsters = tryParse<CustomMonster[]>(
      localStorage.getItem("dnd-custom-monsters")
    );
    if (monsters && Array.isArray(monsters)) {
      for (const monster of monsters) {
        try {
          await customMonsterRepository.add(monster);
        } catch {
          // Skip.
        }
      }
    }
  } catch (err) {
    console.error("[ls-import] custom-monsters:", err);
  }

  // ------------------------------------------------------------------
  // 5. Monster favorites
  // Legacy format: string[] of monster names, or object[] with monsterId.
  // ------------------------------------------------------------------
  try {
    const raw = localStorage.getItem("dnd-monster-favorites");
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const entry of parsed) {
          try {
            let monsterId: string | undefined;
            if (typeof entry === "string") {
              monsterId = entry;
            } else if (entry !== null && typeof entry === "object") {
              const obj = entry as Record<string, unknown>;
              monsterId =
                typeof obj["monsterId"] === "string" ? obj["monsterId"] :
                typeof obj["monster_id"] === "string" ? obj["monster_id"] :
                undefined;
            }
            if (monsterId) {
              await monsterFavoriteRepository.addMonster(monsterId);
            }
          } catch {
            // Skip.
          }
        }
      }
    }
  } catch (err) {
    console.error("[ls-import] monster-favorites:", err);
  }

  // ------------------------------------------------------------------
  // 6. Monster history
  // Legacy format: string[] of monster names, or object[] with monsterId.
  // ------------------------------------------------------------------
  try {
    const raw = localStorage.getItem("dnd-monster-history");
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const entry of parsed) {
          try {
            let monsterId: string | undefined;
            if (typeof entry === "string") {
              monsterId = entry;
            } else if (entry !== null && typeof entry === "object") {
              const obj = entry as Record<string, unknown>;
              monsterId =
                typeof obj["monsterId"] === "string" ? obj["monsterId"] :
                typeof obj["monster_id"] === "string" ? obj["monster_id"] :
                undefined;
            }
            if (monsterId) {
              await monsterHistoryRepository.upsertView(monsterId);
            }
          } catch {
            // Skip.
          }
        }
      }
    }
  } catch (err) {
    console.error("[ls-import] monster-history:", err);
  }

  // ------------------------------------------------------------------
  // 7. Saved encounters
  // ------------------------------------------------------------------
  try {
    const encounters = tryParse<SavedEncounter[]>(
      localStorage.getItem("dnd-saved-encounters")
    );
    if (encounters && Array.isArray(encounters)) {
      for (const encounter of encounters) {
        try {
          await encounterRepository.add(encounter);
        } catch {
          // Skip.
        }
      }
    }
  } catch (err) {
    console.error("[ls-import] saved-encounters:", err);
  }

  // Mark complete so this never re-runs for this user.
  localStorage.setItem(doneKey, new Date().toISOString());
  console.log("[ls-import] Import complete");
}
