import { supabase } from '../../../lib/supabase/client';
import { compressImageIfWorthwhile } from '../../../lib/utils/compressImage';
import type { NewServiceRequestInput, JobTargetInput, ServiceRequestWithJobs } from '../types/order';

const ACCEPTED_IMAGE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

function validateFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Only PDF, JPG, PNG, or WEBP files are accepted.';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'File is too large (max 15MB).';
  }
  return null;
}

async function uploadOne(userId: string, folderId: string, file: File): Promise<{ path: string | null; error: string | null }> {
  const validationError = validateFile(file);
  if (validationError) return { path: null, error: validationError };

  const uploadFile = file.type === 'application/pdf' ? file : await compressImageIfWorthwhile(file);
  const path = `${userId}/${folderId}/${Date.now()}_${uploadFile.name}`;
  const { error } = await supabase.storage.from('service-requests').upload(path, uploadFile);
  if (error) return { path: null, error: `Upload failed: ${error.message}` };
  return { path, error: null };
}

/**
 * Creates the order row, then one service_request_jobs row per job the
 * customer filled in (1 for tier '1', 1–3 for tier '3'), uploading each
 * job's screenshot into that job's own folder, plus the payment-proof
 * screenshot into the order's folder.
 */
export async function submitServiceRequest(
  userId: string,
  input: NewServiceRequestInput
): Promise<{ error: string | null }> {
  const { data: row, error: insertError } = await supabase
    .from('service_requests')
    .insert({
      user_id: userId,
      tier: input.tier,
      contact_name: input.contactName,
      contact_phone: input.contactPhone,
      payment_method: input.paymentMethod,
      payment_sender_number: input.paymentSenderNumber || null,
      payment_account_owner: input.paymentAccountOwner || null,
      payment_transaction_id: input.paymentTransactionId || null,
      payment_sent_at: input.paymentSentAt ? new Date(input.paymentSentAt).toISOString() : null,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (insertError || !row) {
    return { error: insertError?.message ?? 'Failed to create the request.' };
  }

  if (input.paymentProofFile) {
    const { path, error } = await uploadOne(userId, row.id, input.paymentProofFile);
    if (error) return { error };
    if (path) {
      const { error: patchError } = await supabase.from('service_requests').update({ payment_proof_storage_path: path }).eq('id', row.id);
      if (patchError) return { error: patchError.message };
    }
  }

  for (let i = 0; i < input.jobs.length; i++) {
    const { error } = await createJobSlot(userId, row.id, i + 1, input.jobs[i]);
    if (error) return { error };
  }

  return { error: null };
}

async function createJobSlot(
  userId: string,
  serviceRequestId: string,
  slotNumber: number,
  job: JobTargetInput
): Promise<{ error: string | null }> {
  const { data: jobRow, error: jobError } = await supabase
    .from('service_request_jobs')
    .insert({
      service_request_id: serviceRequestId,
      slot_number: slotNumber,
      target_job_link: job.targetJobLink || null,
      target_job_note: job.targetJobNote || null,
    })
    .select()
    .single();

  if (jobError || !jobRow) return { error: jobError?.message ?? 'Failed to save the job.' };

  if (job.screenshotFile) {
    const { path, error } = await uploadOne(userId, jobRow.id, job.screenshotFile);
    if (error) return { error };
    if (path) {
      const { error: patchError } = await supabase.from('service_request_jobs').update({ screenshot_storage_path: path }).eq('id', jobRow.id);
      if (patchError) return { error: patchError.message };
    }
  }

  return { error: null };
}

/** Adds one more job to an existing tier-3 order that still has open slots. */
export async function addJobToRequest(
  userId: string,
  serviceRequestId: string,
  nextSlotNumber: number,
  job: JobTargetInput
): Promise<{ error: string | null }> {
  return createJobSlot(userId, serviceRequestId, nextSlotNumber, job);
}

export async function fetchMyServiceRequests(userId: string): Promise<ServiceRequestWithJobs[]> {
  const { data: requests, error } = await supabase
    .from('service_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !requests) return [];

  const { data: jobs } = await supabase
    .from('service_request_jobs')
    .select('*')
    .in('service_request_id', requests.map((r) => r.id))
    .order('slot_number', { ascending: true });

  return requests.map((r) => ({
    ...r,
    jobs: (jobs ?? []).filter((j) => j.service_request_id === r.id),
  })) as ServiceRequestWithJobs[];
}

/** Signed URL for a delivered CV or cover letter — relies on the user-scoped 'deliverables' bucket policy from migration 016. */
export async function getDeliverableFileUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from('deliverables').createSignedUrl(storagePath, 60 * 10);
  if (error || !data) return null;
  return data.signedUrl;
}
