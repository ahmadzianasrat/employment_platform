export interface CvEducationEntry {
  id: string;
  institution: string;
  degree: string;
  year: string;
}

export interface CvExperienceEntry {
  id: string;
  employer: string;
  role: string;
  duration: string;
  description: string;
}

export type LanguageProficiency = 'native' | 'fluent' | 'advanced' | 'intermediate' | 'basic';

export interface CvLanguageEntry {
  id: string;
  name: string;
  proficiency: LanguageProficiency;
}

export interface CvData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  summary: string;
  education: CvEducationEntry[];
  experience: CvExperienceEntry[];
  skills: string;
  languages: CvLanguageEntry[];
  /**
   * A small square JPEG, stored as a data URL (e.g. "data:image/jpeg;base64,...")
   * directly inside this JSON blob rather than as a separate Supabase Storage
   * file — deliberately, since cv_profiles.data is already a flexible jsonb
   * column (see cvProfileApi.ts), so this needed no migration and no new
   * Storage bucket/policies. Compressed client-side to ~200px square before
   * being set here (see compressAvatarToDataUrl.ts) specifically to keep this
   * row small — do not store an uncompressed photo here.
   * null/undefined = no photo uploaded; templates that support a photo slot
   * fall back to a colored initials avatar rather than an empty box.
   */
  photoDataUrl?: string | null;
}

export const EMPTY_CV: CvData = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  location: '',
  summary: '',
  education: [],
  experience: [],
  skills: '',
  languages: [],
  photoDataUrl: null,
};
