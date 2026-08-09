-- Migration 011: Blog
--
-- Simple admin-authored blog. Content is plain text with blank-line
-- paragraph breaks (rendered client-side) — not a rich-text/HTML editor.
-- That's a deliberate scope choice: a full WYSIWYG editor is a much
-- bigger feature than "add a blog section," and plain text sidesteps any
-- XSS risk from storing/rendering arbitrary HTML.

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug varchar(200) not null unique,
  title varchar(300) not null,
  excerpt varchar(500),
  content text not null,
  cover_image_url text,
  author varchar(200),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index blog_posts_published_idx on public.blog_posts (published, published_at desc);

alter table public.blog_posts enable row level security;

-- Public can read published posts only.
create policy "Anyone can view published posts"
  on public.blog_posts for select
  using (published = true);

-- Admins can see everything, including drafts.
create policy "Admins can view all posts"
  on public.blog_posts for select
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Admins can insert posts"
  on public.blog_posts for insert
  with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Admins can update posts"
  on public.blog_posts for update
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Admins can delete posts"
  on public.blog_posts for delete
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
