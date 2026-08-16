import { supabase } from '../../../lib/supabase/client';

export interface Profile {
  mobile_phone: string | null;
  whatsapp_phone: string | null;
}

export async function loadProfile(userId: string): Promise<Profile> {
  const { data } = await supabase.from('profiles').select('mobile_phone, whatsapp_phone').eq('user_id', userId).maybeSingle();
  return { mobile_phone: data?.mobile_phone ?? null, whatsapp_phone: data?.whatsapp_phone ?? null };
}

export async function saveProfile(userId: string, profile: Profile): Promise<{ error: string | null }> {
  const { error } = await supabase.from('profiles').upsert({
    user_id: userId,
    mobile_phone: profile.mobile_phone || null,
    whatsapp_phone: profile.whatsapp_phone || null,
    updated_at: new Date().toISOString(),
  });
  return { error: error?.message ?? null };
}
