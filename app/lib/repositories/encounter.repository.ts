import { createClient } from "@/app/lib/supabase/client";
import { SavedEncounter } from "@/app/types/campaign";
import { BaseRepository, RepositoryError, RowMapper } from "./base.repository";

/**
 * Shape of an encounters table row.
 * The full SavedEncounter payload is stored in the `data` jsonb column;
 * `name` and `campaign_id` are mirrored for indexing/querying.
 * `owner_id` is always stamped from the authenticated user — never from the entity.
 */
interface EncounterRow extends Record<string, unknown> {
  id: string;
  owner_id: string;
  campaign_id: string | null;
  name: string;
  data: SavedEncounter;
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
    throw new RepositoryError(
      "You must be signed in to manage encounters."
    );
  }

  return user.id;
}

/**
 * Mapper between the SavedEncounter entity and the encounters table row.
 * `toRow` is only used by BaseRepository.update() (add is overridden);
 * owner_id is stamped in the repository override, not here.
 */
const mapper: RowMapper<SavedEncounter, EncounterRow> = {
  toRow(encounter: SavedEncounter): EncounterRow {
    return {
      id: encounter.id,
      owner_id: "",                         // placeholder — overridden before any DB write
      campaign_id: encounter.campaignId ?? null,
      name: encounter.name,
      data: encounter,
      created_at: encounter.createdAt,
      updated_at: encounter.createdAt,      // updated_at managed by DB trigger
    };
  },

  fromRow(row: EncounterRow): SavedEncounter {
    // row.data holds the canonical SavedEncounter; override id with the authoritative DB value.
    return {
      ...row.data,
      id: row.id,
    };
  },
};

class EncounterRepository extends BaseRepository<SavedEncounter, EncounterRow> {
  constructor() {
    super("encounters", mapper);
  }

  /**
   * Insert a new encounter, stamping owner_id from the authenticated user.
   * We build the row manually so that owner_id is always the live auth uid.
   */
  override async add(encounter: SavedEncounter): Promise<SavedEncounter> {
    const userId = await requireUserId();
    const supabase = createClient();

    const { data, error } = await supabase
      .from("encounters")
      .insert({
        id: encounter.id,
        owner_id: userId,
        campaign_id: encounter.campaignId ?? null,
        name: encounter.name,
        data: encounter,
      })
      .select("*")
      .single();

    if (error) {
      throw new RepositoryError(
        `Failed to insert encounter: ${error.message}`
      );
    }

    return mapper.fromRow(data as EncounterRow);
  }

  /**
   * Update an existing encounter's name, campaign link, and data payload.
   * owner_id is enforced by RLS and must not be changed.
   */
  override async update(id: string, encounter: SavedEncounter): Promise<SavedEncounter> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("encounters")
      .update({
        name: encounter.name,
        campaign_id: encounter.campaignId ?? null,
        data: encounter,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new RepositoryError(
        `Failed to update encounter id=${id}: ${error.message}`
      );
    }

    return mapper.fromRow(data as EncounterRow);
  }
}

/** Singleton instance — import this everywhere in the app. */
export const encounterRepository = new EncounterRepository();
