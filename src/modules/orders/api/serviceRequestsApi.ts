import { supabase } from '../../../lib/supabase/client';
import { compressImageIfWorthwhile } from '../../../lib/utils/compressImage';
import type { NewServiceRequestInput, ServiceRequest } from '../types/order';

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

async function uploadOne(userId: string, requestId: string, file: File): Promise<{ path: string | null; error: string | null }> {
  const validationError = validateFile(file);
  if (validationError) return { path: null, error: validationError };

  const uploadFile = file.type === 'application/pdf' ? file : await compressImageIfWorthwhile(file);
  const path = `${userId}/${requestId}/${Date.now()}_${uploadFile.name}`;
  const { error } = await supabase.storage.from('service-requests').upload(path, uploadFile);
  if (error) return { path: null, error: `Upload failed: ${error.message}` };
  return { path, error: null };
}

/**
 * Creates a service request row first (so we have an id for the storage
 * path), then uploads the target-job screenshot and/or payment-proof
 * screenshot into that request's folder and patches the row with the
 * resulting paths. Mirrors documentsApi.createEntryWithFiles.
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
      target_job_link: input.targetJobLink || null,
      target_job_note: input.targetJobNote || null,
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

  const patch: Record<string, string> = {};

  if (input.screenshotFile) {
    const { path, error } = await uploadOne(userId, row.id, input.screenshotFile);
    if (error) return { error };
    if (path) patch.screenshot_storage_path = path;
  }

  if (input.paymentProofFile) {
    const { path, error } = await uploadOne(userId, row.id, input.paymentProofFile);
    if (error) return { error };
    if (path) patch.payment_proof_storage_path = path;
  }

  if (Object.keys(patch).length > 0) {
    const { error: patchError } = await supabase.from('service_requests').update(patch).eq('id', row.id);
    if (patchError) return { error: patchError.message };
  }

  return { error: null };
}

export async function fetchMyServiceRequests(userId: string): Promise<ServiceRequest[]> {
  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as ServiceRequest[];
}
