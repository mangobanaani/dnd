-- Extended schema: campaign-scoped content (npcs, locations, quests) and
-- user-scoped personal data (custom monsters, saved encounters, monster favorites/history).
-- Follows the role-based RLS patterns established in 20250101000000_initial_schema.sql.

-- ============================================================
-- Campaign-scoped tables: members can view, only the DM manages.
-- (mirrors the sessions table policy pattern)
-- ============================================================

create table public.npcs (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  name text not null,
  data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.locations (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  name text not null,
  data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.quests (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  title text not null,
  status text not null default 'active',
  data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.npcs enable row level security;
alter table public.locations enable row level security;
alter table public.quests enable row level security;

-- Reusable campaign-scoped policies (view: any member; manage: DM only)
do $$
declare t text;
begin
  foreach t in array array['npcs','locations','quests'] loop
    execute format($f$
      create policy "Campaign members can view %1$s" on public.%1$s
        for select using (
          public.is_campaign_dm(campaign_id) or public.is_campaign_member(campaign_id)
        );
    $f$, t);
    execute format($f$
      create policy "Only DM can manage %1$s" on public.%1$s
        for all using (public.is_campaign_dm(campaign_id));
    $f$, t);
  end loop;
end $$;

-- ============================================================
-- User-scoped personal tables: owner sees and manages only their own rows.
-- ============================================================

create table public.custom_monsters (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.encounters (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  name text not null,
  data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.monster_favorites (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  monster_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(owner_id, monster_id)
);

create table public.monster_history (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  monster_id text not null,
  viewed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(owner_id, monster_id)
);

alter table public.custom_monsters enable row level security;
alter table public.encounters enable row level security;
alter table public.monster_favorites enable row level security;
alter table public.monster_history enable row level security;

-- Reusable owner-only policy (full CRUD restricted to the owner)
do $$
declare t text;
begin
  foreach t in array array['custom_monsters','encounters','monster_favorites','monster_history'] loop
    execute format($f$
      create policy "Owners manage their own %1$s" on public.%1$s
        for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
    $f$, t);
  end loop;
end $$;

-- ============================================================
-- Indexes
-- ============================================================
create index idx_npcs_campaign on public.npcs(campaign_id);
create index idx_locations_campaign on public.locations(campaign_id);
create index idx_quests_campaign on public.quests(campaign_id);
create index idx_custom_monsters_owner on public.custom_monsters(owner_id);
create index idx_encounters_owner on public.encounters(owner_id);
create index idx_encounters_campaign on public.encounters(campaign_id);
create index idx_monster_favorites_owner on public.monster_favorites(owner_id);
create index idx_monster_history_owner on public.monster_history(owner_id);

-- ============================================================
-- updated_at triggers (reuse handle_updated_at from initial migration)
-- ============================================================
create trigger handle_npcs_updated_at before update on public.npcs
  for each row execute procedure public.handle_updated_at();
create trigger handle_locations_updated_at before update on public.locations
  for each row execute procedure public.handle_updated_at();
create trigger handle_quests_updated_at before update on public.quests
  for each row execute procedure public.handle_updated_at();
create trigger handle_custom_monsters_updated_at before update on public.custom_monsters
  for each row execute procedure public.handle_updated_at();
create trigger handle_encounters_updated_at before update on public.encounters
  for each row execute procedure public.handle_updated_at();
