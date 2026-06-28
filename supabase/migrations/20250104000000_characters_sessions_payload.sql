-- Add data jsonb payload column to characters (mirrors campaign_payload migration pattern)
alter table public.characters add column if not exists data jsonb not null default '{}'::jsonb;

-- Allow standalone (not-campaign-attached) characters
alter table public.characters alter column campaign_id drop not null;

-- Replace the old insert policy that required campaign membership with one that
-- also allows standalone characters (campaign_id IS NULL).
drop policy if exists "Players can create characters in joined campaigns" on public.characters;

create policy "Players can create their own characters" on public.characters
  for insert with check (
    player_id = auth.uid()
    and (campaign_id is null or public.is_campaign_member(campaign_id))
  );

-- Add data jsonb payload column to sessions
alter table public.sessions add column if not exists data jsonb not null default '{}'::jsonb;
