export interface DocumentFile {
  id: string;
  entry_id: string;
  user_id: string;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  uploaded_at: string;
}

export interface DocumentEntry {
  id: string;
  user_id: string;
  document_type: string;
  label: string | null;
  created_at: string;
  verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
  files: DocumentFile[];
}
