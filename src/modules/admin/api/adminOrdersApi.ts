import { supabase } from '../../../lib/supabase/client';
import { compressImageIfWorthwhile } from '../../../lib/utils/compressImage';
import type { ServiceRequestStatus, ServiceRequestWithJobs, JobSlotStatus } from '../../orders/types/order';

export interface AdminServiceRequest extends ServiceRequestWithJobs {
  ownerEmail: string | null;
  ownerProfileName: string | null;
}

/** Fetches every order + its job slots across all users, for admin review. */
export async function fetchAllServiceRequestsForAdmin(): Promise<AdminServiceRequest[]> {
  const [{ data: requests, error: requestsError }, { data: owners, error: ownersError }, { data: jobs }] = await Promise.all([
    supabase.from('service_requests').select('*').order('created_at', { ascending: false }),
    supabase.rpc('admin_list_service_request_owners'),
    supabase.from('service_request_jobs').select('*').order('slot_number', { ascending: true }),
  ]);

  if (requestsError || !requests) throw requestsError ?? new Error('Failed to load orders.');
  if (ownersError) throw ownersError;

  const emailByUserId = new Map<string, string>(
    (owners ?? []).map((o: { user_id: string; email: string }) => [o.user_id, o.email])
  );

  return requests.map((r) => ({
    ...r,
    jobs: (jobs ?? []).filter((j) => j.service_request_id === r.id),
    ownerEmail: emailByUserId.get(r.user_id) ?? null,
    ownerProfileName: r.contact_name ?? null,
  })) as AdminServiceRequest[];
}

/** Admin-side signed URL for a job/payment screenshot — relies on the admin storage.objects SELECT policy from migration 015. */
export async function getServiceRequestFileUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from('service-requests').createSignedUrl(storagePath, 60 * 10);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function setServiceRequestStatus(id: string, status: ServiceRequestStatus): Promise<void> {
  const { error } = await supabase.from('service_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function setJobSlotStatus(jobId: string, status: JobSlotStatus): Promise<void> {
  const { error } = await supabase.from('service_request_jobs').update({ status, updated_at: new Date().toISOString() }).eq('id', jobId);
  if (error) throw error;
}

/**
 * Uploads the finished CV or cover letter PDF for a job slot into the
 * private 'deliverables' bucket (folder-scoped to the owning customer,
 * per migration 016), and records the path + delivered_at on the job
 * row so it shows up on the customer's Profile page.
 */
export async function uploadDeliverable(
  customerUserId: string,
  jobId: string,
  kind: 'cv' | 'cover_letter',
  file: File
): Promise<{ error: string | null }> {
  const uploadFile = file.type.startsWith('image/') ? await compressImageIfWorthwhile(file) : file;
  const path = `${customerUserId}/${jobId}/${kind}_${Date.now()}_${uploadFile.name}`;
  const { error: uploadError } = await supabase.storage.from('deliverables').upload(path, uploadFile);
  if (uploadError) return { error: uploadError.message };

  const column = kind === 'cv' ? 'delivered_cv_storage_path' : 'delivered_cover_letter_storage_path';
  const { error: patchError } = await supabase
    .from('service_request_jobs')
    .update({ [column]: path, updated_at: new Date().toISOString() })
    .eq('id', jobId);
  if (patchError) return { error: patchError.message };

  return { error: null };
}

export async function markJobDelivered(jobId: string): Promise<void> {
  const { error } = await supabase
    .from('service_request_jobs')
    .update({ status: 'delivered', delivered_at: new Date().toISOString() })
    .eq('id', jobId);
  if (error) throw error;
}
