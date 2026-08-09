import { supabase } from '../../../lib/supabase/client';
import type { CvData } from '../types/cv';
import { EMPTY_CV } from '../types/cv';

export type CvTemplate = 'classic' | 'modern';

export interface CvProfile {
  data: CvData;
  template: CvTemplate;
}

export async function loadCvProfile(userId: string): Promise<CvProfile | null> {
  const { data, error } = await supabase
    .from('cv_profiles')
    .select('data, template')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    // Merge over EMPTY_CV so a profile saved before a new CvData field was
    // added doesn't come back missing that field.
    data: { ...EMPTY_CV, ...(data.data as Partial<CvData>) },
    template: (data.template as CvTemplate) ?? 'classic',
  };
}

export async function saveCvProfile(userId: string, profile: CvProfile): Promise<void> {
  await supabase.from('cv_profiles').upsert({
    user_id: userId,
    data: profile.data,
    template: profile.template,
    updated_at: new Date().toISOString(),
  });
}

/** Cheap check for the profile-completeness widget — avoids fetching full CV data just to know if one exists. */
export async function hasMeaningfulCv(userId: string): Promise<boolean> {
  const { data } = await supabase.from('cv_profiles').select('data').eq('user_id', userId).maybeSingle();
  if (!data) return false;
  const cv = data.data as Partial<CvData>;
  return Boolean(
    cv.fullName?.trim() && (cv.experience?.length || cv.education?.length)
  );
}
