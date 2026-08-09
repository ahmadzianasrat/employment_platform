import { hasMeaningfulCv } from '../../cv/api/cvProfileApi';
import { fetchUserDocuments } from '../../documents/api/documentsApi';
import { DOCUMENT_TYPES } from '../../documents/data/documentTypes';
import { ALL_IN_ONE_TYPE } from '../../documents/components/AllInOneUpload';

export interface ProfileCompletion {
  cvComplete: boolean;
  documentTypesUploaded: number;
  documentTypesTotal: number;
}

export async function getProfileCompletion(userId: string): Promise<ProfileCompletion> {
  const [cvComplete, entries] = await Promise.all([hasMeaningfulCv(userId), fetchUserDocuments(userId)]);

  const documentTypesTotal = DOCUMENT_TYPES.length;

  // A combined "all my documents in one PDF" upload satisfies the whole
  // requirement on its own — no need to also fill in every per-type slot.
  const hasAllInOne = entries.some((e) => e.document_type === ALL_IN_ONE_TYPE && e.files.length > 0);
  if (hasAllInOne) {
    return { cvComplete, documentTypesUploaded: documentTypesTotal, documentTypesTotal };
  }

  const uploadedTypes = new Set(entries.filter((e) => e.files.length > 0).map((e) => e.document_type));

  return {
    cvComplete,
    documentTypesUploaded: uploadedTypes.size,
    documentTypesTotal,
  };
}
