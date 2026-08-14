-- Migration 015: Service requests (paid CV/cover letter package orders)
--
-- Replaces the job board with a paid-service request flow: a signed-in
-- user submits the job they want to apply for (a link and/or a
-- screenshot), picks a pricing tier, and tells us how they paid
-- (easy-load or HesabPay). An admin reviews it and, once payment is
-- confirmed, prepares and delivers the final PDF package by hand
-- (outside this app — see CHANGES.md "Order fulfillment" note).
--
-- Same ownership/visibility pattern as document_entries (migration 005)
-- + admin review (migration 007): the requester can see and create their
-- own rows only; admins (admin_users) can see and update every row, to
-- move a request through its status.

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Pricing tier requested. '1' = 80 AFN / 1 job application,
  -- '3' = 200 AFN / 3 job applications. Kept as text, not an enum, so a
  -- future tier doesn't need a migration to add.
  tier varchar(20) not null,

  -- The job(s) being applied for. At least one of these two should be
  -- filled in practice (enforced in the UI, not the DB, to keep this
  -- flexible for the "3 applications" tier where a user might send
  -- several links in one note).
  target_job_link text,
  target_job_note text, -- free text: which platform, job title, or "see screenshot"
  screenshot_storage_path text, -- path in the 'service-requests' bucket, nullable

  -- Contact details, since a request is not itself a live chat.
  contact_name varchar(255) not null,
  contact_phone varchar(50) not null,

  -- Payment method + the details we ask for per method (see GuidePage /
  -- OrderPage copy for exactly what's requested of the customer):
  --   easy_load: agent/sender phone number, amount, sent_at, transaction id (optional)
  --   hesab_pay: the HesabPay number paid FROM, who owns that number, amount, sent_at
  payment_method varchar(20) not null, -- 'easy_load' | 'hesab_pay'
  payment_sender_number varchar(50), -- easy-load: agent or own number. hesabPay: number paid from
  payment_account_owner varchar(255), -- hesabPay: name on the number paid from
  payment_transaction_id varchar(255), -- easy-load transaction number, if available
  payment_sent_at timestamptz, -- when the customer says they sent the payment
  payment_proof_storage_path text, -- path to the payment screenshot in the bucket, nullable

  notes text, -- anything else the customer wants us to know

  status varchar(20) not null default 'new', -- 'new' | 'in_progress' | 'delivered' | 'cancelled'
  admin_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index service_requests_user_idx on public.service_requests (user_id);
create index service_requests_status_idx on public.service_requests (status);

alter table public.service_requests enable row level security;

create policy "Users can view their own service requests"
  on public.service_requests for select
  using (auth.uid() = user_id);

create policy "Users can create their own service requests"
  on public.service_requests for insert
  with check (auth.uid() = user_id);

-- No update/delete policy for regular users — once submitted, a request
-- is only edited by contacting us directly (same reasoning as the "no
-- self-service account deletion" note in README: keeps the payment trail
-- from a paying customer intact and unambiguous).

create policy "Admins can view all service requests"
  on public.service_requests for select
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Admins can update service requests"
  on public.service_requests for update
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Lets the admin UI show "who submitted this" without a profiles table,
-- same pattern as admin_list_document_owners() in migration 007.
create or replace function public.admin_list_service_request_owners()
returns table (user_id uuid, email text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.admin_users a where a.user_id = auth.uid()) then
    raise exception 'Not authorized';
  end if;

  return query
    select distinct u.id, u.email::text
    from auth.users u
    join public.service_requests r on r.user_id = u.id;
end;
$$;

revoke all on function public.admin_list_service_request_owners() from public;
grant execute on function public.admin_list_service_request_owners() to authenticated;

-- Private storage bucket for the target-job screenshot and the payment
-- proof screenshot. Same folder-scoped policy shape as the 'documents'
-- bucket (migration 006): {user_id}/{request_id}/{filename}.

insert into storage.buckets (id, name, public)
values ('service-requests', 'service-requests', false);

create policy "Users can upload to their own service-request folder"
  on storage.objects for insert
  with check (
    bucket_id = 'service-requests'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view their own service-request files"
  on storage.objects for select
  using (
    bucket_id = 'service-requests'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Admins can view all service-request files"
  on storage.objects for select
  using (
    bucket_id = 'service-requests'
    and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  );
