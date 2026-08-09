import { supabase } from '../../../lib/supabase/client';

export interface JobAlert {
  id: string;
  user_id: string;
  label: string | null;
  province: string; // 'all' or a province key
  profession: string; // 'all' or exact profession string
  created_at: string;
}

export async function fetchJobAlerts(userId: string): Promise<JobAlert[]> {
  const { data, error } = await supabase
    .from('job_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as JobAlert[];
}

export async function createJobAlert(
  userId: string,
  alert: { label: string | null; province: string; profession: string }
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('job_alerts').insert({ user_id: userId, ...alert });
  return { error: error?.message ?? null };
}

export async function deleteJobAlert(alertId: string): Promise<void> {
  await supabase.from('job_alerts').delete().eq('id', alertId);
}
