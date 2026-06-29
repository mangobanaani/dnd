import { createClient } from "@/app/lib/supabase/client";
import { CustomMonster } from "@/app/lib/services/custom-monster.service";
import { BaseRepository, RepositoryError, RowMapper } from "./base.repository";

/**
 * Shape of a custom_monsters table row.
 * The full CustomMonster payload is stored in the `data` jsonb column;
 * `name` is mirrored for indexing/querying.
 */
interface CustomMonsterRow extends Record<string, unknown> {
  id: string;
  owner_id: string;
  name: string;
  data: CustomMonster;
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
      "You must be signed in to manage custom monsters."
    );
  }

  return user.id;
}

/**
 * Mapper between the CustomMonster entity and the custom_monsters table row.
 * `toRow` is only used by BaseRepository.update() (add/update are overridden);
 * owner_id is stamped in the repository override, not here.
 */
const mapper: RowMapper<CustomMonster, CustomMonsterRow> = {
  toRow(monster: CustomMonster): CustomMonsterRow {
    return {
      id: monster.id,
      owner_id: "",        // placeholder — overridden before any DB write
      name: monster.name,
      data: monster,
      created_at: monster.createdAt,
      updated_at: monster.updatedAt,
    };
  },

  fromRow(row: CustomMonsterRow): CustomMonster {
    // Spread JSONB payload; override id and timestamps with authoritative DB values.
    return {
      ...row.data,
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },
};

class CustomMonsterRepository extends BaseRepository<CustomMonster, CustomMonsterRow> {
  constructor() {
    super("custom_monsters", mapper);
  }

  /**
   * Insert a new custom monster, stamping owner_id from the authenticated user.
   * We build the row manually here rather than calling super.add() so that
   * owner_id is always the live auth uid, not whatever toRow() might supply.
   */
  override async add(monster: CustomMonster): Promise<CustomMonster> {
    const userId = await requireUserId();
    const supabase = createClient();

    const { data, error } = await supabase
      .from("custom_monsters")
      .insert({
        id: monster.id,
        owner_id: userId,
        name: monster.name,
        data: monster,
      })
      .select("*")
      .single();

    if (error) {
      throw new RepositoryError(
        `Failed to insert custom monster: ${error.message}`
      );
    }

    return mapper.fromRow(data as CustomMonsterRow);
  }

  /**
   * Update an existing custom monster's name and data payload.
   * owner_id is enforced by RLS and must not be changed.
   */
  override async update(id: string, monster: CustomMonster): Promise<CustomMonster> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("custom_monsters")
      .update({
        name: monster.name,
        data: monster,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new RepositoryError(
        `Failed to update custom monster id=${id}: ${error.message}`
      );
    }

    return mapper.fromRow(data as CustomMonsterRow);
  }

  /**
   * Check whether a monster name already exists (case-insensitive).
   * Fetches all owned monsters and performs the comparison in memory.
   *
   * @param name      - The candidate name to check.
   * @param excludeId - Optional id to skip (used when validating an update).
   */
  async nameExists(name: string, excludeId?: string): Promise<boolean> {
    const all = await this.list();
    return all.some(
      (m) =>
        m.name.toLowerCase() === name.toLowerCase() && m.id !== excludeId
    );
  }
}

/** Singleton instance — import this everywhere in the app. */
export const customMonsterRepository = new CustomMonsterRepository();
