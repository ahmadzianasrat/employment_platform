import { supabase } from '../../../lib/supabase/client';

const TIER_PRICE_AFN: Record<string, number> = { '1': 80, '3': 200 };

export interface DashboardStats {
  ordersByStatus: { new: number; in_progress: number; delivered: number; cancelled: number };
  totalOrders: number;
  estimatedRevenueAfn: number; // sum of tier price for every non-cancelled order
  jobsPendingCount: number; // job slots not yet delivered, across all orders
  documentsPendingVerification: number;
  blogDrafts: number;
  recentOrders: { id: string; contactName: string; tier: string; status: string; createdAt: string }[];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [requestsRes, jobsRes, docsRes, blogRes] = await Promise.all([
    supabase.from('service_requests').select('id, contact_name, tier, status, created_at').order('created_at', { ascending: false }),
    supabase.from('service_request_jobs').select('status'),
    supabase.from('document_entries').select('id').eq('verified', false),
    supabase.from('blog_posts').select('id').eq('published', false),
  ]);

  const requests = requestsRes.data ?? [];
  const jobs = jobsRes.data ?? [];

  const ordersByStatus = { new: 0, in_progress: 0, delivered: 0, cancelled: 0 };
  let estimatedRevenueAfn = 0;
  for (const r of requests) {
    const key = r.status as keyof typeof ordersByStatus;
    if (key in ordersByStatus) ordersByStatus[key]++;
    if (r.status !== 'cancelled') estimatedRevenueAfn += TIER_PRICE_AFN[r.tier] ?? 0;
  }

  const jobsPendingCount = jobs.filter((j) => j.status !== 'delivered').length;

  return {
    ordersByStatus,
    totalOrders: requests.length,
    estimatedRevenueAfn,
    jobsPendingCount,
    documentsPendingVerification: docsRes.data?.length ?? 0,
    blogDrafts: blogRes.data?.length ?? 0,
    recentOrders: requests.slice(0, 5).map((r) => ({
      id: r.id,
      contactName: r.contact_name,
      tier: r.tier,
      status: r.status,
      createdAt: r.created_at,
    })),
  };
}
