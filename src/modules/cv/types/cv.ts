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
};
