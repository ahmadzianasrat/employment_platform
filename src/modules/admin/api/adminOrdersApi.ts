import { supabase } from '../../../lib/supabase/client';
import type { ServiceRequest, ServiceRequestStatus } from '../../orders/types/order';

export interface AdminServiceRequest extends ServiceRequest {
  ownerEmail: string | null;
}

/** Fetches every service request across all users, for admin review. */
export async function fetchAllServiceRequestsForAdmin(): Promise<AdminServiceRequest[]> {
  const [{ data: requests, error: requestsError }, { data: owners, error: ownersError }] = await Promise.all([
    supabase.from('service_requests').select('*').order('created_at', { ascending: false }),
    supabase.rpc('admin_list_service_request_owners'),
  ]);

  if (requestsError || !requests) throw requestsError ?? new Error('Failed to load service requests.');
  if (ownersError) throw ownersError;

  const emailByUserId = new Map<string, string>(
    (owners ?? []).map((o: { user_id: string; email: string }) => [o.user_id, o.email])
  );

  return requests.map((r) => ({
    ...r,
    ownerEmail: emailByUserId.get(r.user_id) ?? null,
  })) as AdminServiceRequest[];
}

/** Admin-side signed URL — relies on the admin storage.objects SELECT policy from migration 015. */
export async function getServiceRequestFileUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from('service-requests').createSignedUrl(storagePath, 60 * 10);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function setServiceRequestStatus(id: string, status: ServiceRequestStatus): Promise<void> {
  const { error } = await supabase.from('service_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function setServiceRequestAdminNotes(id: string, adminNotes: string): Promise<void> {
  const { error } = await supabase.from('service_requests').update({ admin_notes: adminNotes, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}
