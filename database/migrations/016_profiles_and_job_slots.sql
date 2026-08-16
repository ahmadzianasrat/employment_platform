-- Migration 016: Profiles + per-job order slots + delivered files
--
-- Three additions, all from the same feature request (a "My Profile"
-- page with contact numbers, tier-3 quota tracking, and downloadable
-- delivered files):
--
-- 1. `profiles` — one row per user for contact numbers (mobile +
--    WhatsApp), separate from `contact_name`/`contact_phone` on
--    service_requests (which are per-order, in case someone orders on
--    behalf of a relative and gives a different number for that order).
--
-- 2. `service_requests` is normalized: the tier-3 package is "3 separate
--    job applications," not one job three times, so a single request
--    needs to hold up to 3 independent job targets, each independently
--    trackable and independently deliverable. `target_job_link`,
--    `target_job_note`, and `screenshot_storage_path` move out of
--    service_requests and into a new `service_request_jobs` child table,
--    one row per job slot. Existing rows (if migration 015 is already
--    live with real orders) are backfilled into a single first job slot
--    so nothing is lost.
--
-- 3. `deliverables` storage bucket — where an admin uploads the finished
--    CV + cover letter PDF for a job slot, which the customer can then
--    see and download from their Profile page. Deliberately CV +
--    cover letter only (not the full merged package with ID
--    card/diplomas/etc.) per the feature request — the full package
--    with personal documents stays a manual, outside-the-app delivery
--    (WhatsApp/email), consistent with the private-by-default handling
--    of ID scans elsewhere in this app.

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  mobile_phone varchar(50),
  whatsapp_phone varchar(50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- service_request_jobs — one row per job application slot in an order.
-- Tier '1' orders get exactly 1 row; tier '3' orders get 1–3 rows,
-- filled in at order time or added later from the Profile page (see
-- serviceRequestsApi.addJobToRequest) until all 3 slots are used.

create table public.service_request_jobs (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests(id) on delete cascade,
  slot_number smallint not null check (slot_number between 1 and 3),

  target_job_link text,
  target_job_note text,
  screenshot_storage_path text,

  status varchar(20) not null default 'pending', -- 'pending' | 'in_progress' | 'delivered'
  delivered_cv_storage_path text,
  delivered_cover_letter_storage_path text,
  delivered_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (service_request_id, slot_number)
);

create index service_request_jobs_request_idx on public.service_request_jobs (service_request_id);

alter table public.service_request_jobs enable row level security;

-- Ownership is via the parent service_requests row, same join pattern
-- used for admin visibility elsewhere in this file.
create policy "Users can view their own request jobs"
  on public.service_request_jobs for select
  using (exists (
    select 1 from public.service_requests r
    where r.id = service_request_id and r.user_id = auth.uid()
  ));

create policy "Users can create job slots on their own requests"
  on public.service_request_jobs for insert
  with check (exists (
    select 1 from public.service_requests r
    where r.id = service_request_id and r.user_id = auth.uid()
  ));

create policy "Admins can view all request jobs"
  on public.service_request_jobs for select
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Admins can update request jobs"
  on public.service_request_jobs for update
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- --------------------------------------------------------------------
-- Backfill: if service_requests already has real rows with the old
-- inline job columns (migration 015 was live before this one), move
-- each into a slot-1 service_request_jobs row so no order loses its
-- job link/screenshot in the transition.

insert into public.service_request_jobs (service_request_id, slot_number, target_job_link, target_job_note, screenshot_storage_path, created_at)
select id, 1, target_job_link, target_job_note, screenshot_storage_path, created_at
from public.service_requests
where target_job_link is not null or target_job_note is not null or screenshot_storage_path is not null;

alter table public.service_requests
  drop column if exists target_job_link,
  drop column if exists target_job_note,
  drop column if exists screenshot_storage_path;

-- --------------------------------------------------------------------
-- Private storage bucket for admin-delivered CV/cover-letter PDFs.
-- Folder-scoped like 'documents' and 'service-requests':
-- {user_id}/{job_id}/{filename}. Only admins upload here; customers
-- only ever read.

insert into storage.buckets (id, name, public)
values ('deliverables', 'deliverables', false);

create policy "Users can view their own delivered files"
  on storage.objects for select
  using (
    bucket_id = 'deliverables'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Admins can manage delivered files"
  on storage.objects for all
  using (
    bucket_id = 'deliverables'
    and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  )
  with check (
    bucket_id = 'deliverables'
    and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  );
