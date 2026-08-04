export interface Job {
  id: string;
  source: string;
  source_job_id: string;
  title: string;
  employer: string | null;
  location: string | null;
  deadline_raw: string | null;
  expires_on: string | null;
  source_url: string;
  education: string | null;
  experience: string | null;
  description: string | null;
  source_label: string | null;
  is_manual: boolean;
  status: 'active' | 'hidden' | 'expired';
  scraped_at: string | null;
  created_at: string;
  profession: string | null;
  gender: string | null;
}
