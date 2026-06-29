-- campaign_notes table: campaign-scoped notes managed by the DM.
-- Mirrors the npcs table pattern established in 20250102000000_extended_schema.sql.

create table public.campaign_notes (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.campaign_notes enable row level security;

create policy "Campaign members can view campaign_notes" on public.campaign_notes
  for select using (
    public.is_campaign_dm(campaign_id) or public.is_campaign_member(campaign_id)
  );

create policy "Only DM can manage campaign_notes" on public.campaign_notes
  for all using (public.is_campaign_dm(campaign_id));

create index idx_campaign_notes_campaign on public.campaign_notes(campaign_id);

create trigger handle_campaign_notes_updated_at before update on public.campaign_notes
  for each row execute procedure public.handle_updated_at();
