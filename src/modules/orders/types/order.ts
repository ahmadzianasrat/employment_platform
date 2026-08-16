export type PricingTier = '1' | '3';
export type PaymentMethod = 'easy_load' | 'hesab_pay';
export type ServiceRequestStatus = 'new' | 'in_progress' | 'delivered' | 'cancelled';
export type JobSlotStatus = 'pending' | 'in_progress' | 'delivered';

export interface ServiceRequestJob {
  id: string;
  service_request_id: string;
  slot_number: number;
  target_job_link: string | null;
  target_job_note: string | null;
  screenshot_storage_path: string | null;
  status: JobSlotStatus;
  delivered_cv_storage_path: string | null;
  delivered_cover_letter_storage_path: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: string;
  user_id: string;
  tier: PricingTier;
  contact_name: string;
  contact_phone: string;
  payment_method: PaymentMethod;
  payment_sender_number: string | null;
  payment_account_owner: string | null;
  payment_transaction_id: string | null;
  payment_sent_at: string | null;
  payment_proof_storage_path: string | null;
  notes: string | null;
  status: ServiceRequestStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequestWithJobs extends ServiceRequest {
  jobs: ServiceRequestJob[];
}

/** One job target the customer fills in on the order form or via "add another job." */
export interface JobTargetInput {
  targetJobLink: string;
  targetJobNote: string;
  screenshotFile: File | null;
}

export interface NewServiceRequestInput {
  tier: PricingTier;
  jobs: JobTargetInput[]; // 1 entry for tier '1', 1–3 for tier '3'
  contactName: string;
  contactPhone: string;
  paymentMethod: PaymentMethod;
  paymentSenderNumber: string;
  paymentAccountOwner: string;
  paymentTransactionId: string;
  paymentSentAt: string;
  notes: string;
  paymentProofFile: File | null;
}
