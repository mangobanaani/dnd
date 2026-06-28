-- Add view_count to monster_history.
-- The extended schema (20250102000000) created the table with only viewed_at;
-- the monster-history service tracks cumulative view counts, so this column
-- is required for the Supabase-backed implementation.
-- Default of 1 matches the count set when a row is first inserted.
alter table public.monster_history
  add column if not exists view_count integer not null default 1;
