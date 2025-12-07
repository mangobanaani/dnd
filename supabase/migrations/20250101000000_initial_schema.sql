-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create custom types
create type user_role as enum ('dm', 'player', 'both');
create type campaign_role as enum ('dm', 'player');

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  display_name text,
  avatar_url text,
  default_role user_role not null default 'player',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Campaigns table
create table public.campaigns (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  dm_id uuid references public.profiles(id) on delete cascade not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.campaigns enable row level security;

-- Campaigns policies
create policy "Campaign members can view campaigns" on public.campaigns
  for select using (
    auth.uid() = dm_id
    or exists (
      select 1 from public.campaign_members
      where campaign_id = campaigns.id
      and user_id = auth.uid()
    )
  );

create policy "Only DM can create campaigns" on public.campaigns
  for insert with check (auth.uid() = dm_id);

create policy "Only DM can update their campaigns" on public.campaigns
  for update using (auth.uid() = dm_id);

create policy "Only DM can delete their campaigns" on public.campaigns
  for delete using (auth.uid() = dm_id);

-- Campaign Members table
create table public.campaign_members (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role campaign_role not null default 'player',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(campaign_id, user_id)
);

alter table public.campaign_members enable row level security;

-- Campaign members policies
create policy "Campaign members can view themselves" on public.campaign_members
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.campaigns
      where id = campaign_id and dm_id = auth.uid()
    )
  );

create policy "DM can add members" on public.campaign_members
  for insert with check (
    exists (
      select 1 from public.campaigns
      where id = campaign_id and dm_id = auth.uid()
    )
  );

create policy "DM can remove members" on public.campaign_members
  for delete using (
    exists (
      select 1 from public.campaigns
      where id = campaign_id and dm_id = auth.uid()
    )
  );

-- Characters table
create table public.characters (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  player_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  race text not null,
  class text not null,
  level integer not null default 1,

  -- Ability Scores
  strength integer not null default 10,
  dexterity integer not null default 10,
  constitution integer not null default 10,
  intelligence integer not null default 10,
  wisdom integer not null default 10,
  charisma integer not null default 10,

  -- Combat Stats
  hp_current integer not null default 10,
  hp_max integer not null default 10,
  hp_temp integer default 0,
  ac integer not null default 10,
  initiative_bonus integer default 0,
  speed integer not null default 30,

  -- Proficiency
  proficiency_bonus integer not null default 2,

  -- Additional data (JSON for flexibility)
  skills jsonb default '{}'::jsonb,
  features jsonb default '[]'::jsonb,
  equipment jsonb default '[]'::jsonb,
  spells jsonb default '[]'::jsonb,
  notes text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.characters enable row level security;

-- Characters policies
create policy "Players can view their own characters" on public.characters
  for select using (player_id = auth.uid());

create policy "DM can view campaign characters" on public.characters
  for select using (
    exists (
      select 1 from public.campaigns
      where id = campaign_id and dm_id = auth.uid()
    )
  );

create policy "Players can create characters in joined campaigns" on public.characters
  for insert with check (
    player_id = auth.uid()
    and exists (
      select 1 from public.campaign_members
      where campaign_id = characters.campaign_id
      and user_id = auth.uid()
    )
  );

create policy "Players can update their own characters" on public.characters
  for update using (player_id = auth.uid());

create policy "DM can update campaign characters" on public.characters
  for update using (
    exists (
      select 1 from public.campaigns
      where id = campaign_id and dm_id = auth.uid()
    )
  );

create policy "Players can delete their own characters" on public.characters
  for delete using (player_id = auth.uid());

-- Sessions table (for session tracking)
create table public.sessions (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  session_number integer not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  summary text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(campaign_id, session_number)
);

alter table public.sessions enable row level security;

-- Sessions policies (same as campaigns)
create policy "Campaign members can view sessions" on public.sessions
  for select using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id
      and (
        c.dm_id = auth.uid()
        or exists (
          select 1 from public.campaign_members cm
          where cm.campaign_id = c.id and cm.user_id = auth.uid()
        )
      )
    )
  );

create policy "Only DM can manage sessions" on public.sessions
  for all using (
    exists (
      select 1 from public.campaigns
      where id = campaign_id and dm_id = auth.uid()
    )
  );

-- Function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger handle_profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_campaigns_updated_at before update on public.campaigns
  for each row execute procedure public.handle_updated_at();

create trigger handle_characters_updated_at before update on public.characters
  for each row execute procedure public.handle_updated_at();
