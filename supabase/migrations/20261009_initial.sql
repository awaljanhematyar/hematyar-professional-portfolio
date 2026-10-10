-- ====================================================================
-- PORTFOLIO DATABASE (Supabase PostgreSQL)
-- Creates tables, relationships, RLS policies, storage and helper RPCs.
-- This file is an initial migration. Do NOT rerun it against a live DB
-- without reviewing existing policies; CREATE POLICY may fail if duplicated.
-- IMPORTANT: schema is NOT proof that RLS is configured correctly.
-- ====================================================================

-- Production foundation: React + Supabase content platform.
-- Run in Supabase SQL editor or with Supabase CLI migrations.
-- No fabricated personal content is inserted by this migration.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

-- This SECURITY DEFINER function reads a private allowlist. Admin status cannot
-- be self-assigned by a browser client; only project owners can seed admin_users.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;
create policy "admins see own allowlist entry" on public.admin_users for select to authenticated using (user_id = (select auth.uid()) and public.is_admin());

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;

create table public.profiles (
  id boolean primary key default true check (id = true),
  full_name text not null,
  headline text,
  summary text,
  bio text,
  location text,
  email text,
  phone text,
  linkedin_url text,
  github_url text,
  profile_image_url text,
  cv_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id boolean primary key default true check (id = true),
  site_title text,
  seo_description text,
  footer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  icon text,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  description text,
  cover_url text,
  technologies text[] not null default '{}',
  category text,
  github_url text,
  live_url text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_slug check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
create table public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.experience (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  organization text not null,
  location text,
  start_date date,
  end_date date,
  description text,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  degree text not null,
  field text,
  start_date date,
  end_date date,
  description text,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text not null,
  issued_date date,
  description text,
  verification_url text,
  file_url text,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon text,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text not null,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 2 and 100),
  email text not null check (length(email) between 5 and 255),
  comment text not null check (length(comment) between 3 and 5000),
  status text not null default 'pending' check (status in ('pending','approved','rejected','hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 2 and 100),
  email text not null check (length(email) between 5 and 255),
  subject text not null check (length(subject) between 3 and 150),
  message text not null check (length(message) between 5 and 5000),
  is_read boolean not null default false,
  notification_status text not null default 'pending' check(notification_status in ('pending','sent','failed')),
  notification_attempts integer not null default 0,
  notification_sent_at timestamptz,
  notification_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.submission_rate_limits (
  identifier_hash text primary key,
  window_started timestamptz not null default now(),
  attempts integer not null default 0
);
alter table public.submission_rate_limits enable row level security;

-- A true atomic, database-backed limit (rather than an in-memory counter).
create or replace function public.check_submission_limit(p_hash text, p_limit integer default 5)
returns boolean language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  if length(p_hash) < 32 or p_limit < 1 or p_limit > 20 then return false; end if;
  insert into public.submission_rate_limits as limits (identifier_hash, window_started, attempts)
  values (p_hash,now(),1)
  on conflict(identifier_hash) do update set
    attempts = case when limits.window_started < now() - interval '1 hour' then 1 else limits.attempts + 1 end,
    window_started = case when limits.window_started < now() - interval '1 hour' then now() else limits.window_started end
  returning attempts into n;
  return n <= p_limit;
end $$;
revoke all on function public.check_submission_limit(text,integer) from public, anon, authenticated;
grant execute on function public.check_submission_limit(text,integer) to service_role;

-- Public comments are accessible ONLY through this function, never by selecting
-- comments.email. The function returns four explicitly enumerated safe columns.
create or replace function public.get_approved_comments()
returns table (id uuid,name text,comment text,created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select c.id,c.name,c.comment,c.created_at
  from public.comments c where c.status = 'approved'
  order by c.created_at desc limit 30;
$$;
revoke all on function public.get_approved_comments() from public;
grant execute on function public.get_approved_comments() to anon,authenticated,service_role;

-- Row-level security: publicly visible content only, admin-only mutations.
do $$ declare t text; begin
  foreach t in array array['profiles','skills','projects','experience','education','certificates','services','social_links'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('create policy "public published read" on public.%I for select to anon, authenticated using (published = true or public.is_admin())',t);
    execute format('create policy "admin insert" on public.%I for insert to authenticated with check (public.is_admin())',t);
    execute format('create policy "admin update" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())',t);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using (public.is_admin())',t);
  end loop;
end $$;
alter table public.project_images enable row level security;
create policy "public project image read" on public.project_images for select to anon, authenticated
  using ((published and exists (select 1 from public.projects p where p.id=project_id and p.published)) or public.is_admin());
create policy "admin project image insert" on public.project_images for insert to authenticated with check (public.is_admin());
create policy "admin project image update" on public.project_images for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin project image delete" on public.project_images for delete to authenticated using (public.is_admin());
alter table public.site_settings enable row level security;
create policy "public site settings read" on public.site_settings for select to anon, authenticated using (true);
create policy "admin site settings insert" on public.site_settings for insert to authenticated with check (public.is_admin());
create policy "admin site settings update" on public.site_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin site settings delete" on public.site_settings for delete to authenticated using (public.is_admin());
alter table public.comments enable row level security;
alter table public.contact_messages enable row level security;
-- IMPORTANT: no anonymous INSERT or SELECT policies on comments or messages.
-- Anonymous submissions must use the validated Supabase Edge Function instead.
create policy "admin read comments" on public.comments for select to authenticated using (public.is_admin());
create policy "admin update comments" on public.comments for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete comments" on public.comments for delete to authenticated using (public.is_admin());
create policy "admin read messages" on public.contact_messages for select to authenticated using (public.is_admin());
create policy "admin update messages" on public.contact_messages for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete messages" on public.contact_messages for delete to authenticated using (public.is_admin());

-- Timestamps on content mutations.
do $$ declare t text; begin
  foreach t in array array['profiles','site_settings','skills','projects','project_images','experience','education','certificates','services','social_links','comments','contact_messages'] loop
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', 'set_'||t||'_updated_at', t);
  end loop;
end $$;

create index on public.projects (published,sort_order);
create index on public.skills (published,sort_order);
create index on public.project_images (project_id,sort_order);
create index on public.comments (status,created_at desc);
create index on public.contact_messages (is_read,created_at desc);
create index on public.contact_messages (notification_status);

-- Explicit REST grants, followed by RLS enforcement.
do $$ declare t text; begin
  foreach t in array array['profiles','site_settings','skills','projects','project_images','experience','education','certificates','services','social_links'] loop
    execute format('grant select on public.%I to anon, authenticated',t);
    execute format('grant insert,update,delete on public.%I to authenticated',t);
  end loop;
end $$;
grant select,update,delete on public.comments,public.contact_messages to authenticated;
grant select on public.admin_users to authenticated;
revoke all on public.submission_rate_limits from anon,authenticated;

-- Public asset bucket; every write requires database-authorized admin status.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('portfolio-public','portfolio-public',true,8388608,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict(id) do nothing;
create policy "admin upload portfolio assets" on storage.objects for insert to authenticated
with check (bucket_id='portfolio-public' and public.is_admin());
create policy "admin update portfolio assets" on storage.objects for update to authenticated
using (bucket_id='portfolio-public' and public.is_admin()) with check (bucket_id='portfolio-public' and public.is_admin());
create policy "admin delete portfolio assets" on storage.objects for delete to authenticated
using (bucket_id='portfolio-public' and public.is_admin());

-- To authorize the first admin AFTER creating a Supabase Auth user, run:
-- insert into public.admin_users(user_id)
-- select id from auth.users where email = 'YOUR_ACTUAL_ADMIN_EMAIL';
-- No admin access is granted automatically.
