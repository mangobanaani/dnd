import { createClient } from "@/app/lib/supabase/client";

/**
 * Thrown when a Supabase operation fails.
 */
export class RepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryError";
  }
}

/**
 * Mapper pair that translates between the app entity shape (T) and the
 * database row shape (R).
 */
export interface RowMapper<T, R extends Record<string, unknown>> {
  /** Convert an app entity to database columns (including `data` jsonb). */
  toRow: (entity: T) => R;
  /** Reconstruct the app entity from a database row. */
  fromRow: (row: R) => T;
}

/**
 * Generic async repository over a single Supabase table.
 *
 * @template T - The app-level entity type (must have `id: string`).
 * @template R - The row type that the Supabase table returns.
 */
export class BaseRepository<T extends { id: string }, R extends Record<string, unknown>> {
  constructor(
    private readonly tableName: string,
    private readonly mapper: RowMapper<T, R>
  ) {}

  /** Return all rows the current user is allowed to read. */
  async list(): Promise<T[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*");

    if (error) {
      throw new RepositoryError(`Failed to list ${this.tableName}: ${error.message}`);
    }

    return (data as R[]).map(this.mapper.fromRow);
  }

  /** Return a single row by primary key, or null if not found. */
  async getById(id: string): Promise<T | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new RepositoryError(`Failed to fetch ${this.tableName} by id: ${error.message}`);
    }

    return data ? this.mapper.fromRow(data as R) : null;
  }

  /** Insert a new row and return the persisted entity (with server-generated fields). */
  async add(entity: T): Promise<T> {
    const supabase = createClient();
    const row = this.mapper.toRow(entity);

    const { data, error } = await supabase
      .from(this.tableName)
      .insert(row)
      .select("*")
      .single();

    if (error) {
      throw new RepositoryError(`Failed to insert into ${this.tableName}: ${error.message}`);
    }

    return this.mapper.fromRow(data as R);
  }

  /** Update an existing row by id and return the updated entity. */
  async update(id: string, entity: T): Promise<T> {
    const supabase = createClient();
    const row = this.mapper.toRow(entity);

    const { data, error } = await supabase
      .from(this.tableName)
      .update(row)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new RepositoryError(`Failed to update ${this.tableName} id=${id}: ${error.message}`);
    }

    return this.mapper.fromRow(data as R);
  }

  /** Delete a row by id. */
  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq("id", id);

    if (error) {
      throw new RepositoryError(`Failed to delete from ${this.tableName} id=${id}: ${error.message}`);
    }
  }

  /**
   * Return all rows where `column` equals `value`.
   * Protected helper for campaign-scoped subclass repositories that need to
   * filter by a single equality predicate (e.g. campaign_id).
   */
  protected async listBy(column: string, value: string): Promise<T[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq(column, value);

    if (error) {
      throw new RepositoryError(
        `Failed to list ${this.tableName} where ${column}=${value}: ${error.message}`
      );
    }

    return (data as R[]).map(this.mapper.fromRow);
  }
}
