import { createClient } from "@/app/lib/supabase/client";
import { BaseRepository, RepositoryError, RowMapper } from "./base.repository";

/**
 * Internal entity type that satisfies BaseRepository<T extends { id: string }>.
 * The `monsterId` field stores the monster name (which acts as the stable
 * public identifier in this app — official monsters have no separate id).
 */
export interface MonsterFavoriteRecord {
  /** Database uuid primary key. */
  id: string;
  /** Stored in the `monster_id` column — the monster's name. */
  monsterId: string;
}

/**
 * Shape of a monster_favorites table row.
 */
interface MonsterFavoriteRow extends Record<string, unknown> {
  id: string;
  owner_id: string;
  monster_id: string;
  created_at: string;
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
      "You must be signed in to manage monster favorites."
    );
  }

  return user.id;
}

const mapper: RowMapper<MonsterFavoriteRecord, MonsterFavoriteRow> = {
  toRow(record: MonsterFavoriteRecord): MonsterFavoriteRow {
    return {
      id: record.id,
      owner_id: "",             // placeholder — not used (add is overridden)
      monster_id: record.monsterId,
      created_at: "",           // DB sets this
    };
  },

  fromRow(row: MonsterFavoriteRow): MonsterFavoriteRecord {
    return {
      id: row.id,
      monsterId: row.monster_id,
    };
  },
};

class MonsterFavoriteRepository extends BaseRepository<MonsterFavoriteRecord, MonsterFavoriteRow> {
  constructor() {
    super("monster_favorites", mapper);
  }

  /**
   * Return all monster names (monster_id values) favorited by the current user.
   */
  async listMonsterIds(): Promise<string[]> {
    const records = await this.list();
    return records.map((r) => r.monsterId);
  }

  /**
   * Add a monster to favorites, stamping owner_id from the authenticated user.
   * Silently succeeds if the monster is already favorited (unique constraint
   * on (owner_id, monster_id) would otherwise throw).
   *
   * @param monsterId - The monster's name used as its identifier.
   */
  async addMonster(monsterId: string): Promise<void> {
    const userId = await requireUserId();
    const supabase = createClient();

    const { error } = await supabase
      .from("monster_favorites")
      .insert({ owner_id: userId, monster_id: monsterId });

    // 23505 = unique_violation — already favorited, not an error for callers.
    if (error && error.code !== "23505") {
      throw new RepositoryError(
        `Failed to add monster favorite: ${error.message}`
      );
    }
  }

  /**
   * Remove a monster from favorites by its identifier (monster name).
   * Silently succeeds if it was not in the list.
   *
   * @param monsterId - The monster's name used as its identifier.
   */
  async removeByMonsterId(monsterId: string): Promise<void> {
    const userId = await requireUserId();
    const supabase = createClient();

    const { error } = await supabase
      .from("monster_favorites")
      .delete()
      .eq("owner_id", userId)
      .eq("monster_id", monsterId);

    if (error) {
      throw new RepositoryError(
        `Failed to remove monster favorite: ${error.message}`
      );
    }
  }

  /**
   * Return true if the given monster is currently favorited by the current user.
   *
   * @param monsterId - The monster's name used as its identifier.
   */
  async existsByMonsterId(monsterId: string): Promise<boolean> {
    const userId = await requireUserId();
    const supabase = createClient();

    const { data, error } = await supabase
      .from("monster_favorites")
      .select("id")
      .eq("owner_id", userId)
      .eq("monster_id", monsterId)
      .maybeSingle();

    if (error) {
      throw new RepositoryError(
        `Failed to check monster favorite: ${error.message}`
      );
    }

    return data !== null;
  }

  /**
   * Remove all favorites for the current user.
   */
  async clearAll(): Promise<void> {
    const userId = await requireUserId();
    const supabase = createClient();

    const { error } = await supabase
      .from("monster_favorites")
      .delete()
      .eq("owner_id", userId);

    if (error) {
      throw new RepositoryError(
        `Failed to clear monster favorites: ${error.message}`
      );
    }
  }
}

/** Singleton instance — import this everywhere in the app. */
export const monsterFavoriteRepository = new MonsterFavoriteRepository();
