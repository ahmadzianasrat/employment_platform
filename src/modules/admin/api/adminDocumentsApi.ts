import { supabase } from '../../../lib/supabase/client';
import type { DocumentEntry, DocumentFile } from '../../documents/types/document';

export interface AdminDocumentEntry extends DocumentEntry {
  ownerEmail: string | null;
}

/** Fetches every document entry + its files across all users, for admin review. */
export async function fetchAllDocumentsForAdmin(): Promise<AdminDocumentEntry[]> {
  const [{ data: entries, error: entriesError }, { data: files }, { data: owners, error: ownersError }] =
    await Promise.all([
      supabase.from('document_entries').select('*').order('created_at', { ascending: false }),
      supabase.from('document_files').select('*'),
      supabase.rpc('admin_list_document_owners'),
    ]);

  if (entriesError || !entries) throw entriesError ?? new Error('Failed to load document entries.');
  if (ownersError) throw ownersError;

  const emailByUserId = new Map<string, string>((owners ?? []).map((o: { user_id: string; email: string }) => [o.user_id, o.email]));

  return entries.map((entry) => ({
    ...entry,
    files: (files ?? []).filter((f) => f.entry_id === entry.id) as DocumentFile[],
    ownerEmail: emailByUserId.get(entry.user_id) ?? null,
  })) as AdminDocumentEntry[];
}

/** Admin-side signed URL — relies on the admin storage.objects SELECT policy from migration 007. */
export async function getSignedUrlForAdmin(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from('documents').createSignedUrl(storagePath, 60 * 10);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function setEntryVerified(entryId: string, verified: boolean, adminUserId: string): Promise<void> {
  const { error } = await supabase
    .from('document_entries')
    .update({
      verified,
      verified_at: verified ? new Date().toISOString() : null,
      verified_by: verified ? adminUserId : null,
    })
    .eq('id', entryId);
  if (error) throw error;
}
