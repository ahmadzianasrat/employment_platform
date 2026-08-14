-- Migration 007: Admin document review
--
-- Previously (migration 005) documents were deliberately private to the
-- uploading user only, with a note that admin visibility was a conscious
-- decision to add later if wanted. This migration adds it:
--
--   1. Admins (rows in admin_users, same table used for job moderation)
--      can SELECT all document_entries / document_files / storage.objects
--      in the `documents` bucket. Admins are NOT granted INSERT/UPDATE/
--      DELETE on files or storage objects — review-only, defense in depth,
--      an admin account being compromised or misused shouldn't be able to
--      tamper with or remove a user's uploaded documents.
--   2. A `verified` flag (+ who/when) on document_entries, so an admin can
--      mark an entry as checked. Admins CAN update document_entries (to
--      set this flag) but still cannot touch document_files or storage.
--   3. A security-definer function so the admin UI can show which user an
--      entry belongs to. There's no `profiles` table in this project, and
--      admins don't otherwise have any way to read auth.users from the
--      client — this function is the narrow, admin-gated exception.

alter table public.document_entries
  add column verified boolean not null default false,
  add column verified_at timestamptz,
  add column verified_by uuid references auth.users(id);

-- Admins can view every document entry, regardless of owner.
create policy "Admins can view all document entries"
  on public.document_entries for select
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Admins can update entries — used only for the verified/verified_at/
-- verified_by fields from the app; RLS can't restrict to specific columns,
-- so this is enforced at the application layer, same pattern already used
-- for job moderation in migration 003.
create policy "Admins can update document entries"
  on public.document_entries for update
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Admins can view every document file's metadata (filename, size, etc.)
-- regardless of owner. This does NOT grant storage access by itself —
-- see the storage.objects policy below for actually opening/downloading
-- the file content.
create policy "Admins can view all document files"
  on public.document_files for select
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Admins can read (view/download via signed URL) any file in the
-- documents bucket, but cannot upload, overwrite, or delete — read-only
-- by design.
create policy "Admins can view all documents in storage"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  );

-- Lets the admin UI show "who uploaded this" without a profiles table.
-- SECURITY DEFINER so it can read auth.users, but it re-checks admin
-- status itself on every call rather than trusting the caller.
create or replace function public.admin_list_document_owners()
returns table (user_id uuid, email text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.admin_users a where a.user_id = auth.uid()) then
    raise exception 'Not authorized';
  end if;

  return query
    select distinct u.id, u.email::text
    from auth.users u
    join public.document_entries e on e.user_id = u.id;
end;
$$;

revoke all on function public.admin_list_document_owners() from public;
grant execute on function public.admin_list_document_owners() to authenticated;
