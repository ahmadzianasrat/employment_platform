export type PricingTier = '1' | '3';
export type PaymentMethod = 'easy_load' | 'hesab_pay';
export type ServiceRequestStatus = 'new' | 'in_progress' | 'delivered' | 'cancelled';

export interface ServiceRequest {
  id: string;
  user_id: string;
  tier: PricingTier;
  target_job_link: string | null;
  target_job_note: string | null;
  screenshot_storage_path: string | null;
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

export interface NewServiceRequestInput {
  tier: PricingTier;
  targetJobLink: string;
  targetJobNote: string;
  contactName: string;
  contactPhone: string;
  paymentMethod: PaymentMethod;
  paymentSenderNumber: string;
  paymentAccountOwner: string;
  paymentTransactionId: string;
  paymentSentAt: string;
  notes: string;
  screenshotFile: File | null;
  paymentProofFile: File | null;
}
