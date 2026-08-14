-- Migration 006: Document storage bucket
--
-- Creates a PRIVATE storage bucket for uploaded documents, and RLS
-- policies restricting each user to their own folder. Files are stored
-- under the path: {user_id}/{entry_id}/{filename} — the folder-based
-- policy below checks that the first path segment matches the
-- authenticated user's own ID, so nobody can read/write another user's
-- documents even with a guessed/leaked storage path.

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false);

create policy "Users can upload to their own document folder"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view their own documents"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own documents"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
