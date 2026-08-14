-- Migration 001: Core schema (jobs, saved_jobs)
-- Run once, in order, in the Supabase SQL Editor.

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  source varchar(32) not null,
  source_job_id varchar(64) not null,
  title varchar(500) not null,
  employer varchar(500),
  location varchar(500),
  deadline_raw varchar(50),
  expires_on date,
  source_url varchar(1000) not null,
  education text,
  experience text,
  description text,
  source_label varchar(50),
  is_manual boolean not null default false,
  status varchar(20) not null default 'active',
  scraped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint jobs_source_unique unique (source, source_job_id)
);

create index jobs_status_idx on public.jobs (status);
create index jobs_expires_on_idx on public.jobs (expires_on);

create table public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),

  constraint saved_jobs_unique unique (user_id, job_id)
);

alter table public.jobs enable row level security;
alter table public.saved_jobs enable row level security;

create policy "Jobs are publicly readable"
  on public.jobs for select
  using (status = 'active');

create policy "Users can view their own saved jobs"
  on public.saved_jobs for select
  using (auth.uid() = user_id);

create policy "Users can save jobs"
  on public.saved_jobs for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave their own jobs"
  on public.saved_jobs for delete
  using (auth.uid() = user_id);
