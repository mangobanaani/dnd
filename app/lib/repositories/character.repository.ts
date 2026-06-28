import { createClient } from "@/app/lib/supabase/client";
import { Character } from "@/app/types/character";
import { BaseRepository, RepositoryError, RowMapper } from "./base.repository";

/**
 * Shape of a characters table row after the 20250104 migration that added the
 * `data` jsonb column and made `campaign_id` nullable.
 */
interface CharacterRow extends Record<string, unknown> {
  id: string;
  campaign_id: string | null;
  player_id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  hp_current: number;
  hp_max: number;
  hp_temp: number | null;
  ac: number;
  initiative_bonus: number | null;
  speed: number;
  proficiency_bonus: number;
  data: Character;
  created_at: string;
  updated_at: string;
}

/**
 * Resolve the current auth user id.
 * Throws a RepositoryError if the user is not signed in.
 */
async function requireUserId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new RepositoryError("You must be signed in to manage characters.");
  }

  return user.id;
}

const mapper: RowMapper<Character, CharacterRow> = {
  toRow(character: Character): CharacterRow {
    return {
      id: character.id,
      campaign_id: character.campaignId ?? null,
      player_id: character.playerId,
      name: character.name,
      race: character.race,
      // Mirror the primary class name into the indexed column
      class: character.classes[0]?.name ?? "Unknown",
      level: character.level,
      strength: character.abilityScores.strength,
      dexterity: character.abilityScores.dexterity,
      constitution: character.abilityScores.constitution,
      intelligence: character.abilityScores.intelligence,
      wisdom: character.abilityScores.wisdom,
      charisma: character.abilityScores.charisma,
      hp_current: character.currentHitPoints,
      hp_max: character.maxHitPoints,
      hp_temp: character.temporaryHitPoints ?? null,
      ac: character.armorClass,
      initiative_bonus: character.initiative ?? null,
      speed: character.speed,
      proficiency_bonus: character.proficiencyBonus,
      // Full payload preserves every app-level field
      data: character,
      created_at: character.createdAt,
      updated_at: character.updatedAt,
    };
  },

  fromRow(row: CharacterRow): Character {
    // row.data is the canonical Character; override identity fields with
    // the authoritative DB values so they stay in sync.
    return {
      ...row.data,
      id: row.id,
      playerId: row.player_id,
      campaignId: row.campaign_id ?? undefined,
    };
  },
};

class CharacterRepository extends BaseRepository<Character, CharacterRow> {
  constructor() {
    super("characters", mapper);
  }

  /**
   * Insert a new character, stamping player_id from the authenticated user.
   * RLS requires player_id = auth.uid() on INSERT.
   */
  override async add(character: Character): Promise<Character> {
    const userId = await requireUserId();
    return super.add({ ...character, playerId: userId });
  }

  /**
   * Update a character, keeping player_id locked to the authenticated user.
   */
  override async update(id: string, character: Character): Promise<Character> {
    const userId = await requireUserId();
    return super.update(id, { ...character, playerId: userId });
  }

  /**
   * Return characters that belong to a specific campaign.
   * Useful for the campaign detail page to load party members.
   * RLS allows DMs (is_campaign_dm) and the owning player to read these rows.
   */
  async listForCampaign(campaignId: string): Promise<Character[]> {
    return this.listBy("campaign_id", campaignId);
  }
}

/** Singleton instance — import this everywhere in the app. */
export const characterRepository = new CharacterRepository();
