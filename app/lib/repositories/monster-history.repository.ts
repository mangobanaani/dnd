import { createClient } from "@/app/lib/supabase/client";
import { BaseRepository, RepositoryError, RowMapper } from "./base.repository";

/**
 * Internal entity type that satisfies BaseRepository<T extends { id: string }>.
 * `monsterId` is stored in the `monster_id` column and equals the monster's
 * name (the stable public identifier used throughout this app).
 */
export interface MonsterHistoryEntity {
  /** Database uuid primary key. */
  id: string;
  /** Stored in `monster_id` — the monster's name. */
  monsterId: string;
  /** ISO timestamp of the most recent view (maps to `viewed_at`). */
  viewedAt: string;
  /** Cumulative view count (maps to `view_count`, added in migration 20250105000000). */
  viewCount: number;
}

/**
 * Shape of a monster_history table row.
 * `view_count` is added by migration 20250105000000_monsters_fix.sql.
 */
interface MonsterHistoryRow extends Record<string, unknown> {
  id: string;
  owner_id: string;
  monster_id: string;
  viewed_at: string;
  view_count: number;
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
      "You must be signed in to manage monster history."
    );
  }

  return user.id;
}

const mapper: RowMapper<MonsterHistoryEntity, MonsterHistoryRow> = {
  toRow(entity: MonsterHistoryEntity): MonsterHistoryRow {
    return {
      id: entity.id,
      owner_id: "",              // placeholder — not used (add is overridden)
      monster_id: entity.monsterId,
      viewed_at: entity.viewedAt,
      view_count: entity.viewCount,
    };
  },

  fromRow(row: MonsterHistoryRow): MonsterHistoryEntity {
    return {
      id: row.id,
      monsterId: row.monster_id,
      viewedAt: row.viewed_at,
      viewCount: row.view_count,
    };
  },
};

class MonsterHistoryRepository extends BaseRepository<MonsterHistoryEntity, MonsterHistoryRow> {
  constructor() {
    super("monster_history", mapper);
  }

  /**
   * Return all history entries for the current user, ordered most-recent first.
   */
  override async list(): Promise<MonsterHistoryEntity[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("monster_history")
      .select("*")
      .order("viewed_at", { ascending: false });

    if (error) {
      throw new RepositoryError(
        `Failed to list monster_history: ${error.message}`
      );
    }

    return (data as MonsterHistoryRow[]).map(mapper.fromRow);
  }

  /**
   * Find a single history record by monster identifier (name), or null if absent.
   *
   * @param monsterId - The monster's name.
   */
  async findByMonsterId(monsterId: string): Promise<MonsterHistoryEntity | null> {
    const userId = await requireUserId();
    const supabase = createClient();

    const { data, error } = await supabase
      .from("monster_history")
      .select("*")
      .eq("owner_id", userId)
      .eq("monster_id", monsterId)
      .maybeSingle();

    if (error) {
      throw new RepositoryError(
        `Failed to find monster history entry: ${error.message}`
      );
    }

    return data ? mapper.fromRow(data as MonsterHistoryRow) : null;
  }

  /**
   * Record a view of a monster: insert a new row or increment the view count
   * and refresh the timestamp if a row already exists.
   *
   * Uses a read-then-write pattern (safe for this low-concurrency use case).
   *
   * @param monsterId - The monster's name.
   */
  async upsertView(monsterId: string): Promise<void> {
    const userId = await requireUserId();
    const supabase = createClient();
    const now = new Date().toISOString();

    const existing = await this.findByMonsterId(monsterId);

    if (existing) {
      const { error } = await supabase
        .from("monster_history")
        .update({
          viewed_at: now,
          view_count: existing.viewCount + 1,
        })
        .eq("id", existing.id);

      if (error) {
        throw new RepositoryError(
          `Failed to update monster history: ${error.message}`
        );
      }
    } else {
      const { error } = await supabase
        .from("monster_history")
        .insert({
          owner_id: userId,
          monster_id: monsterId,
          viewed_at: now,
          view_count: 1,
        });

      if (error) {
        throw new RepositoryError(
          `Failed to insert monster history: ${error.message}`
        );
      }
    }
  }

  /**
   * Remove a specific monster's history entry by its identifier (name).
   * Silently succeeds if the entry does not exist.
   *
   * @param monsterId - The monster's name.
   */
  async removeByMonsterId(monsterId: string): Promise<void> {
    const userId = await requireUserId();
    const supabase = createClient();

    const { error } = await supabase
      .from("monster_history")
      .delete()
      .eq("owner_id", userId)
      .eq("monster_id", monsterId);

    if (error) {
      throw new RepositoryError(
        `Failed to remove monster history entry: ${error.message}`
      );
    }
  }

  /**
   * Delete all history entries for the current user.
   */
  async clearAll(): Promise<void> {
    const userId = await requireUserId();
    const supabase = createClient();

    const { error } = await supabase
      .from("monster_history")
      .delete()
      .eq("owner_id", userId);

    if (error) {
      throw new RepositoryError(
        `Failed to clear monster history: ${error.message}`
      );
    }
  }
}

/** Singleton instance — import this everywhere in the app. */
export const monsterHistoryRepository = new MonsterHistoryRepository();
