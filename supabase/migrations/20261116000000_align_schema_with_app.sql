-- =============================================================================
-- Bayt Al-Hikma — schema alignment migration
-- File: supabase/migrations/20261116000000_align_schema_with_app.sql
--
-- Fixes: ERROR  column articles.reading_time does not exist
-- and brings the database in line with every table / column / policy the
-- Next.js app (src/**) reads or writes.
--
-- SAFE TO RE-RUN: every statement is idempotent (IF NOT EXISTS / OR REPLACE /
-- DROP ... IF EXISTS before CREATE). It never drops columns or data.
--
-- Run in: Supabase Dashboard → SQL Editor (as the project owner), or
--         `supabase db push` if you use the Supabase CLI.
--
-- AFTER RUNNING: promote your own account to admin (see bottom of file),
-- otherwise the /admin pages will be rejected by RLS when writing.
-- =============================================================================

begin;

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists pg_trgm;    -- fast ILIKE search (SearchOverlay)

-- -----------------------------------------------------------------------------
-- 1. ISSUES
--    Used by: page.tsx, issue/*, archive, sitemap, admin/issues/*, queries.ts
-- -----------------------------------------------------------------------------
create table if not exists public.issues (
  id            uuid primary key default gen_random_uuid(),
  title_ar      text        not null,
  theme_ar      text,
  cover_image   text,
  issue_number  integer     not null,
  publish_date  date        not null default current_date,
  status        text        not null default 'draft',
  created_at    timestamptz not null default now()
);

alter table public.issues add column if not exists title_ar     text;
alter table public.issues add column if not exists theme_ar     text;
alter table public.issues add column if not exists cover_image  text;
alter table public.issues add column if not exists issue_number integer;
alter table public.issues add column if not exists publish_date date        default current_date;
alter table public.issues add column if not exists status       text        default 'draft';
alter table public.issues add column if not exists created_at   timestamptz default now();

-- Constraints are best-effort: if existing data violates one, we log a NOTICE
-- instead of aborting the migration (so reading_time etc. still get added).
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'issues_status_check') then
    alter table public.issues
      add constraint issues_status_check check (status in ('draft','published')) not valid;
  end if;
exception when others then raise notice 'issues_status_check skipped: %', sqlerrm;
end $$;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'issues_issue_number_key') then
    alter table public.issues add constraint issues_issue_number_key unique (issue_number);
  end if;
exception when others then raise notice 'issues_issue_number_key skipped (duplicate issue numbers?): %', sqlerrm;
end $$;

create index if not exists issues_status_publish_date_idx on public.issues (status, publish_date desc);

-- -----------------------------------------------------------------------------
-- 2. ARTICLES
--    Used by: page.tsx (selects reading_time!), article/[slug], category/[slug],
--             issue/[number], SearchOverlay, sitemap, admin/write, admin/issues
-- -----------------------------------------------------------------------------
create table if not exists public.articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text        not null,
  title_ar      text        not null,
  subtitle_ar   text,
  body_ar       text        not null default '',
  cover_image   text,
  section       text        not null default 'standalone',
  issue_id      uuid references public.issues (id) on delete set null,
  status        text        not null default 'draft',
  author_name   text        default 'فريق التحرير',
  reading_time  integer,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.articles add column if not exists slug         text;
alter table public.articles add column if not exists title_ar     text;
alter table public.articles add column if not exists subtitle_ar  text;
alter table public.articles add column if not exists body_ar      text        default '';
alter table public.articles add column if not exists cover_image  text;
alter table public.articles add column if not exists section      text        default 'standalone';
alter table public.articles add column if not exists issue_id     uuid;
alter table public.articles add column if not exists status       text        default 'draft';
alter table public.articles add column if not exists author_name  text        default 'فريق التحرير';
alter table public.articles add column if not exists reading_time integer;      -- ← the reported error
alter table public.articles add column if not exists published_at timestamptz;
alter table public.articles add column if not exists created_at   timestamptz default now();
alter table public.articles add column if not exists updated_at   timestamptz default now();

-- NOTE: no CHECK on `section` on purpose — the app treats it as free text with
-- SECTION_LABELS fallbacks, and legacy rows (e.g. 'politics') must stay editable.
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'articles_slug_key') then
    alter table public.articles add constraint articles_slug_key unique (slug);
  end if;
exception when others then raise notice 'articles_slug_key skipped (duplicate slugs?): %', sqlerrm;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.articles'::regclass and contype = 'f'
      and conkey = array[(select attnum from pg_attribute
                          where attrelid = 'public.articles'::regclass and attname = 'issue_id')]
  ) then
    alter table public.articles
      add constraint articles_issue_id_fkey foreign key (issue_id)
      references public.issues (id) on delete set null not valid;
  end if;
exception when others then raise notice 'articles_issue_id_fkey skipped: %', sqlerrm;
end $$;

create index if not exists articles_status_published_at_idx on public.articles (status, published_at desc);
create index if not exists articles_section_idx            on public.articles (section);
create index if not exists articles_issue_id_idx           on public.articles (issue_id);
create index if not exists articles_title_trgm_idx         on public.articles using gin (title_ar gin_trgm_ops);
create index if not exists articles_subtitle_trgm_idx      on public.articles using gin (subtitle_ar gin_trgm_ops);

-- 2a. reading_time (minutes) + updated_at maintained automatically -------------
--     ~200 words/min, HTML tags stripped. The app only reads reading_time, so
--     the editor UI does not need to send it.
create or replace function public.articles_before_write()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  words integer;
begin
  words := coalesce(
    array_length(
      regexp_split_to_array(
        trim(regexp_replace(regexp_replace(coalesce(new.body_ar, ''), '<[^>]*>', ' ', 'g'), '\s+', ' ', 'g')),
        ' '),
      1),
    0);
  new.reading_time := greatest(1, ceil(words / 200.0)::int);
  new.updated_at   := now();
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists articles_before_write on public.articles;
create trigger articles_before_write
  before insert or update on public.articles
  for each row execute function public.articles_before_write();

-- Backfill existing rows (fires the trigger → computes reading_time).
-- Done BEFORE the status CHECK is added so legacy values can't block it.
update public.articles set body_ar = coalesce(body_ar, '') where reading_time is null;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'articles_status_check') then
    alter table public.articles
      add constraint articles_status_check check (status in ('draft','published')) not valid;
  end if;
exception when others then raise notice 'articles_status_check skipped: %', sqlerrm;
end $$;

-- -----------------------------------------------------------------------------
-- 3. SUBSCRIBERS   (newsletter/page.tsx inserts; admin/page.tsx counts)
-- -----------------------------------------------------------------------------
create table if not exists public.subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text        not null,
  verified    boolean     not null default false,
  created_at  timestamptz not null default now()
);
alter table public.subscribers add column if not exists email      text;
alter table public.subscribers add column if not exists verified   boolean     default false;
alter table public.subscribers add column if not exists created_at timestamptz default now();
do $$ begin
  create unique index if not exists subscribers_email_lower_key on public.subscribers (lower(email));
exception when others then raise notice 'subscribers_email_lower_key skipped (duplicate emails?): %', sqlerrm;
end $$;

-- -----------------------------------------------------------------------------
-- 4. PROFILES   (profile/page.tsx: .eq("user_id", …) → display_name, subscription_tier)
--    + role column = the trusted admin/editor authorization source.
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  user_id            uuid primary key references auth.users (id) on delete cascade,
  display_name       text,
  subscription_tier  text        not null default 'free',
  role               text        not null default 'reader',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
alter table public.profiles add column if not exists display_name      text;
alter table public.profiles add column if not exists subscription_tier text        default 'free';
alter table public.profiles add column if not exists role              text        default 'reader';
alter table public.profiles add column if not exists created_at        timestamptz default now();
alter table public.profiles add column if not exists updated_at        timestamptz default now();

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_subscription_tier_check') then
    alter table public.profiles add constraint profiles_subscription_tier_check
      check (subscription_tier in ('free','reader','supporter')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_role_check') then
    alter table public.profiles add constraint profiles_role_check
      check (role in ('reader','editor','admin')) not valid;
  end if;
end $$;

-- Auto-create a profile for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name',
                           new.raw_user_meta_data ->> 'full_name',
                           split_part(new.email, '@', 1)))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for users that signed up before this migration.
insert into public.profiles (user_id, display_name)
select u.id, split_part(u.email, '@', 1) from auth.users u
on conflict (user_id) do nothing;

-- Role helper used by every write policy. SECURITY DEFINER avoids RLS recursion.
create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role in ('editor','admin')
  );
$$;
revoke all on function public.is_editor() from public;
grant execute on function public.is_editor() to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 5. SAVED_ARTICLES   (profile/page.tsx: select id, article:articles(...))
-- -----------------------------------------------------------------------------
create table if not exists public.saved_articles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id)      on delete cascade,
  article_id  uuid not null references public.articles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, article_id)
);
create index if not exists saved_articles_user_id_idx on public.saved_articles (user_id);

-- -----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
alter table public.issues          enable row level security;
alter table public.articles        enable row level security;
alter table public.subscribers     enable row level security;
alter table public.profiles        enable row level security;
alter table public.saved_articles  enable row level security;

-- ISSUES: public reads published; editors read/write everything.
drop policy if exists "issues_public_read"   on public.issues;
drop policy if exists "issues_editor_all"    on public.issues;
create policy "issues_public_read" on public.issues
  for select using (status = 'published' or public.is_editor());
create policy "issues_editor_all" on public.issues
  for all to authenticated using (public.is_editor()) with check (public.is_editor());

-- ARTICLES: same model.
drop policy if exists "articles_public_read" on public.articles;
drop policy if exists "articles_editor_all"  on public.articles;
create policy "articles_public_read" on public.articles
  for select using (status = 'published' or public.is_editor());
create policy "articles_editor_all" on public.articles
  for all to authenticated using (public.is_editor()) with check (public.is_editor());

-- SUBSCRIBERS: anyone may sign up (unverified only); only editors may read/manage.
drop policy if exists "subscribers_public_insert" on public.subscribers;
drop policy if exists "subscribers_editor_all"    on public.subscribers;
create policy "subscribers_public_insert" on public.subscribers
  for insert to anon, authenticated with check (verified = false);
create policy "subscribers_editor_all" on public.subscribers
  for all to authenticated using (public.is_editor()) with check (public.is_editor());

-- PROFILES: users read their own row; may edit display_name only (role/tier are protected).
drop policy if exists "profiles_self_read"   on public.profiles;
drop policy if exists "profiles_self_update" on public.profiles;
drop policy if exists "profiles_editor_read" on public.profiles;
create policy "profiles_self_read" on public.profiles
  for select to authenticated using (user_id = auth.uid());
create policy "profiles_editor_read" on public.profiles
  for select to authenticated using (public.is_editor());
create policy "profiles_self_update" on public.profiles
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke update on public.profiles from anon, authenticated;
grant  update (display_name) on public.profiles to authenticated;

-- SAVED_ARTICLES: owner-only.
drop policy if exists "saved_articles_owner_all" on public.saved_articles;
create policy "saved_articles_owner_all" on public.saved_articles
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 7. STORAGE: article-images bucket (admin/write + admin/issues uploads)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do update set public = true;

drop policy if exists "article_images_public_read"   on storage.objects;
drop policy if exists "article_images_editor_insert" on storage.objects;
drop policy if exists "article_images_editor_update" on storage.objects;
drop policy if exists "article_images_editor_delete" on storage.objects;
create policy "article_images_public_read" on storage.objects
  for select using (bucket_id = 'article-images');
create policy "article_images_editor_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'article-images' and public.is_editor());
create policy "article_images_editor_update" on storage.objects
  for update to authenticated using (bucket_id = 'article-images' and public.is_editor());
create policy "article_images_editor_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'article-images' and public.is_editor());

commit;

-- Ask PostgREST to pick up the new columns immediately (clears the
-- "column ... does not exist" / schema-cache errors without a restart).
notify pgrst, 'reload schema';

-- =============================================================================
-- REQUIRED ONE-TIME STEP — promote your account (replace the email):
--
--   update public.profiles set role = 'admin'
--   where user_id = (select id from auth.users where email = 'you@example.com');
--
-- VERIFY:
--   select column_name, data_type from information_schema.columns
--   where table_schema = 'public' and table_name = 'articles' order by ordinal_position;
-- =============================================================================
