import { hasMeaningfulCv } from '../../cv/api/cvProfileApi';
import { fetchUserDocuments } from '../../documents/api/documentsApi';
import { DOCUMENT_TYPES } from '../../documents/data/documentTypes';

export interface ProfileCompletion {
  cvComplete: boolean;
  documentTypesUploaded: number;
  documentTypesTotal: number;
}

export async function getProfileCompletion(userId: string): Promise<ProfileCompletion> {
  const [cvComplete, entries] = await Promise.all([hasMeaningfulCv(userId), fetchUserDocuments(userId)]);

  const uploadedTypes = new Set(entries.filter((e) => e.files.length > 0).map((e) => e.document_type));

  return {
    cvComplete,
    documentTypesUploaded: uploadedTypes.size,
    documentTypesTotal: DOCUMENT_TYPES.length,
  };
}
