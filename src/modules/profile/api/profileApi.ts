import { supabase } from '../../../lib/supabase/client';
import type { Language } from '../../../lib/i18n/strings';

export interface Profile {
  mobile_phone: string | null;
  whatsapp_phone: string | null;
  preferred_language: Language;
}

export async function loadProfile(userId: string): Promise<Profile> {
  const { data } = await supabase
    .from('profiles')
    .select('mobile_phone, whatsapp_phone, preferred_language')
    .eq('user_id', userId)
    .maybeSingle();
  return {
    mobile_phone: data?.mobile_phone ?? null,
    whatsapp_phone: data?.whatsapp_phone ?? null,
    // Matches the migration 019 column default — new/never-saved profiles
    // read as Pashto rather than English.
    preferred_language: (data?.preferred_language as Language | undefined) ?? 'ps',
  };
}

export async function saveProfile(userId: string, profile: Profile): Promise<{ error: string | null }> {
  const { error } = await supabase.from('profiles').upsert({
    user_id: userId,
    mobile_phone: profile.mobile_phone || null,
    whatsapp_phone: profile.whatsapp_phone || null,
    preferred_language: profile.preferred_language,
    updated_at: new Date().toISOString(),
  });
  return { error: error?.message ?? null };
}
