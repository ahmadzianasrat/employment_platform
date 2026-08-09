import { supabase } from '../../../lib/supabase/client';
import type { DocumentEntry, DocumentFile } from '../types/document';
import { MAX_FILE_SIZE_BYTES, ACCEPTED_FILE_TYPES } from '../data/documentTypes';
import { compressImageIfWorthwhile } from '../../../lib/utils/compressImage';

export function validateFile(file: File): string | null {
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return 'Only PDF, JPG, PNG, or WEBP files are accepted.';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'File is too large (max 15MB).';
  }
  return null;
}

/**
 * Creates a new document entry and uploads one or more files to it.
 * For single-entry (non-repeatable) types, the caller is responsible for
 * checking whether an entry already exists first (see fetchUserDocuments).
 */
export async function createEntryWithFiles(
  userId: string,
  documentType: string,
  label: string | null,
  files: File[]
): Promise<{ error: string | null }> {
  const { data: entry, error: entryError } = await supabase
    .from('document_entries')
    .insert({ user_id: userId, document_type: documentType, label })
    .select()
    .single();

  if (entryError || !entry) {
    return { error: entryError?.message ?? 'Failed to create document entry.' };
  }

  for (const file of files) {
    const validationError = validateFile(file);
    if (validationError) return { error: validationError };

    // Downscale/re-encode oversized photos before upload — keeps Storage
    // usage down without touching the file the user picked on disk.
    const uploadFile = await compressImageIfWorthwhile(file);

    const path = `${userId}/${entry.id}/${Date.now()}_${uploadFile.name}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(path, uploadFile);

    if (uploadError) {
      return { error: `Failed to upload ${file.name}: ${uploadError.message}` };
    }

    const { error: fileRowError } = await supabase.from('document_files').insert({
      entry_id: entry.id,
      user_id: userId,
      storage_path: path,
      original_filename: file.name,
      mime_type: uploadFile.type,
      size_bytes: uploadFile.size,
    });

    if (fileRowError) {
      return { error: fileRowError.message };
    }
  }

  return { error: null };
}

/** Adds files to an existing entry (e.g. adding another page/scan later). */
export async function addFilesToEntry(
  userId: string,
  entryId: string,
  files: File[]
): Promise<{ error: string | null }> {
  for (const file of files) {
    const validationError = validateFile(file);
    if (validationError) return { error: validationError };

    const uploadFile = await compressImageIfWorthwhile(file);

    const path = `${userId}/${entryId}/${Date.now()}_${uploadFile.name}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(path, uploadFile);
    if (uploadError) return { error: `Failed to upload ${file.name}: ${uploadError.message}` };

    const { error: fileRowError } = await supabase.from('document_files').insert({
      entry_id: entryId,
      user_id: userId,
      storage_path: path,
      original_filename: file.name,
      mime_type: uploadFile.type,
      size_bytes: uploadFile.size,
    });
    if (fileRowError) return { error: fileRowError.message };
  }
  return { error: null };
}

export async function fetchUserDocuments(userId: string): Promise<DocumentEntry[]> {
  const { data: entries, error: entriesError } = await supabase
    .from('document_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (entriesError || !entries) return [];

  const { data: files } = await supabase
    .from('document_files')
    .select('*')
    .eq('user_id', userId);

  return entries.map((entry) => ({
    ...entry,
    files: (files ?? []).filter((f) => f.entry_id === entry.id) as DocumentFile[],
  }));
}

export async function getSignedUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(storagePath, 60 * 10); // 10 minute link
  if (error || !data) return null;
  return data.signedUrl;
}

export async function deleteEntry(entryId: string, files: DocumentFile[]): Promise<void> {
  if (files.length > 0) {
    await supabase.storage.from('documents').remove(files.map((f) => f.storage_path));
  }
  await supabase.from('document_entries').delete().eq('id', entryId);
}

export async function deleteFile(file: DocumentFile): Promise<void> {
  await supabase.storage.from('documents').remove([file.storage_path]);
  await supabase.from('document_files').delete().eq('id', file.id);
}
