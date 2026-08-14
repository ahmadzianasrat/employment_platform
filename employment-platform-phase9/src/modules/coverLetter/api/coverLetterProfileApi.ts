import { supabase } from '../../../lib/supabase/client';
import type { CoverLetterData } from '../types/coverLetter';
import { EMPTY_COVER_LETTER } from '../types/coverLetter';

export type CoverLetterTemplate = 'formal' | 'modern';

export interface CoverLetterProfile {
  data: CoverLetterData;
  template: CoverLetterTemplate;
}

export async function loadCoverLetterProfile(userId: string): Promise<CoverLetterProfile | null> {
  const { data, error } = await supabase
    .from('cover_letter_profiles')
    .select('data, template')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    data: { ...EMPTY_COVER_LETTER, ...(data.data as Partial<CoverLetterData>) },
    template: (data.template as CoverLetterTemplate) ?? 'formal',
  };
}

export async function saveCoverLetterProfile(userId: string, profile: CoverLetterProfile): Promise<void> {
  await supabase.from('cover_letter_profiles').upsert({
    user_id: userId,
    data: profile.data,
    template: profile.template,
    updated_at: new Date().toISOString(),
  });
}
