export interface DocumentTypeConfig {
  key: string;
  labelKey: string; // key into STRINGS.documents
  repeatable: boolean; // true = user can add multiple entries (e.g. multiple degrees)
}

export const DOCUMENT_TYPES: DocumentTypeConfig[] = [
  { key: 'id_card', labelKey: 'idCard', repeatable: false },
  { key: 'passport', labelKey: 'passport', repeatable: false },
  { key: 'driving_license', labelKey: 'drivingLicense', repeatable: false },
  { key: 'tin', labelKey: 'tin', repeatable: false },
  { key: 'school_diploma', labelKey: 'schoolDiploma', repeatable: false },
  { key: 'university_diploma', labelKey: 'universityDiploma', repeatable: true },
  { key: 'work_experience', labelKey: 'workExperience', repeatable: true },
  { key: 'employment_contract', labelKey: 'employmentContract', repeatable: true },
  { key: 'reference', labelKey: 'reference', repeatable: true },
];

export const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
export const ACCEPTED_FILE_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.webp';
export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB per file
