-- Blue Wallet Pro optional encrypted sync vault
-- Run this in the Supabase SQL editor for the project used by the app.
-- The browser encrypts the full wallet before upload; Supabase stores only ciphertext.

create table if not exists public.bluewallet_sync_vaults (
  id text primary key,
  updated_at timestamptz not null default now(),
  device_id text,
  payload jsonb not null
);

alter table public.bluewallet_sync_vaults enable row level security;

drop policy if exists "bluewallet anon read sync vaults" on public.bluewallet_sync_vaults;
drop policy if exists "bluewallet anon upsert sync vaults" on public.bluewallet_sync_vaults;

create policy "bluewallet anon read sync vaults"
on public.bluewallet_sync_vaults
for select
to anon
using (true);

create policy "bluewallet anon upsert sync vaults"
on public.bluewallet_sync_vaults
for all
to anon
using (true)
with check (true);

create index if not exists bluewallet_sync_vaults_updated_at_idx
on public.bluewallet_sync_vaults (updated_at desc);

-- Large-safe encrypted vault parts.
-- The app stores large encrypted backups in small text chunks to avoid Supabase statement timeouts.
create table if not exists public.bluewallet_sync_vault_chunks (
  id text primary key,
  vault_id text not null,
  chunk_index integer not null,
  chunk_count integer not null,
  updated_at timestamptz not null default now(),
  device_id text,
  payload_text text not null
);

alter table public.bluewallet_sync_vault_chunks enable row level security;

drop policy if exists "bluewallet anon read sync vault chunks" on public.bluewallet_sync_vault_chunks;
drop policy if exists "bluewallet anon upsert sync vault chunks" on public.bluewallet_sync_vault_chunks;

create policy "bluewallet anon read sync vault chunks"
on public.bluewallet_sync_vault_chunks
for select
to anon
using (true);

create policy "bluewallet anon upsert sync vault chunks"
on public.bluewallet_sync_vault_chunks
for all
to anon
using (true)
with check (true);

create index if not exists bluewallet_sync_vault_chunks_vault_idx
on public.bluewallet_sync_vault_chunks (vault_id, chunk_index);
