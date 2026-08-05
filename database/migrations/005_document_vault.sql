-- Migration 005: Document vault
--
-- Two-table design:
-- - document_entries: one row per "instance" of a document (e.g. one
--   specific university diploma, one specific job's employment contract).
--   Single-value document types (ID card, passport, etc.) are enforced to
--   have at most one entry per user at the application level, not the DB
--   level — keeps the schema simple and identical for both repeatable and
--   single types.
-- - document_files: one or more actual files attached to an entry (e.g.
--   front + back of an ID card, or a diploma scan + transcript for one
--   university entry).
--
-- Files themselves live in Supabase Storage (private bucket), not in the
-- database — these tables only store metadata + storage paths.

create table public.document_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type varchar(50) not null,
  label varchar(255), -- e.g. "Kabul University — BSc Nursing" for repeatable types
  created_at timestamptz not null default now()
);

create table public.document_files (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.document_entries(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, -- duplicated from entry for simpler/faster RLS
  storage_path text not null,
  original_filename varchar(500) not null,
  mime_type varchar(100) not null,
  size_bytes bigint not null,
  uploaded_at timestamptz not null default now()
);

create index document_entries_user_idx on public.document_entries (user_id);
create index document_files_entry_idx on public.document_files (entry_id);
create index document_files_user_idx on public.document_files (user_id);

alter table public.document_entries enable row level security;
alter table public.document_files enable row level security;

-- Documents are private to their owner — NOT visible to admins by default.
-- (If admin verification of documents is wanted later, that's a deliberate
-- additional policy to add, not assumed here.)

create policy "Users can view their own document entries"
  on public.document_entries for select
  using (auth.uid() = user_id);

create policy "Users can create their own document entries"
  on public.document_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own document entries"
  on public.document_entries for delete
  using (auth.uid() = user_id);

create policy "Users can view their own document files"
  on public.document_files for select
  using (auth.uid() = user_id);

create policy "Users can upload their own document files"
  on public.document_files for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own document files"
  on public.document_files for delete
  using (auth.uid() = user_id);
